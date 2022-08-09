import { createClient } from "redis";

import RedisSession from "./RedisSession";

import CacheAdapterInterface from "../CacheAdapterInterface";
import ErrorAdapterInterface from "../../error/ErrorAdapterInterface";
import UserInterface from "../../models/UserInterface";
import SessionInterface from "../../models/SessionInterface";
import AuthenticableUser from "../../types/AuthenticableUser";

/**
 * Redis adapter
 */
export default class RedisAdapter implements CacheAdapterInterface {

	constructor(private errorAdapter: ErrorAdapterInterface, url: string) { 
		this.client = createClient({
			url,
		});

		this.client.connect();
	}

	private client;

	/**
	 * Create redis session
	 * 
	 * @param {UserInterface} payload 
	 * @return {Promise<string>}
	 */
	async createSession(payload: AuthenticableUser): Promise<string> {
		const session = new RedisSession(payload);
		const sessionValue = {
			csrf: session.csrf,
			user: session.user,
		}
		await this.client.set(session.id, sessionValue);
		return session.id;
	}

	/**
	 * 
	 * @param {string} id 
	 * @return {Promise<SessionInterface>}
	 */
	async getSession(id: string): Promise<SessionInterface> {
		return await this.client.get(id);
	}

	/**
	 * Logout user
	 * 
	 * @param {string} id 
	 */
	async logout(id: string) {
		await this.client.del(id);
	}
}