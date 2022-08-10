import ErrorAdapterInterface from "../error/ErrorAdapterInterface";
import ValidationAdapterInterface from "./ValidationAdapterInterface";

import RegistrationData from "../types/RegistrationData";
import LoginData from "../types/LoginData";

import Validator from 'validator';

/**
 * Default validation adapter implementation.
 * 
 * @type {Class}
 */
export default class DefaultValidationAdapter implements ValidationAdapterInterface {

  constructor(private errorAdapter: ErrorAdapterInterface){}

  /**
   * Validate registration data.
   * 
   * @param {RegistrationData} payload 
   * @throws 
   */
  registration(payload: RegistrationData): void {
    if(!Validator.isEmail(payload.email)) {
      this.errorAdapter.throwRegistrationValidationError(new Error("Invalid email"));
    }

    if(!Validator.isLength(payload.password, {min: 6})) {
      this.errorAdapter.throwRegistrationValidationError(new Error("Password needs to be at least 6 characters long"));
    }
  }

  /**
   * Validate login data.
   * 
   * @param payload 
   * @throws
   */
  login(payload: LoginData): void {
    if (!Validator.isEmail(payload.email)) {
      this.errorAdapter.throwLoginValidationError(new Error("Invalid email"));
    }

    if (!Validator.isLength(payload.password, { min: 6 })) {
      this.errorAdapter.throwLoginValidationError(new Error("Password needs to be at least 6 characters long"));
    }
  }
}