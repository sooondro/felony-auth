import ValidationAdapterInterface from "./ValidationAdapterInterface";

import RegistrationData from "../types/RegistrationData";
import LoginData from "../types/LoginData";

import Validator from 'validator';
import Authentication from "../Authentication";

/**
 * Default validation adapter implementation.
 * 
 * @type {Class}
 */
export default class DefaultValidationAdapter implements ValidationAdapterInterface {
  private authentication!: Authentication;
  
  /**
   * Used for injecting Authentication class into the adapter
   * 
   * @param {Authentication} authentication 
   */
  initialize(authentication: Authentication): void {
    this.authentication = authentication;
  }

  /**
   * Validate registration data.
   * 
   * @param {RegistrationData} payload 
   * @throws 
   */
  registration(payload: RegistrationData): void {
    if(!Validator.isEmail(payload.email)) {
      throw "Invalid email";
    }

    if(!Validator.isLength(payload.password, {min: 6})) {
      throw "Password needs to be at least 6 characters long";
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
      throw "Invalid email";
    }

    if (!Validator.isLength(payload.password, { min: 6 })) {
      throw "Password needs to be at least 6 characters long";
    }
  }
}