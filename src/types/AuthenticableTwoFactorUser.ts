/**
 * Authenticable two-factor user.
 */
type AuthenticableTwoFactorUser = {
  /**
   * Two-factor user's ID.
   */
  id: string,

  /**
   * User's id.
   */
  userId: string,

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