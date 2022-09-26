/**
 * Data required for the two-factor authentication process.
 */
interface TwoFactorAuthenticationData {
  /**
   * CSRF token sent by the user.
   */
  code: string

  /**
   * Name of the used provided e.g. "TOTP"
   */
  provider: string
}

export default TwoFactorAuthenticationData
