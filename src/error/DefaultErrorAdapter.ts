import ErrorAdapterInterface from "./ErrorAdapterInterface";

/**
 * Default error adapter.
 * 
 * @type {Class}
 */
export default class DefaultErrorAdapter implements ErrorAdapterInterface {
  
  /**
   * Throw session adapter error.
   * 
   * @param {Error} error
   * @throws {Error} 
   */
  throwSessionAdapterError(error: Error): never {
    throw error;
  }

  /**
   * Throw CSRF error.
   * 
   * @param {Error} error 
   * @throws {Error}
   */
  throwCSRFError(error: Error): never {
    throw error;
  }

  /**
   * Throw data not found error.
   * 
   * @param {Error} error 
   * @throws {Error}
   */
  throwDataNotFoundError(error: Error): never {
    throw error;
  }

  /**
   * Throw two-factor verification error.
   * 
   * @param {Error} error 
   * @throws {Error}
   */
  throwTwoFactorVerificationError(error: Error): never {
    throw error;
  }

  /**
   * Throw two-factor registration error.
   * 
   * @param {Error} error 
   * @throws {Error}
   */
  throwTwoFactorRegistrationError(error: Error): never {
    throw error;
  }

  /**
   * Throw login validation error.
   * 
   * @param {Error} error 
   * @throws {Error}
   */
  throwLoginValidationError(error: Error): never {
    throw error;
  }

  /**
   * Throw login error.
   * 
   * @param {Error} error 
   * @throws {Error}
   */
  throwLoginError(error: Error): never {
    throw error;
  }

  /**
   * Throw two-factor provider error.
   * 
   * @param {Error} error 
   * @throws {Error}
   */
  throwTwoFactorProviderError(error: Error): never {
    throw error;
  }

  /**
   * Throw registration validation error.
   * 
   * @param {Error} error 
   * @throws {Error}
   */
  throwRegistrationValidationError(error: Error): never {
    throw error;
  }

  /**
   * Throw registration error.
   * 
   * @param {Error} error 
   * @throws {Error}
   */
  throwRegistrationError(error: Error): never {
    throw error;
  }

  /**
   * Throw storage connection error.
   * 
   * @param {Error} error
   * @throws {Error}
   */
  throwStorageConnectionError(error: Error): never {
    throw error;
  }

  /**
   * Throw storage adapter error.
   * 
   * @param {Error} error
   * @throws {Error} 
   */
  throwStorageAdapterError(error: Error): never {
    throw error;
  }
}