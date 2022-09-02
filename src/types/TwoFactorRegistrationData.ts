/**
 * Data required for the two-factor registration process.
 */
interface TwoFactorRegistrationData {
  /**
   * User's id.
   */
  userId: string

  /**
   * User's session CSRF secret.
   */
  secret: string

  /**
   * Name of the provider e.g. "TOTP".
   */
  provider: string
}

export default TwoFactorRegistrationData
