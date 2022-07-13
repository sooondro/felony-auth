import ErrorAdapterInterface from "../error/ErrorAdapterInterface";
import ValidationAdapterInterface from "./ValidationAdapterInterface";

import RegistrationData from "../types/RegistrationData";
import LoginData from "../types/LoginData";

import Validator from 'validator';

export default class DefaultValidationAdapter implements ValidationAdapterInterface {

  constructor(private errorAdapter: ErrorAdapterInterface){}

  registration(payload: RegistrationData): void | Error {
    if(!Validator.isEmail(payload.email)) {
      this.errorAdapter.throwRegistrationValidationError(new Error("Invalid email"));
    }

    if(!Validator.isLength(payload.password, {min: 6})) {
      this.errorAdapter.throwRegistrationValidationError(new Error("Password needs to be at least 6 characters long"));
    }
  }

  login(payload: LoginData): void | Error {
    if (!Validator.isEmail(payload.email)) {
      this.errorAdapter.throwLoginValidationError(new Error("Invalid email"));
    }

    if (!Validator.isLength(payload.password, { min: 6 })) {
      this.errorAdapter.throwLoginValidationError(new Error("Password needs to be at least 6 characters long"));
    }
  }
  isEmail(email: string): boolean {
    throw new Error("Method not implemented.");
  }
  isEmptyString(string: string) {
    throw new Error("Method not implemented.");
  }

}