import ErrorAdapterInterface from "./ErrorAdapterInterface";

/**
 * Default error adapter
 * 
 * @type {Class}
 */
export default class DefaultErrorAdapter implements ErrorAdapterInterface {

  /**
   * Throw data not found error
   * 
   * @param error 
   * @throws {Error}
   */
  throwDataNotFoundError(error: Error): never {
    throw error;
  }

  /**
   * Throw two-factor verification error
   * 
   * @param error 
   * @throws {Error}
   */
  throwTwoFactorVerificationError(error: Error): never {
    throw error;
  }

  /**
   * Throw two-factor registration error
   * 
   * @param error 
   * @throws {Error}
   */
  throwTwoFactorRegistrationError(error: Error): never {
    throw error;
  }

  /**
   * Throw login validation error
   * 
   * @param error 
   * @throws {Error}
   */
  throwLoginValidationError(error: Error): never {
    // throw new Error(`Login validation error: ${error.message}`);
    throw error;
  }

  /**
   * Throw login error
   * 
   * @param error 
   * @throws {Error}
   */
  throwLoginError(error: Error): never {
    // throw new Error(`Login error: ${error.message}`);
    throw error;
  }

  /**
   * Throw two-factor provider error
   * 
   * @param error 
   * @throws {Error}
   */
  throwTwoFactorProviderError(error: Error): never {
    // throw new Error(`Two factor provider error: ${error.message}`);
    throw error;
  }

  /**
   * Throw registration validation error
   * 
   * @param error 
   * @throws {Error}
   */
  throwRegistrationValidationError(error: Error): never {
    // throw new Error(`Registration validation error: ${error.message}`);
    throw error;
  }

  /**
   * Throw registration error
   * 
   * @param error 
   * @throws {Error}
   */
  throwRegistrationError(error: Error): never {
    // throw new Error(`Registration error: ${error.message}`);
    throw error;
  }

  /**
   * Throw storage connection error
   * 
   * @param error
   * @throws {Error}
   */
  throwStorageConnectionError(error: Error): never {
    // throw new Error(`Storage connection error: ${error.message}`)
    throw error;
  }
}