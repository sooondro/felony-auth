/**
 * Data required for the registration process.
 */
interface RegistrationData {
  /**
   * User's username.
   */
  username: string

  /**
   * User's first name.
   */
  firstName: string

  /**
   * User's last name.
   */
  lastName: string

  /**
   * User's email.
   */
  email: string

  /**
   * User's password.
   */
  password: string

  /**
   * Two-factor authentication provider name.
   */
  twoFactorAuthenticationProvider?: string
}

export default RegistrationData
