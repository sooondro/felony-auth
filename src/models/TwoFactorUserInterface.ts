/**
 * Interface for the two-factor user.
 */
interface TwoFactorUserInterface {
  /**
   * Two-factor user's email.
   */
  email: string,
  
  /**
   * Two-factor provider.
   */
  provider: string,

  /**
   * Two-factor provider secret.
   */
  secret: string,
}

export default TwoFactorUserInterface;