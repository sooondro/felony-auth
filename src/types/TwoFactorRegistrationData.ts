/**
 * Data required for the two-factor registration process.
 */
type TwoFactorRegistrationData = {
  /**
   * User's email.
   */
  email: string,

  /**
   * User's session CSRF secret.
   */
  secret: string,

  /**
   * Name of the provider.
   */
  provider: string,
};

export default TwoFactorRegistrationData;