/**
 * Error adapter interface
 * 
 * @type {Interface}
 */
export default interface ErrorAdapterInterface {
  /**
   * Throw login validation error
   * 
   * @param {Error} error
   */
  throwLoginValidationError(error: Error): never;

  /**
   * Throw login error
   * 
   * @param {Error} error 
   */
  throwLoginError(error: Error): never;

  /**
   * Throw registration validation error
   * 
   * @param {Error} error 
   */
  throwRegistrationValidationError(error: Error): never;

  /**
   * Throw registration error
   * 
   * @param {Error} error 
   */
  throwRegistrationError(error: Error): never;

  /**
   * Throw storage connection error
   * 
   * @param {Error} error 
   */
  throwStorageConnectionError(error: Error): never;

  /**
   * Throw two-factor provider error
   * 
   * @param {Error} error 
   */
  throwTwoFactorProviderError(error: Error): never;

  /**
   * Throw two-factor registration error
   * 
   * @param {Error} error 
   */
  throwTwoFactorRegistrationError(error: Error): never;

  /**
   * Throw two-factor verification error
   * 
   * @param {Error} error 
   */
  throwTwoFactorVerificationError(error: Error): never;

  /**
   * Throw data not found error
   * 
   * @param {Error} error 
   */
  throwDataNotFoundError(error: Error): never;
}