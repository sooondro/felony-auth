import TwoFactorAuthenticationData from './TwoFactorAuthenticationData'

/**
 * Data required for login process.
 */
interface LoginData {
  /**
   * User's email.
   */
  email: string

  /**
   * User's password.
   */
  password: string

  /**
   * Flag which determines whether the 2FA process is going to be executed.
   */
  twoFactorAuthentication: boolean

  /**
   * Data required for the two-factor authentication.
   */
  twoFactorAuthenticationData?: TwoFactorAuthenticationData
}

export default LoginData
