import ErrorAdapterInterface from "./ErrorAdapterInterface";

export default class DefaultErrorAdapter implements ErrorAdapterInterface {
  throwTwoFactorVerificationError(error: Error) {
    throw error;
  }
  throwTwoFactorRegistrationError(error: Error): void {
    throw error;
  }
  throwLoginValidationError(error: Error): void {
    // throw new Error(`Login validation error: ${error.message}`);
    throw error;

  }
  throwLoginError(error: Error): void {
    // throw new Error(`Login error: ${error.message}`);
    throw error;
  }
  throwTwoFactorProviderError(error: Error) {
    // throw new Error(`Two factor provider error: ${error.message}`);
    throw error;
  }
  throwRegistrationValidationError(error: Error) {
    // throw new Error(`Registration validation error: ${error.message}`);
    throw error;
  }

  throwRegistrationError(error: Error) {
    // throw new Error(`Registration error: ${error.message}`);
    throw error;
  }

  throwStorageConnectionError(error: Error) {
    // throw new Error(`Storage connection error: ${error.message}`)
    throw error;
  }
}