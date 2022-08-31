import AuthenticableUser from "./AuthenticableUser";

/**
 * Session data type.
 */
type Session = {
  /**
   * User's ID.
   */
  id: string,

  /**
   * Session's CSRF token.
   */
  csrf: string,

  /**
   * Session's user.
   */
  user: AuthenticableUser
};

export default Session;