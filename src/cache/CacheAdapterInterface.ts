import AuthenticableUser from '../types/AuthenticableUser';
import Session from '../types/Session';

/**
 * Cache adapter interface.
 * 
 * @type {Interface}
 */
export default interface CacheAdapterInterface {
	/**
	 * Create session.
	 * 
	 * @param {AuthenticableUser} payload
	 */
	createSession(payload: AuthenticableUser): Promise<string>;

	/**
	 * Get session.
	 * 
	 * @param {string} id
	 */
	getSession(id: string): Promise<Session>;

	/**
	 * Logout user.
	 * 
	 * @param {string} id
	 */
	logout(id: string): void;

	/**
	 * Validate received csrf token with the one stored in the session.
	 */
	validateCSRF(sessionId: string, token: string): void;
}