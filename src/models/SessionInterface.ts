import AuthenticableUser from "../types/AuthenticableUser";

/**
 * Interface for the user session.
 */
export default interface SessionInterface {
  /**
   * Getter for the session ID.
   */
  get id(): string;

  /**
   * Getter for the CSRF token stored in the session.
   */
  get csrf(): string;

  /**
   * Getter for the user stored in the session.
   */
  get user(): AuthenticableUser;
}