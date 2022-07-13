import CacheAdapterInterface from "../CacheAdapterInterface";
import ErrorAdapterInterface from "../../error/ErrorAdapterInterface";

export default class RedisAdapter implements CacheAdapterInterface {

	constructor(private errorAdapter: ErrorAdapterInterface) { }

	createSession(payload: object) {
		throw new Error("Method not implemented.");
	}
	getSessions(payload: object) {
		throw new Error("Method not implemented.");
	}
	logout(payload: object) {
		throw new Error("Method not implemented.");
	}
}