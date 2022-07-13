export default interface CacheAdapterInterface {
	createSession(payload: object);
	getSessions(payload: object);
	logout(payload: object);
}