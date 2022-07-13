import ErrorAdapterInterface from "./ErrorAdapterInterface";

export default class DefaultErrorAdapter implements ErrorAdapterInterface {
  throwLoginValidationError(error: Error): void {
    throw new Error(`Login validation error:  ${error.message}`);
  }
  throwLoginError(error: Error): void {
    throw new Error(`Login error:  ${error.message}`);
  }
  throwTwoFactorProviderError(error: Error) {
    throw new Error(`Two factor provider error:  ${error.message}`);
  }
  throwRegistrationValidationError(error: Error) {
    throw new Error(`Registration validation error:  ${error.message}`);
  }

  throwRegistrationError(error: Error) {
    throw new Error(`Registration error:  ${error.message}`);
  }

  throwStorageConnectionError(error: Error) {
    throw new Error(`Storage connection error:  ${error.message}`)
  }
}