import "mocha";
import { expect } from "chai";
import Authentication from "../Authentication";
import RegistrationData from "../types/RegistrationData";
import ErrorAdapterInterface from "../error/ErrorAdapterInterface"

describe("Authentication", () => {
  describe("Constructor", () => {
    let instance: Authentication;

    beforeEach(() => {
      instance = new Authentication();
    });

    context("When nothing is passed to the constructor", () => {
      it("should initialize default error adapter", () => {
        expect(instance.globalAuthConfig).to.be.undefined;
      });
    });
  });

  describe("register", () => {
    let instance: Authentication;

    beforeEach(() => {
      instance = new Authentication();
    });

    context("when invalid data is passed", () => {
      it("should throw an error", () => {
        expect(instance.register(emptyUser)).to.throw;
      });
      it("should throw an error when email is invalid", () => {
        expect(instance.register(wrongEmailUser)).to.throw;
      });
      it("should throw an error when no username is provided", () => {
        expect(instance.register(noUsernameUser)).to.throw;
      })
    });

    context("when valid data is passed", () => {
      it("should pass with valid data", () => {
        expect(instance.register(validUser)).to.not.throw;
      });
    });
  });
});

const emptyUser: RegistrationData = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  twoFactorAuthentication: false
}

const validUser: RegistrationData = {
  username: "testingUsername",
  firstName: "mdada",
  lastName: "kskmdskma",
  email: "test@test.com",
  password: "afsafsfafs",
  twoFactorAuthentication: false
}

const wrongEmailUser: RegistrationData = {
  username: "sandro",
  firstName: "mdada",
  lastName: "kskmdskma",
  email: "dasdasdasds",
  password: "afsafsfafs",
  twoFactorAuthentication: false
}

const noUsernameUser: RegistrationData = {
  username: "",
  firstName: "mdada",
  lastName: "kskmdskma",
  email: "test@test.com",
  password: "afsafsfafs",
  twoFactorAuthentication: false
}