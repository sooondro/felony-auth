import { authenticator } from "otplib";
import AuthenticationError from "../../../src/error/AuthenticationError";

import TOTPTwoFactorProvider from "../../../src/providers/two-factor/TOTPTwoFactorProvider";
import AuthenticableTwoFactorUser from "../../../src/types/AuthenticableTwoFactorUser";
import AuthenticableUser from "../../../src/types/AuthenticableUser";

describe("TOTPTwoFactorProvider", () => {
  let twoFactorProvider: TOTPTwoFactorProvider;

  beforeAll(() => {
    twoFactorProvider = new TOTPTwoFactorProvider();
  });

  describe("generateRegistrationData", () => {
    beforeEach(() => {
      jest.spyOn(twoFactorProvider, "generateRegistrationData");
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should return a TwoFactorRegistrationData object when valid data is provided", () => {
      const user: AuthenticableUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c", // randomly generate UUIDV4
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com"
      };

      const registrationData = twoFactorProvider.generateRegistrationData(user);

      expect(twoFactorProvider.generateRegistrationData).toHaveBeenCalledTimes(1);
      expect(registrationData).toBeDefined();
      expect(registrationData.userId).toBeDefined();
      expect(registrationData.userId).toEqual(user.id);
      expect(registrationData.provider).toBeDefined();
      expect(registrationData.provider).toEqual(twoFactorProvider.provider);
      expect(registrationData.secret).toBeDefined();
    });
  });

  describe("verify", () => {
    beforeEach(() => {
      jest.spyOn(twoFactorProvider, "verify");
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should throw when invalid data is provided", () => {
      const user: AuthenticableTwoFactorUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c", // randomly generate UUIDV4
        userId: "1b0049e0-2155-4db4-a8f6-90006397fb1c", // randomly generate UUIDV4
        provider: "TOTP",
        secret: "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD"
      };

      try {
        twoFactorProvider.verify(user, "foo");
      } catch (error) {
        expect(twoFactorProvider.verify).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(AuthenticationError);
        if (error instanceof AuthenticationError) {
          expect(error.message).toEqual('invalid credentials')
        }
      }
    });

    it("should do nothing when valid data is provided", () => {
      const user: AuthenticableTwoFactorUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c", // randomly generate UUIDV4
        userId: "1b0049e0-2155-4db4-a8f6-90006397fb1c", // randomly generate UUIDV4
        provider: "TOTP",
        secret: "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD"
      };

      const token = authenticator.generate(user.secret);

      twoFactorProvider.verify(user, token);

      expect(twoFactorProvider.verify).toHaveBeenCalledTimes(1);
    });
  });

  describe("generateQRCode", () => {
    beforeEach(() => {
      jest.spyOn(twoFactorProvider, "generateQRCode");
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should return a QR code string when valid data is provided", async () => {
      const user: AuthenticableTwoFactorUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c",
        userId: "1b0049e0-2155-4db4-a8f6-90006397fb1c",
        provider: "TOTP",
        secret: "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD"
      };

      const result = await twoFactorProvider.generateQRCode(user);
      
      expect(twoFactorProvider.generateQRCode).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result).toContain("data:image/png;base64");
    });
  });
});