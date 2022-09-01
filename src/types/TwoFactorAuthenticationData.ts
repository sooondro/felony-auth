/**
 * Data required for the two-factor authentication process.
 */
interface TwoFactorAuthenticationData {
  /**
   * CSRF token sent by the user.
   */
  code: string
}

export default TwoFactorAuthenticationData
