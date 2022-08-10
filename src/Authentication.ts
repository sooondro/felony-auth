import StorageAdapterInterface from "./storage/StorageAdapterInterface";
import CacheAdapterInterface from "./cache/CacheAdapterInterface";
import ErrorAdapterInterface from "./error/ErrorAdapterInterface";
import ValidationAdapterInterface from "./validation/ValidationAdapterInterface";
import TwoFactorProviderInterface from "./providers/two-factor/TwoFactorProviderInterface";

import RegistrationData from "./types/RegistrationData";
import LoginData from "./types/LoginData";
import Session from "./types/Session";
import TwoFactorAuthenticationData from "./types/TwoFactorAuthenticationData";
import AuthenticableUser from "./types/AuthenticableUser";

// const postgresConfig: PostgresConnectionData = {
// 	database: "felony",
// 	username: "postgres",
// 	password: "postgrespw",
// 	host: "localhost",
// 	port: 55000
// }

// const postgresConnectionUri = "postgres://postgres:postgrespw@localhost:55000/felony";

export default class Authentication {

	private _errorAdapter!: ErrorAdapterInterface;
	private _validationAdapter!: ValidationAdapterInterface;
	private _storageAdapter!: StorageAdapterInterface;
	private _globalAuthConfig!: object;
	private _cacheAdapter!: CacheAdapterInterface;
	// private _twoFactorProviders: Map<string, TwoFactorProviderInterface>;
	private _twoFactorProvider!: TwoFactorProviderInterface;

	public get errorAdapter() {
		return this._errorAdapter;
	}
	public set errorAdapter(errorAdapter: ErrorAdapterInterface) {
		this._errorAdapter = errorAdapter;
	}
	public get validationAdapter() {
		return this._validationAdapter;
	}
	public set validationAdapter(validationAdapter: ValidationAdapterInterface) {
		this._validationAdapter = validationAdapter;
	}
	public get storageAdapter() {
		return this._storageAdapter;
	}
	public set storageAdapter(storageAdapter: StorageAdapterInterface) {
		this._storageAdapter = storageAdapter;
	}
	public get cacheAdapter() {
		return this._cacheAdapter;
	}
	public set cacheAdapter(cacheAdapter: CacheAdapterInterface) {
		this._cacheAdapter = cacheAdapter;
	}
	// public set twoFactorProvider(twoFactorProvider: TwoFactorProviderInterface) {
	// 	this._twoFactorProviders.set(twoFactorProvider.provider, twoFactorProvider);
	// }
	// public get twoFactorProviders() {
	// 	return this._twoFactorProviders;
	// }
	// public set twoFactorProviders(twoFactorProviders: Map<string, TwoFactorProviderInterface>) {
	// 	this._twoFactorProviders = twoFactorProviders;
	// }
	public set twoFactorProvider(twoFactorProvider: TwoFactorProviderInterface) {
		this._twoFactorProvider = twoFactorProvider;
	}
	public get twoFactorProvider() {
		return this._twoFactorProvider;
	}
	public get globalAuthConfig() {
		return this._globalAuthConfig;
	}

	/**
	 * Register user.
	 * 
	 * @param {RegistrationData} payload
	 * @return {User|{User, string}}
	 */
	async register(payload: RegistrationData)
		: Promise<void | AuthenticableUser | { user: AuthenticableUser | void, twoFactorUser: string | void }> {
		this._validationAdapter.registration(payload);

		// if (payload.twoFactorAuthentication) {
		// 	payload.twoFactorAuthenticationData.forEach(async providerData => {
		// 		await this._twoFactorProviders.get(providerData.provider).validate(providerData);
		// 	});
		// }
		const user = await this._storageAdapter.register(payload);

		// if(!payload.twoFactorAuthentication) {
		// 	// payload.twoFactorAuthenticationData.forEach(providerData => {
		// 	// 	if (!this._twoFactorProviders.has(providerData.provider)) {
		// 	// 		this._errorAdapter.throwTwoFactorProviderError(new Error("Invalid 2fa provider name"));
		// 	// 	}

		// 	// })
		// 	// return await this._twoFactorProvider
		// 	console.log("UPALO JE U NE2FA");

		// 	return user;
		// }
		if (payload.twoFactorAuthentication) {
			await this._twoFactorProvider.register(payload.email);
		}
		return user;
	}

	/**
	 * Login user.
	 * 
	 * @param {LoginData} payload 
	 * @return {string}
	 */
	async login(payload: LoginData): Promise<string | undefined> {
		this._validationAdapter.login(payload);

		const user = await this._storageAdapter.login(payload);

		if (user) {
			if (payload.twoFactorAuthentication && payload.twoFactorAuthenticationData) {
				await this._twoFactorProvider.verify(payload.twoFactorAuthenticationData);
			}

			const sessionId = await this._cacheAdapter.createSession(user);
			return sessionId;
		}
	}

	/**
	 * Setup 2FA for user by email.
	 * 
	 * @param {string} email 
	 * @returns {string}
	 */
	async setup2FAByEmail(email: string): Promise<string | void> {
		return await this._twoFactorProvider.register(email);
	}

	/**
	 * Setup 2fa for user by session ID.
	 * 
	 * @param {string} sessionId 
	 * @returns {string}
	 */
	async setup2FABySessionId(sessionId: string): Promise<string | void> {
		const session = await this.getSession(sessionId);

		const email = session.user.email;

		if (email) {
			return await this.setup2FAByEmail(email);
		}
	}

	/**
	 * Verifies the user using the two-factor authentication.
	 * 
	 * @param {TwoFactorAuthenticationData} user 
	 */
	async verify2FAUser(user: TwoFactorAuthenticationData) {
		await this._twoFactorProvider.verify(user);
	}

	/**
	 * Validate whether the received csrf token is equal to the one stored in the user session.
	 * 
	 * @param {string} sessionId
	 * @param {string} token
	 */
	async validateCSRFToken(sessionId: string, token: string): Promise<void> {
		this._cacheAdapter.validateCSRF(sessionId, token);
	}

	/**
	 * Logout user.
	 * 
	 * @param {string} sessionId 
	 */
	async logout(sessionId: string): Promise<void> {
		this._cacheAdapter.logout(sessionId);
	}

	/**
	 * Retreive user session.
	 * 
	 * @param sessionId 
	 * @return 
	 */
	async getSession(sessionId: string): Promise<Session> {
		return this._cacheAdapter.getSession(sessionId);
	}

	/**
	 * Create user session.
	 * 
	 * @param {AuthenticableUser} payload 
	 */
	async createSession(payload: AuthenticableUser): Promise<string> {
		return await this._cacheAdapter.createSession(payload);
	}

	async changePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
		await this._storageAdapter.changePassword(email, oldPassword, newPassword);
	}

	// 2fa - salje se secret i token

	// removeTwoFactorProvider(twoFactorProvider: string) {
	// 	if (!this._twoFactorProviders.has(twoFactorProvider)) this._errorAdapter.throwTwoFactorProviderError(new Error("No provider found with the given name"))
	// 	this._twoFactorProviders.delete(twoFactorProvider);
	// }

	// async getUserById(id: string): Promise<void> {
	// 	try {
	// 		await this.databaseProvider.getUserById(id);
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	// async getUserByEmail(email: string): Promise<void> {
	// 	try {
	// 		await this.databaseProvider.getUserByemail(email);
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }
}