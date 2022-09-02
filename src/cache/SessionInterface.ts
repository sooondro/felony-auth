import AuthenticableUser from '../types/AuthenticableUser'

/**
 * Interface for the user session.
 */
export interface SessionInterface {
  /**
   * Getter for the session ID.
   */
  get Id(): string

  /**
   * Getter for the CSRF token stored in the session.
   */
  get Csrf(): string

  /**
   * Getter for the user stored in the session.
   */
  get User(): AuthenticableUser
}
