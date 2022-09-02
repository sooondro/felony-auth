import { Authentication } from '../Authentication'
import AuthenticableUser from '../types/AuthenticableUser'
import Session from '../types/Session'

/**
 * Cache adapter interface.
 *
 * @type {Interface}
 */
export interface CacheAdapterInterface {
  /**
   * Used for injecting Authentication class into the adapter.
   *
   * @param {Authentication} authentication
   */
  initialize: (authentication: Authentication) => void

  /**
   * Create session.
   *
   * @param {AuthenticableUser} payload
   */
  createSession: (payload: AuthenticableUser) => Promise<string>

  /**
   * Get session.
   *
   * @param {string} id
   */
  getSession: (id: string) => Promise<Session>

  /**
   * Logout user.
   *
   * @param {string} id
   */
  logout: (id: string) => Promise<void>

  /**
   * Validate received csrf token with the one stored in the session.
   */
  validateCSRF: (sessionId: string, token: string) => void
}
