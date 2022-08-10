/**
 * Authenticable two-factor user.
 */
type AuthenticableTwoFactorUser = {
  /**
   * Two-factor user's ID.
   */
  id: string,

  /**
   * Two-facotr user's email.
   */
  email: string,

  /**
   * Two-factor provider.
   */
  provider: string,

  /**
   * Two-factor user's secret.
   */
  secret: string,
}

export default AuthenticableTwoFactorUser;