import { createClient } from "redis";
import { RedisClientType } from "@redis/client";

import CacheAdapterInterface from "../CacheAdapterInterface";
import Authentication from "../../Authentication";
import RedisSession from "./RedisSession";
import AuthenticableUser from "../../types/AuthenticableUser";
import Session from "../../types/Session";

/**
 * Redis adapter.
 */
export default class RedisAdapter implements CacheAdapterInterface {

	private client!: RedisClientType; // PITANJE
	private authentication!: Authentication;

	/**
	 * Used for injecting Authentication class into the adapter.
	 * 
	 * @param {Authentication} authentication 
	 */
	initialize(authentication: Authentication): void {
		this.authentication = authentication;
	}

	createConnection(url: string) {
		this.client = createClient({
			url,
		});

		this.client.connect();
	}

	/**
	 * Create redis session.
	 * 
	 * @param {UserInterface} payload 
	 * @return {Promise<string>}
	 */
	async createSession(payload: AuthenticableUser): Promise<string> {
		const session = new RedisSession(payload);
		// const sessionValue = {
		// 	csrf: session.csrf,
		// 	user: session.user,
		// }
		await this.client.set(session.id, JSON.stringify(session));
		return session.id;
	}

	/**
	 * Retreive user session.
	 * 
	 * @param {string} id 
	 * @return {Promise<Session>}
	 */
	async getSession(id: string): Promise<Session> {
		const session = await this.client.get(id);
		if (!session) {
			throw "Session not found";
		}

		const parsedSession: Session = JSON.parse(session);

		return parsedSession;
	}

	/**
	 * Logout user.
	 * 
	 * @param {string} id 
	 */
	async logout(id: string): Promise<void> {
		await this.client.del(id);
	}

	/**
	 * Validate whether the received csrf token is equal to the one stored in the user session.
	 * 
	 * @param {string} sessionId 
	 * @param {string} token 
	 */
	async validateCSRF(sessionId: string, token: string): Promise<void> {
		const session = await this.getSession(sessionId);
		if (session.csrf !== token) {
			throw "Invalid CSRF token";
		}
	}
}