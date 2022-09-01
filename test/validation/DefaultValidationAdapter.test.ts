import DefaultValidationAdapter from "../../src/validation/DefaultValidationAdapter";
import Validator from "validator";
import RegistrationData from "../../src/types/RegistrationData";
import { ValidationErrors } from "../../src/error/ValidationError";
import LoginData from "../../src/types/LoginData";
import Authentication from "../../src/Authentication";

/**
 * Test for DefaultValidationAdapter registration method
 */
describe("DefaultValidationAdapter", () => {
  describe("registration", () => {
    const validationAdapter = new DefaultValidationAdapter();
  
    beforeEach(() => {
      jest.spyOn(Validator, "isEmail");
      jest.spyOn(Validator, "isLength");
      jest.spyOn(ValidationErrors.prototype, "addError");
      jest.spyOn(ValidationErrors.prototype, "hasErrors");
      jest.spyOn(validationAdapter, "registration");
    });
  
    afterEach(() => {
      // restore the spy created with spyOn
      jest.restoreAllMocks();
    });
  
    it("should add an error and throw validation errors when invalid email is provided", () => {
      const payload: RegistrationData = {
        username: "test",
        firstName: "testko",
        lastName: "testic",
        email: "invalid",
        password: "password"
      };
  
      // vako testiras kad nesto throwa ili opcenito kad testiras throwanje
      try {
        validationAdapter.registration(payload);
  
        fail();
      } catch (e) {
        expect(Validator.isEmail).toHaveBeenCalledTimes(1);
        expect(Validator.isLength).toHaveBeenCalledTimes(1);
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledTimes(1);
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledWith("email", "email");
        expect(ValidationErrors.prototype.hasErrors).toHaveBeenCalledTimes(1);
        expect(validationAdapter.registration).toThrow();
        expect(validationAdapter.registration).toHaveBeenCalledWith(payload);
      }
    });
  
    it("should add an error and throw validation errors when invalid password is provided", () => {
      const payload: RegistrationData = {
        username: "test",
        firstName: "testko",
        lastName: "testic",
        email: "test@test.com",
        password: "pass"
      };
  
      try {
        validationAdapter.registration(payload);
  
        fail();
      } catch (e) {
        expect(Validator.isEmail).toHaveBeenCalledTimes(1);
        expect(Validator.isLength).toHaveBeenCalledTimes(1);
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledTimes(1);
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledWith("password", "min:6");
        expect(ValidationErrors.prototype.hasErrors).toHaveBeenCalledTimes(1);
        expect(validationAdapter.registration).toThrow();
        expect(validationAdapter.registration).toHaveBeenCalledWith(payload);
      }
    });
  
    it("should add errors and throw validation errors when invalid email and password is provided", () => {
      const payload: RegistrationData = {
        username: "test",
        firstName: "testko",
        lastName: "testic",
        email: "invalid",
        password: "pass"
      };
  
      try {
        validationAdapter.registration(payload);
  
        fail();
      } catch (e) {
        expect(Validator.isEmail).toHaveBeenCalledTimes(1);
        expect(Validator.isLength).toHaveBeenCalledTimes(1);
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledTimes(2);
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledWith("email", "email");
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledWith("password", "min:6");
        expect(ValidationErrors.prototype.hasErrors).toHaveBeenCalledTimes(1);
        expect(validationAdapter.registration).toThrow();
        expect(validationAdapter.registration).toHaveBeenCalledWith(payload);
      }
    })
  
    it("should do nothing when data is valid", () => {
      const payload: RegistrationData = {
        username: "test",
        firstName: "testko",
        lastName: "testic",
        email: "test@test.com",
        password: "password"
      };
  
      validationAdapter.registration(payload);
  
      expect(Validator.isEmail).toHaveBeenCalledTimes(1);
      expect(Validator.isLength).toHaveBeenCalledTimes(1);
      expect(ValidationErrors.prototype.hasErrors).toHaveBeenCalledTimes(1);
      expect(validationAdapter.registration).toHaveBeenCalledWith(payload);
    });
  });
  
  /**
   * Test for DefaultValidationAdapter login method
   */
  describe("login", () => {
  
    const validationAdapter = new DefaultValidationAdapter();
  
    beforeEach(() => {
      jest.spyOn(Validator, "isEmail");
      jest.spyOn(Validator, "isLength");
      jest.spyOn(ValidationErrors.prototype, "addError");
      jest.spyOn(ValidationErrors.prototype, "hasErrors");
      jest.spyOn(validationAdapter, "login");
    });
  
    afterEach(() => {
      // restore the spy created with spyOn
      jest.restoreAllMocks();
    });
  
    it("should add an error and throw validation errors when invalid email is provided", () => {
      const payload: LoginData = {
        email: "invalid",
        password: "password",
      };
  
      // vako testiras kad nesto throwa ili opcenito kad testiras throwanje
      try {
        validationAdapter.login(payload);
  
        fail();
      } catch (e) {
        expect(Validator.isEmail).toHaveBeenCalledTimes(1);
        expect(Validator.isLength).toHaveBeenCalledTimes(1);
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledTimes(1);
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledWith("email", "email");
        expect(ValidationErrors.prototype.hasErrors).toHaveBeenCalledTimes(1);
        expect(validationAdapter.login).toThrow();
        expect(validationAdapter.login).toHaveBeenCalledWith(payload);
      }
    });
  
    it("should add an error and throw validation errors when invalid password is provided", () => {
      const payload: LoginData = {
        email: "test@test.com",
        password: "pass",
      };
  
      try {
        validationAdapter.login(payload);
  
        fail();
      } catch (e) {
        expect(Validator.isEmail).toHaveBeenCalledTimes(1);
        expect(Validator.isLength).toHaveBeenCalledTimes(1);
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledTimes(1);
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledWith("password", "min:6");
        expect(ValidationErrors.prototype.hasErrors).toHaveBeenCalledTimes(1);
        expect(validationAdapter.login).toThrow();
        expect(validationAdapter.login).toHaveBeenCalledWith(payload);
      }
    });
  
    it("should add errors and throw validation errors when invalid email and password is provided", () => {
      const payload: LoginData = {
        email: "invalid",
        password: "pass",
      };
  
      try {
        validationAdapter.login(payload);
  
        fail();
      } catch (e) {
        expect(Validator.isEmail).toHaveBeenCalledTimes(1);
        expect(Validator.isLength).toHaveBeenCalledTimes(1);
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledTimes(2);
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledWith("email", "email");
        expect(ValidationErrors.prototype.addError).toHaveBeenCalledWith("password", "min:6");
        expect(ValidationErrors.prototype.hasErrors).toHaveBeenCalledTimes(1);
        expect(validationAdapter.login).toThrow();
        expect(validationAdapter.login).toHaveBeenCalledWith(payload);
      }
    })
  
    it("should do nothing when data is valid", () => {
      const payload: LoginData = {
        email: "test@test.com",
        password: "password",
      };
  
      validationAdapter.login(payload);
  
      expect(Validator.isEmail).toHaveBeenCalledTimes(1);
      expect(Validator.isLength).toHaveBeenCalledTimes(1);
      expect(ValidationErrors.prototype.hasErrors).toHaveBeenCalledTimes(1);
      expect(validationAdapter.login).toHaveBeenCalledWith(payload);
    });
  });
  
  
  describe("initialization", () => {
    const authentication = new Authentication();
    const validationAdapter = new DefaultValidationAdapter();
  
    beforeEach(() => {
      jest.spyOn(validationAdapter, "initialize");
    })
  
    it("should set the authentication property", () => {
      validationAdapter.initialize(authentication);
  
      expect(validationAdapter.initialize).toHaveBeenCalledWith(authentication);
      expect(validationAdapter['authentication']).toBeDefined();
      expect(validationAdapter['authentication']).toEqual(authentication);
    });
  });
});

// describe("nesto", () => {
//   it("nesto xrugo", () => {

//   });
//   it("drugi")
// })

// jest.spyOn(defaultValidatorObject).spyOn("nekaMetoda").mockImplementation(() => {  return 2 })