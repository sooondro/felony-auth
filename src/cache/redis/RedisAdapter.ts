import { createClient, RedisFunctions, RedisModules, RedisScripts } from "redis";

import RedisSession from "./RedisSession";

import CacheAdapterInterface from "../CacheAdapterInterface";
import ErrorAdapterInterface from "../../error/ErrorAdapterInterface";
import UserInterface from "../../models/UserInterface";
import SessionInterface from "../../models/SessionInterface";
import { RedisClientType } from "@redis/client";

export default class RedisAdapter implements CacheAdapterInterface {

	constructor(private errorAdapter: ErrorAdapterInterface, url: string) { 
		this.client = createClient({
			url,
		});

		this.client.connect();
	}

	private client;

	async createSession(payload: UserInterface): Promise<string> {
		const session = new RedisSession(payload);
		await this.client.set(session.key, session.value);
		return session.key;
	}

	async getSession(key: string): Promise<SessionInterface> {
		return await this.client.get(key);
	}

	async logout(key: string) {
		await this.client.del(key);
	}
}