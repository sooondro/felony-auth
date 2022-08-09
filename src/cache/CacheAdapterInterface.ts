import UserInterface from '../models/UserInterface';

/**
 * Cache adapter interface
 * 
 * @type {Interface}
 */
export default interface CacheAdapterInterface {
	/**
	 * Create session
	 * 
	 * @param {UserInterface} payload
	 */
	createSession(payload: UserInterface): Promise<string>;

	/**
	 * Get session
	 * 
	 * @param {string} key
	 */
	getSession(key: string): object; //PITANJE

	/**
	 * Logout user
	 * 
	 * @param {string} key
	 */
	logout(key: string): void;
}