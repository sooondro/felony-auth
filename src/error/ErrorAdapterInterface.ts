import Authentication from "../Authentication";
import ErrorData from "../types/ErrorData";
import AuthenticationError from "./AuthenticationError";
import { ValidationErrors } from "./ValidationError";

/**
 * Error adapter interface.
 * 
 * @type {Interface}
 */
export default interface ErrorAdapterInterface {
  /**
   * Used for injecting Authentication class into the adapter.
   * 
   * @param {Authentication} authentication 
   */
  initialize(authentication: Authentication): void;

  /**
   * Error handler function.
   * 
   * @param {string | ErrorData | Error | AuthenticationError | ValidationErrors} error 
   */
  handleError(error: string | ErrorData | Error | AuthenticationError | ValidationErrors): AuthenticationError | ValidationErrors;

  // /**
  //  * Handle function for errors generated during the registration.
  //  * 
  //  * @param {string | ErrorData | Error | AuthenticationError | ValidationError | ValidationErrors} error 
  //  */
  // handleRegistrationError(error: string | ErrorData | Error | AuthenticationError | ValidationErrors): void

  // /**
  //  * 
  //  * @param error 
  //  */
  // registration(error: Error | string | object): never;

  // /**
  //  * 
  //  * @param error 
  //  */
  // login(error: Error | string | object): never;

  // /**
  //  * Throw login validation error.
  //  * 
  //  * @param {Error} error
  //  */
  // throwLoginValidationError(error: Error): never;

  // /**
  //  * Throw login error.
  //  * 
  //  * @param {Error} error 
  //  */
  // throwLoginError(error: Error): never;

  // /**
  //  * Throw registration validation error.
  //  * 
  //  * @param {Error} error 
  //  */
  // throwRegistrationValidationError(error: Error): never;

  // /**
  //  * Throw registration error.
  //  * 
  //  * @param {Error} error 
  //  */
  // throwRegistrationError(error: Error): never;

  // /**
  //  * Throw storage connection error.
  //  * 
  //  * @param {Error} error 
  //  */
  // throwStorageConnectionError(error: Error): never;

  // /**
  //  * Throw two-factor provider error.
  //  * 
  //  * @param {Error} error 
  //  */
  // throwTwoFactorProviderError(error: Error): never;

  // /**
  //  * Throw two-factor registration error.
  //  * 
  //  * @param {Error} error 
  //  */
  // throwTwoFactorRegistrationError(error: Error): never;

  // /**
  //  * Throw two-factor verification error.
  //  * 
  //  * @param {Error} error 
  //  */
  // throwTwoFactorVerificationError(error: Error): never;

  // /**
  //  * Throw data not found error.
  //  * 
  //  * @param {Error} error 
  //  */
  // throwDataNotFoundError(error: Error): never;

  // /**
  //  * Throw CSRF error.
  //  * 
  //  * @param {Error} error
  //  */
  // throwCSRFError(error: Error): never;

  // /**
  //  * Throw session adapter error.
  //  * 
  //  * @param {Error} error
  //  */
  // throwSessionAdapterError(error: Error): never;

  // /**
  //  * Throw storage adapter error.
  //  * 
  //  * @param {Error} error 
  //  */
  // throwStorageAdapterError(error: Error): never;
}