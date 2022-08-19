import StorageAdapterInterface from "./storage/StorageAdapterInterface";
import CacheAdapterInterface from "./cache/CacheAdapterInterface";
import ErrorAdapterInterface from "./error/ErrorAdapterInterface";
import ValidationAdapterInterface from "./validation/ValidationAdapterInterface";
import TwoFactorProviderInterface from "./providers/two-factor/TwoFactorProviderInterface";

import RegistrationData from "./types/RegistrationData";
import LoginData from "./types/LoginData";
import Session from "./types/Session";
import AuthenticableUser from "./types/AuthenticableUser";
import AuthenticableTwoFactorUser from "./types/AuthenticableTwoFactorUser";
import ErrorData from "./types/ErrorData";
import AuthenticationError from "./error/AuthenticationError";
import { ValidationErrors } from "./error/ValidationError";

export default class Authentication {

	private _errorAdapter!: ErrorAdapterInterface;
	private _validationAdapter!: ValidationAdapterInterface;
	private _storageAdapter!: StorageAdapterInterface;
	private _globalAuthConfig!: object;
	private _cacheAdapter!: CacheAdapterInterface;
	private _twoFactorProvider!: TwoFactorProviderInterface;
	// private _twoFactorProviders: Map<string, TwoFactorProviderInterface>;

	public get errorAdapter() {
		return this._errorAdapter;
	}
	public set errorAdapter(errorAdapter: ErrorAdapterInterface) {
		if (typeof errorAdapter.initialize === "function") {
			errorAdapter.initialize(this);
		}
		this._errorAdapter = errorAdapter;
	}
	public get validationAdapter() {
		return this._validationAdapter;
	}
	public set validationAdapter(validationAdapter: ValidationAdapterInterface) {
		if (typeof validationAdapter.initialize === "function") {
			validationAdapter.initialize(this);
		}
		this._validationAdapter = validationAdapter;
	}
	public get storageAdapter() {
		return this._storageAdapter;
	}
	public set storageAdapter(storageAdapter: StorageAdapterInterface) {
		if (typeof storageAdapter.initialize === "function") {
			storageAdapter.initialize(this);
		}
		this._storageAdapter = storageAdapter;
	}
	public get cacheAdapter() {
		return this._cacheAdapter;
	}
	public set cacheAdapter(cacheAdapter: CacheAdapterInterface) {
		if (typeof cacheAdapter.initialize === "function") {
			cacheAdapter.initialize(this);
		}
		this._cacheAdapter = cacheAdapter;
	}
	public set twoFactorProvider(twoFactorProvider: TwoFactorProviderInterface) {
		if (typeof twoFactorProvider.initialize === "function") {
			twoFactorProvider.initialize(this);
		}
		this._twoFactorProvider = twoFactorProvider;
	}
	public get twoFactorProvider() {
		return this._twoFactorProvider;
	}
	public get globalAuthConfig() {
		return this._globalAuthConfig;
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

	/**
	 * Register user.
	 * 
	 * @param {RegistrationData} payload
	 * @return {{AuthenticableUser, AuthenticableTwoFactorUser}}
	 */
	async register(payload: RegistrationData)
		: Promise<{ user: AuthenticableUser, twoFactorUser?: AuthenticableTwoFactorUser, qrCode?: string }> {
		try {
			const result: { user: AuthenticableUser, twoFactorUser?: AuthenticableTwoFactorUser, qrCode?: string } = {
				user: {
					id: "",
					username: "",
					firstName: "",
					lastName: "",
					email: ""
				}
			};

			this._validationAdapter.registration(payload);

			const user = await this._storageAdapter.register(payload);
			result.user = user;

			if (payload.twoFactorAuthentication) {
				const { twoFactorUser, qrCode } = await this.registerTwoFactorUser(user);
				result.twoFactorUser = twoFactorUser;
				result.qrCode = qrCode;
			}

			return result;
		} catch (error: any) {
			const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error;
			throw this._errorAdapter.handleError(err);
		}
	}

	/**
	 * Login user.
	 * 
	 * @param {LoginData} payload 
	 * @return {string}
	 */
	async login(payload: LoginData): Promise<string> {
		try {
			this._validationAdapter.login(payload);

			const user = await this._storageAdapter.login(payload);

			const twoFactorUser = await this._storageAdapter.getTwoFactorUser(user);

			if (payload.twoFactorAuthentication && payload.twoFactorAuthenticationData) {
				await this._twoFactorProvider.verify(twoFactorUser, payload.twoFactorAuthenticationData.code);
			}

			const sessionId = await this._cacheAdapter.createSession(user);
			return sessionId;
		} catch (error: any) {
			const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error;
			throw this._errorAdapter.handleError(err);
		}
	}

	/**
	 * 
	 * @param {AuthenticableUser} user 
	 * @return {{ twoFactorUser: AuthenticableTwoFactorUser; qrCode: string; }}
	 */
	async registerTwoFactorUser(user: AuthenticableUser): Promise<{ twoFactorUser: AuthenticableTwoFactorUser; qrCode: string; }> {
		try {
			const twoFactorUserRegistrationData = await this._twoFactorProvider.register(user);

			const twoFactorUser = await this._storageAdapter.registerTwoFactorUser(twoFactorUserRegistrationData);

			const qrCode = await this._twoFactorProvider.generateQRCode(twoFactorUser);

			return { twoFactorUser, qrCode };
		} catch (error: any) {
			const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error;
			throw this._errorAdapter.handleError(err);
		}
	}

	/**
	 * Setup 2fa for user by session ID.
	 * 
	 * @param {string} sessionId 
	 * @returns {string}
	 */
	async registerTwoFactorUserBySessionId(sessionId: string): Promise<{ twoFactorUser: AuthenticableTwoFactorUser; qrCode: string; }> {
		try {
			const session = await this._cacheAdapter.getSession(sessionId);

			return await this.registerTwoFactorUser(session.user);
		} catch (error: any) {
			const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error;
			throw this._errorAdapter.handleError(err);
		}
	}

	/**
	 * Verifies the two-factor user.
	 * 
	 * @param {AuthenticableTwoFactorUser} user 
	 */
	async verifyTwoFactorUser(twoFactorUser: AuthenticableTwoFactorUser, code: string) {
		try {
			await this._twoFactorProvider.verify(twoFactorUser, code);
		} catch (error: any) {
			const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error;
			throw this._errorAdapter.handleError(err);
		}
	}

	/**
	 * Verifies the two-factor user using AuthenticableUser object.
	 * 
	 * @param {AuthenticableUser} user 
	 * @param {string} code 
	 */
	async verifyTwoFactorUserByAuthenticableUser(user: AuthenticableUser, code: string) {
		try {
			const twoFactorUser = await this._storageAdapter.getTwoFactorUser(user);
			await this._twoFactorProvider.verify(twoFactorUser, code);
		} catch (error: any) {
			const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error;
			throw this._errorAdapter.handleError(err);
		}
	}

	/**
	 * Validate whether the received csrf token is equal to the one stored in the user session.
	 * 
	 * @param {string} sessionId
	 * @param {string} token
	 */
	async validateCSRFToken(sessionId: string, token: string): Promise<void> {
		try {
			this._cacheAdapter.validateCSRF(sessionId, token);
		} catch (error: any) {
			const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error;
			throw this._errorAdapter.handleError(err);
		}
	}

	/**
	 * Logout user.
	 * 
	 * @param {string} sessionId 
	 */
	async logout(sessionId: string): Promise<void> {
		await this._cacheAdapter.logout(sessionId);
	}

	/**
	 * Retreive user session.
	 * 
	 * @param sessionId 
	 * @return 
	 */
	async getSession(sessionId: string): Promise<Session> {
		try {
			return this._cacheAdapter.getSession(sessionId);
		} catch (error: any) {
			const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error;
			throw this._errorAdapter.handleError(err);
		}
	}

	/**
	 * Create user session.
	 * 
	 * @param {AuthenticableUser} payload 
	 */
	async createSession(payload: AuthenticableUser): Promise<string> {
		try {
			return await this._cacheAdapter.createSession(payload);
		} catch (error: any) {
			const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error;
			throw this._errorAdapter.handleError(err);
		}
	}


	async changePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
		try {
			await this._storageAdapter.changePassword(email, oldPassword, newPassword);
		} catch (error: any) {
			const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error;
			throw this._errorAdapter.handleError(err);
		}
	}

	async getTwoFactorUser(user: AuthenticableUser) { //PITANJE koristit ovo ili direktno pozivat
		try {
			return await this._storageAdapter.getTwoFactorUser(user);
		} catch (error: any) {
			const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error;
			throw this._errorAdapter.handleError(err);
		}
	}

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