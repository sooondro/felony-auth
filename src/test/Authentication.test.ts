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
        // expect(instance.globalAuthConfig).to.be.undefined;
      });
    });
  });

  // describe("register", () => {
  //   let instance: Authentication;

  //   beforeEach(() => {
  //     instance = new Authentication();
  //   });

  //   context("when invalid passed", () => {
  //     it("should throw an error", () => {
  //       expect(instance.register({} as RegistrationData)).to.throw('ErrorAdapterInterface');
  //     });
  //     it("should throw an error", () => {
  //       expect(instance.register(wrongEmailUser)).to.throw;
  //     });
  //   });
  // });
});

const emptyUser: RegistrationData = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
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