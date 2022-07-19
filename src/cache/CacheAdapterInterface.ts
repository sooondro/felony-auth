import UserInterface from '../models/UserInterface';
export default interface CacheAdapterInterface {
	createSession(payload: UserInterface): Promise<string>;
	getSession(key: string);
	logout(key: string);
}