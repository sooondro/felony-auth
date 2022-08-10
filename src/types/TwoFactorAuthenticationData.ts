/**
 * Data required for the two-factor authentication process.
 */
type TwoFactorAuthenticationData = {
  /**
   * User's email.
   */
  email: string,

  /**
   * CSRF token sent by the user.
   */
  code: string,
};

export default TwoFactorAuthenticationData;