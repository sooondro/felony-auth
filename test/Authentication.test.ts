import { authenticator } from "otplib";

import Authentication from "../src/Authentication";
import { ValidationErrors } from "../src/error/ValidationError";
import PostgresAdapter from "../src/storage/postgres/PostgresAdapter";
import DefaultErrorAdapter from "../src/error/DefaultErrorAdapter";
import DefaultValidationAdapter from "../src/validation/DefaultValidationAdapter";
import TOTPTwoFactorProvider from "../src/providers/two-factor/TOTPTwoFactorProvider";
import RedisAdapter from "../src/cache/redis/RedisAdapter";
import AuthenticationError from "../src/error/AuthenticationError";

import AuthenticableUser from "../src/types/AuthenticableUser";
import RegistrationData from "../src/types/RegistrationData";
import LoginData from "../src/types/LoginData";
import AuthenticableTwoFactorUser from "../src/types/AuthenticableTwoFactorUser";

describe("Authentication", () => {
  let authentication: Authentication;
  let postgresAdapter: PostgresAdapter;
  let redisAdapter: RedisAdapter;

  describe("register", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "register");
      jest.spyOn(authentication.ValidationAdapter, "registration");
      jest.spyOn(authentication.StorageAdapter, "register");
      jest.spyOn(authentication, "registerTwoFactorUser");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });

    it("should throw ValidationErrors if invalid data is provided", async () => {
      const payload: RegistrationData = {
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: ""
      };

      try {
        await authentication.register(payload);
        fail();
      } catch (error) {
        expect(authentication.register).toHaveBeenCalledTimes(1);
        expect(authentication.ValidationAdapter.registration).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.register).toHaveBeenCalledTimes(0);
        expect(authentication.registerTwoFactorUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(ValidationErrors);
      }
    });

    it("should handle the error correctly when storageAdapter register method throws", async () => {
      const payload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar"
      };

      jest.spyOn(authentication.StorageAdapter, "register").mockImplementationOnce(() => {
        throw new ValidationErrors();
      });

      try {
        await authentication.register(payload);
        fail();
      } catch (error) {
        expect(authentication.register).toHaveBeenCalledTimes(1);
        expect(authentication.ValidationAdapter.registration).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.register).toHaveBeenCalledTimes(1);
        expect(authentication.registerTwoFactorUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(ValidationErrors);
      }
    });

    it("should handle the error correctly when registerTwoFactorUser method throws", async () => {
      const payload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        twoFactorAuthenticationProvider: "TOTP",
      };

      jest.spyOn(authentication, "registerTwoFactorUser").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.register(payload);
        fail();
      } catch (error) {
        expect(authentication.register).toHaveBeenCalledTimes(1);
        expect(authentication.ValidationAdapter.registration).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.register).toHaveBeenCalledTimes(1);
        expect(authentication.registerTwoFactorUser).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should return an object with only user defined when twoFactorAuthenticationProvider is not set and valid data is provided", async () => {
      const payload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        
      };

      const result = await authentication.register(payload);

      expect(authentication.register).toHaveBeenCalledTimes(1);
      expect(authentication.ValidationAdapter.registration).toHaveBeenCalledTimes(1);
      expect(authentication.StorageAdapter.register).toHaveBeenCalledTimes(1);
      expect(authentication.registerTwoFactorUser).toHaveBeenCalledTimes(0);
      expect(result.user).toBeDefined();
      expect(result.qrCode).toBeUndefined();
      expect(result.twoFactorUser).toBeUndefined();
      expect(result.user.username).toEqual(payload.username);
      expect(result.user.firstName).toEqual(payload.firstName);
      expect(result.user.lastName).toEqual(payload.lastName);
      expect(result.user.email).toEqual(payload.email);
    });

    it(`should return an object with AuthenticableUser, QRCode, and AuthenticableTwoFactorUser defined
      when twoFactorAuthenticationProvider is set and valid data is provided`, async () => {
      const payload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        twoFactorAuthenticationProvider: "TOTP",
      };

      const result = await authentication.register(payload);

      expect(authentication.register).toHaveBeenCalledTimes(1);
      expect(authentication.ValidationAdapter.registration).toHaveBeenCalledTimes(1);
      expect(authentication.StorageAdapter.register).toHaveBeenCalledTimes(1);
      expect(authentication.registerTwoFactorUser).toHaveBeenCalledTimes(1);
      expect(result.user).toBeDefined();
      expect(result.qrCode).toBeDefined();
      expect(result.twoFactorUser).toBeDefined();
      expect(result.user.username).toEqual(payload.username);
      expect(result.user.firstName).toEqual(payload.firstName);
      expect(result.user.lastName).toEqual(payload.lastName);
      expect(result.user.email).toEqual(payload.email);
      expect(result.twoFactorUser?.userId).toEqual(result.user.id);
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "login");
      jest.spyOn(authentication.ValidationAdapter, "login");
      jest.spyOn(authentication.StorageAdapter, "login");
      jest.spyOn(authentication.StorageAdapter, "getTwoFactorUser");
      jest.spyOn(authentication.CacheAdapter, "createSession");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });

    it("should throw ValidationErrors when invalid data is provided", async () => {
      const payload: LoginData = {
        email: "",
        password: ""
      };

      try {
        await authentication.login(payload);
      } catch (error) {
        expect(authentication.login).toHaveBeenCalledTimes(1);
        expect(authentication.ValidationAdapter.login).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.login).toHaveBeenCalledTimes(0);
        expect(authentication.StorageAdapter.getTwoFactorUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(ValidationErrors);
      }
    });

    it("should handle the error correctly when storageAdapter login method throws", async () => {
      const payload: LoginData = {
        email: "foo@bar.com",
        password: "foobar"
      };

      jest.spyOn(authentication.StorageAdapter, "login").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.login(payload);
      } catch (error) {
        expect(authentication.login).toHaveBeenCalledTimes(1);
        expect(authentication.ValidationAdapter.login).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.login).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.getTwoFactorUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should return a session ID when valid data is provided", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
      };

      await authentication.register(registrationPayload);

      const loginPayload: LoginData = {
        email: "foo@bar.com",
        password: "foobar",
        
      };

      const result = await authentication.login(loginPayload);

      expect(authentication.login).toHaveBeenCalledTimes(1);
      expect(authentication.ValidationAdapter.login).toHaveBeenCalledTimes(1);
      expect(authentication.StorageAdapter.login).toHaveBeenCalledTimes(1);
      expect(authentication.StorageAdapter.getTwoFactorUser).toHaveBeenCalledTimes(0);
      expect(result).toBeDefined();
    });

    it("should return a session ID when 2fa provider is set and valid data is provided", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        twoFactorAuthenticationProvider: "TOTP",
      };

      const {user} = await authentication.register(registrationPayload);

      const twoFactorUser = await authentication.getTwoFactorUser(user);

      const loginPayload: LoginData = {
        email: "foo@bar.com",
        password: "foobar",
        twoFactorAuthenticationData: {
          provider: "TOTP",
          code: authenticator.generate(twoFactorUser.secret)
        }
      };

      const result = await authentication.login(loginPayload);

      expect(authentication.login).toHaveBeenCalledTimes(1);
      expect(authentication.ValidationAdapter.login).toHaveBeenCalledTimes(1);
      expect(authentication.StorageAdapter.login).toHaveBeenCalledTimes(1);
      expect(authentication.StorageAdapter.getTwoFactorUser).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });
  });

  describe("registerTwoFactorUser", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "registerTwoFactorUser");
      jest.spyOn(authentication.getTwoFactorProvider("TOTP"), "generateRegistrationData");
      jest.spyOn(authentication.getTwoFactorProvider("TOTP"), "generateQRCode");
      jest.spyOn(authentication.StorageAdapter, "registerTwoFactorUser");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });

    it("should handle the error correctly when twoFactorProvider generateRegistrationData method throws", async () => {
      const payload: AuthenticableUser = {
        id: "",
        username: "",
        firstName: "",
        lastName: "",
        email: ""
      };

      jest.spyOn(authentication.getTwoFactorProvider("TOTP"), "generateRegistrationData").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.registerTwoFactorUser(payload, "TOTP");
      } catch (error) {
        expect(authentication.registerTwoFactorUser).toHaveBeenCalledTimes(1);
        expect(authentication.getTwoFactorProvider("TOTP").generateRegistrationData).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.registerTwoFactorUser).toHaveBeenCalledTimes(0);
        expect(authentication.getTwoFactorProvider("TOTP").generateQRCode).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should handle the error correctly when storageAdapter registerTwoFactorUser method throws", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        
      };

      const user = await authentication.register(registrationPayload);

      jest.spyOn(authentication.StorageAdapter, "registerTwoFactorUser").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.registerTwoFactorUser(user.user, "TOTP");
      } catch (error) {
        expect(authentication.registerTwoFactorUser).toHaveBeenCalledTimes(1);
        expect(authentication.getTwoFactorProvider("TOTP").generateRegistrationData).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.registerTwoFactorUser).toHaveBeenCalledTimes(1);
        expect(authentication.getTwoFactorProvider("TOTP").generateQRCode).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should handle the error correctly when twoFactorProvider generateQRCode method throws", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        
      };

      const user = await authentication.register(registrationPayload);

      jest.spyOn(authentication.getTwoFactorProvider("TOTP"), "generateQRCode").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.registerTwoFactorUser(user.user, "TOTP");
      } catch (error) {
        expect(authentication.registerTwoFactorUser).toHaveBeenCalledTimes(1);
        expect(authentication.getTwoFactorProvider("TOTP").generateRegistrationData).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.registerTwoFactorUser).toHaveBeenCalledTimes(1);
        expect(authentication.getTwoFactorProvider("TOTP").generateQRCode).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should return an AuthenticableTwoFactorUser object and a QR code when data is valid", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        
      };

      const user = await authentication.register(registrationPayload);

      const result = await authentication.registerTwoFactorUser(user.user, "TOTP");

      expect(authentication.registerTwoFactorUser).toHaveBeenCalledTimes(1);
      expect(authentication.getTwoFactorProvider("TOTP").generateRegistrationData).toHaveBeenCalledTimes(1);
      expect(authentication.StorageAdapter.registerTwoFactorUser).toHaveBeenCalledTimes(1);
      expect(authentication.getTwoFactorProvider("TOTP").generateQRCode).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result.qrCode).toBeDefined();
      expect(result.twoFactorUser).toBeDefined();
    });
  });

  describe("registerTwoFactorUserBySessionId", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "registerTwoFactorUser");
      jest.spyOn(authentication, "registerTwoFactorUserBySessionId");
      jest.spyOn(authentication.CacheAdapter, "getSession");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });

    it("should handle the error correctly when cacheAdapter getSession method throws", async () => {
      jest.spyOn(authentication.CacheAdapter, "getSession").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.registerTwoFactorUserBySessionId("foobar", "TOTP");
      } catch (error) {
        expect(authentication.registerTwoFactorUserBySessionId).toHaveBeenCalledTimes(1);
        expect(authentication.CacheAdapter.getSession).toHaveBeenCalledTimes(1);
        expect(authentication.registerTwoFactorUser).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should handle the error correctly when registerTwoFactorUser method throws", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        
      };

      await authentication.register(registrationPayload);

      const loginPayload: LoginData = {
        email: "foo@bar.com",
        password: "foobar"
      };

      const sessionId = await authentication.login(loginPayload);

      jest.spyOn(authentication, "registerTwoFactorUser").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.registerTwoFactorUserBySessionId(sessionId, "TOTP");
      } catch (error) {
        expect(authentication.registerTwoFactorUserBySessionId).toHaveBeenCalledTimes(1);
        expect(authentication.CacheAdapter.getSession).toHaveBeenCalledTimes(1);
        expect(authentication.registerTwoFactorUser).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should return an AuthenticableTwoFactorUser object and a QR code when valid data is provided", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        
      };

      await authentication.register(registrationPayload);

      const loginPayload: LoginData = {
        email: "foo@bar.com",
        password: "foobar"
      };

      const sessionId = await authentication.login(loginPayload);

      const result = await authentication.registerTwoFactorUserBySessionId(sessionId, "TOTP");

      expect(authentication.registerTwoFactorUserBySessionId).toHaveBeenCalledTimes(1);
      expect(authentication.CacheAdapter.getSession).toHaveBeenCalledTimes(1);
      expect(authentication.registerTwoFactorUser).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result.qrCode).toBeDefined();
      expect(result.twoFactorUser).toBeDefined();
    });
  });

  describe("verifyTwoFactorUser", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "verifyTwoFactorUser");
      jest.spyOn(authentication.getTwoFactorProvider("TOTP"), "verify");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });

    it("should handle the error correctly when twoFactorProvider verify method throws", async () => {
      jest.spyOn(authentication.getTwoFactorProvider("TOTP"), "verify").mockImplementationOnce(() => {
        throw "foobar";
      });

      const payload: AuthenticableTwoFactorUser = {
        id: "",
        userId: "",
        provider: "",
        secret: ""
      };

      try {
        await authentication.verifyTwoFactorUser(payload, "foobar", "TOTP");
      } catch (error) {
        expect(authentication.verifyTwoFactorUser).toHaveBeenCalledTimes(1);
        expect(authentication.getTwoFactorProvider("TOTP").verify).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should do nothing when the user is successfully verified", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        
      };

      await authentication.register(registrationPayload);

      const loginPayload: LoginData = {
        email: "foo@bar.com",
        password: "foobar"
      };

      const sessionId = await authentication.login(loginPayload);

      const result = await authentication.registerTwoFactorUserBySessionId(sessionId, "TOTP");

      await authentication.verifyTwoFactorUser(result.twoFactorUser, authenticator.generate(result.twoFactorUser.secret), "TOTP");

      expect(authentication.verifyTwoFactorUser).toHaveBeenCalledTimes(1);
      expect(authentication.getTwoFactorProvider("TOTP").verify).toHaveBeenCalledTimes(1);
    });
  });

  describe("verifyTwoFactorUserByAuthenticableUser", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "verifyTwoFactorUserByAuthenticableUser");
      jest.spyOn(authentication.StorageAdapter, "getTwoFactorUser");
      jest.spyOn(authentication.getTwoFactorProvider("TOTP"), "verify");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });

    it("should handle the error correctly when storageAdapter getTwoFactorUser method throws", async () => {
      const user: AuthenticableUser = {
        id: "",
        username: "",
        firstName: "",
        lastName: "",
        email: ""
      };

      jest.spyOn(authentication.StorageAdapter, "getTwoFactorUser").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.verifyTwoFactorUserByAuthenticableUser(user, "foobar", "TOTP");
      } catch (error) {
        expect(authentication.verifyTwoFactorUserByAuthenticableUser).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.getTwoFactorUser).toHaveBeenCalledTimes(1);
        expect(authentication.getTwoFactorProvider("TOTP").verify).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should handle the error correctly when twoFactorProvider verify method throws", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        
      };

      const user = await authentication.register(registrationPayload);

      const loginPayload: LoginData = {
        email: "foo@bar.com",
        password: "foobar"
      };

      const sessionId = await authentication.login(loginPayload);

      await authentication.registerTwoFactorUserBySessionId(sessionId, "TOTP");

      jest.spyOn(authentication.getTwoFactorProvider("TOTP"), "verify").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.verifyTwoFactorUserByAuthenticableUser(user.user, "foobar", "TOTP");
      } catch (error) {
        expect(authentication.verifyTwoFactorUserByAuthenticableUser).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.getTwoFactorUser).toHaveBeenCalledTimes(1);
        expect(authentication.getTwoFactorProvider("TOTP").verify).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should do nothing when valid data is provided", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        
      };

      const user = await authentication.register(registrationPayload);

      const loginPayload: LoginData = {
        email: "foo@bar.com",
        password: "foobar"
      };

      const sessionId = await authentication.login(loginPayload);

      const result = await authentication.registerTwoFactorUserBySessionId(sessionId, "TOTP");

      await authentication.verifyTwoFactorUserByAuthenticableUser(user.user, authenticator.generate(result.twoFactorUser.secret), "TOTP");

      expect(authentication.verifyTwoFactorUserByAuthenticableUser).toHaveBeenCalledTimes(1);
      expect(authentication.StorageAdapter.getTwoFactorUser).toHaveBeenCalledTimes(1);
      expect(authentication.getTwoFactorProvider("TOTP").verify).toHaveBeenCalledTimes(1);
    });
  });

  describe("validateCSRFToekn", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "validateCSRFToken");
      jest.spyOn(authentication.CacheAdapter, "validateCSRF");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });

    it("should handle the error correctly when cacheAdapter validateCSRF method throws", async () => {
      jest.spyOn(authentication.CacheAdapter, "validateCSRF").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.validateCSRFToken("foobar", "foobar");
      } catch (error) {
        expect(authentication.validateCSRFToken).toHaveBeenCalledTimes(1);
        expect(authentication.CacheAdapter.validateCSRF).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should do nothing when valid data is provided", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        
      };

      await authentication.register(registrationPayload);

      const loginPayload: LoginData = {
        email: "foo@bar.com",
        password: "foobar"
      };

      const sessionId = await authentication.login(loginPayload);

      const session = await authentication.getSession(sessionId);

      await authentication.validateCSRFToken(sessionId, session.csrf);

      expect(authentication.validateCSRFToken).toHaveBeenCalledTimes(1);
      expect(authentication.CacheAdapter.validateCSRF).toHaveBeenCalledTimes(1);
    });
  });

  describe("logout", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "logout");
      jest.spyOn(authentication.CacheAdapter, "logout");
      jest.spyOn(authentication.ErrorAdapter, "handleError");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });

    it("should remove the sesion with the given id", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar"
      };

      await authentication.register(registrationPayload);

      const loginPayload: LoginData = {
        email: "foo@bar.com",
        password: "foobar"
      };

      const sessionId = await authentication.login(loginPayload);
      await authentication.logout(sessionId);

      try {
        await authentication.CacheAdapter.getSession(sessionId);

      } catch (error) {
        expect(authentication.logout).toHaveBeenCalledTimes(1);
        expect(authentication.CacheAdapter.logout).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(AuthenticationError);
        if (error instanceof AuthenticationError) {
          expect(error.message).toEqual('invalid credentials')
        }
      }
    });
  });

  describe("getSession", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "getSession");
      jest.spyOn(authentication.CacheAdapter, "getSession");
      jest.spyOn(authentication.ErrorAdapter, "handleError");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });


    it("should handle the error correctly when cacheAdapter getSession method throws", async () => {
      jest.spyOn(authentication.CacheAdapter, "getSession").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.getSession("foobar");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect(authentication.getSession).toHaveBeenCalledTimes(1);
        expect(authentication.CacheAdapter.getSession).toHaveBeenCalledTimes(1);
        expect(authentication.ErrorAdapter.handleError).toHaveBeenCalledTimes(1);

      }
    });

    it("should return a Session object when valid sessionId is provided", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar"
      };

      await authentication.register(registrationPayload);

      const loginPayload: LoginData = {
        email: "foo@bar.com",
        password: "foobar"
      };

      const sessionId = await authentication.login(loginPayload);

      const session = await authentication.getSession(sessionId);

      expect(authentication.getSession).toHaveBeenCalledTimes(1);
      expect(authentication.CacheAdapter.getSession).toHaveBeenCalledTimes(1);
      expect(session).toBeDefined();
    });
  });

  describe("createSession", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "createSession");
      jest.spyOn(authentication.CacheAdapter, "createSession");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });

    it("should handle the error correctly when cacheAdapter createSession throws", async () => {
      const payload: AuthenticableUser = {
        id: "",
        username: "",
        firstName: "",
        lastName: "",
        email: ""
      };

      jest.spyOn(authentication.CacheAdapter, "createSession").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.createSession(payload);
      } catch (error) {
        expect(authentication.createSession).toHaveBeenCalledTimes(1);
        expect(authentication.CacheAdapter.createSession).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should return a newly created session id when valid data is provided", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
      };

      const user = await authentication.register(registrationPayload);

      const sessionId = await authentication.createSession(user.user);

      const session = await authentication.getSession(sessionId);

      expect(authentication.createSession).toHaveBeenCalledTimes(1);
      expect(authentication.CacheAdapter.createSession).toHaveBeenCalledTimes(1);
      expect(session).toBeDefined();
    });
  });

  describe("changePassword", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "changePassword");
      jest.spyOn(authentication.StorageAdapter, "changePassword");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });

    it("should handle the error correctly when storageAdapter changePassword method throws", async () => {
      jest.spyOn(authentication.StorageAdapter, "changePassword").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.changePassword("foo", "bar", "baz");
      } catch (error) {
        expect(authentication.changePassword).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.changePassword).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should change the user's password when valid data is provided", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar"
      };

      await authentication.register(registrationPayload);

      await authentication.changePassword(registrationPayload.email, registrationPayload.password, "barbaz");

      expect(authentication.changePassword).toHaveBeenCalledTimes(1);
      expect(authentication.StorageAdapter.changePassword).toHaveBeenCalledTimes(1);
    });
  });

  describe("getTwoFactorUser", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "getTwoFactorUser");
      jest.spyOn(authentication.StorageAdapter, "getTwoFactorUser");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });

    it("should handle the error correctly when storageAdapter getTwoFactorUser method throws", async () => {
      const payload: AuthenticableUser = {
        id: "",
        username: "",
        firstName: "",
        lastName: "",
        email: ""
      };

      jest.spyOn(authentication.StorageAdapter, "getTwoFactorUser").mockImplementationOnce(() => {
        throw "foobar";
      });

      try {
        await authentication.getTwoFactorUser(payload);
      } catch (error) {
        expect(authentication.getTwoFactorUser).toHaveBeenCalledTimes(1);
        expect(authentication.StorageAdapter.getTwoFactorUser).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should return an AuthenticableTwoFactorUser object when valid data is provided", async () => {
      const payload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        twoFactorAuthenticationProvider: 'TOTP',
      };

      const result = await authentication.register(payload);

      const twoFactorUser = await authentication.getTwoFactorUser(result.user);

      expect(authentication.getTwoFactorUser).toHaveBeenCalledTimes(1);
      expect(authentication.StorageAdapter.getTwoFactorUser).toHaveBeenCalledTimes(1);
      expect(twoFactorUser).toBeDefined();
    });
  });

  describe("getUsersTwoFactorProviders", () => {
    beforeEach(async () => {
      authentication = new Authentication();
      postgresAdapter = new PostgresAdapter();
      await postgresAdapter.setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
      const errorAdapter = new DefaultErrorAdapter();
      const validationAdapter = new DefaultValidationAdapter();
      const twoFactorProvider = new TOTPTwoFactorProvider();
      redisAdapter = new RedisAdapter();
      await redisAdapter.setupConnectionWithConnectionString("redis://localhost:6379");
      authentication.CacheAdapter = redisAdapter;
      authentication.addTwoFactorProvider(twoFactorProvider);
      authentication.StorageAdapter = postgresAdapter;
      authentication.ErrorAdapter = errorAdapter;
      authentication.ValidationAdapter = validationAdapter;

      jest.spyOn(authentication, "getUsersTwoFactorProviders");
      jest.spyOn(authentication.StorageAdapter, "getUsersTwoFactorProvidersByEmail");

      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
      await postgresAdapter.models.User.destroy({ where: {} });
    });

    afterEach(async () => {
      await redisAdapter['client'].flushAll();
      redisAdapter["client"].quit();
      jest.resetAllMocks();
    });

    it("should handle the error correctly when storageAdapter getUsersTwoFactorProvidersByEmail method throws", async () => {
      jest.spyOn(authentication.StorageAdapter, "getUsersTwoFactorProvidersByEmail").mockImplementationOnce(() => {
        throw "foobar";
      });
      
      try {
        await authentication.getUsersTwoFactorProviders("foo@bar.com");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect(authentication.StorageAdapter.getUsersTwoFactorProvidersByEmail).toHaveBeenCalledTimes(1);
        expect(authentication.getUsersTwoFactorProviders).toHaveBeenCalledTimes(1);
      }
    });

    it("should throw ValidationErrors when a nonexistent email is provided", async () => {
      try {
        
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationErrors);
        expect(authentication.StorageAdapter.getUsersTwoFactorProvidersByEmail).toHaveBeenCalledTimes(1);
        expect(authentication.getUsersTwoFactorProviders).toHaveBeenCalledTimes(1);
      }
    });

    it("should return an array of providers names that are enabled for the given email", async () => {
      const registrationPayload: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
      };

      await authentication.register(registrationPayload);

      const providers = await authentication.getUsersTwoFactorProviders("foo@bar.com");

      expect(authentication.StorageAdapter.getUsersTwoFactorProvidersByEmail).toHaveBeenCalledTimes(1);
      expect(authentication.getUsersTwoFactorProviders).toHaveBeenCalledTimes(1);
      expect(providers.length).toEqual(0);
    });
  });
});