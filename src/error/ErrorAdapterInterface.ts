export default interface ErrorAdapterInterface {
  throwLoginValidationError(error: Error): void;
  throwLoginError(error: Error): void;
  throwRegistrationValidationError(error: Error): void;
  throwRegistrationError(error: Error): void;
  throwStorageConnectionError(error: Error): void;
  throwTwoFactorProviderError(error: Error): void;
  throwTwoFactorRegistrationError(error: Error): void;
  throwTwoFactorVerificationError(error: Error);
}