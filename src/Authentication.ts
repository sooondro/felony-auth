import StorageAdapterInterface from "./storage/StorageAdapterInterface";
import CacheAdapterInterface from "./cache/CacheAdapterInterface";
import ErrorAdapterInterface from "./error/ErrorAdapterInterface";
import ValidationAdapterInterface from "./validation/ValidationAdapterInterface";
import TwoFactorProviderInterface from "./providers/two-factor/TwoFactorProviderInterface";
// import BehaviourProviderInterface from "./providers/behaviour/BehaviourProviderInterface";


// import PostgresAdapter from "./storage/postgres/PostgresAdapter";
// import DefaultValidationAdapter from './validation/DefaultValidationAdapter';
// import DefaultErrorAdapter from "./error/DefaultErrorAdapter";

// import PostgresConnectionData from "./types/PostgresConnectionData";
import RegistrationData from "./types/RegistrationData";
import LoginData from "./types/LoginData";
import UserInterface from "./models/UserInterface";
import TwoFactorAuthenticationData from "./types/TwoFactorAuthenticationData";

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
	 * 
	 * u register paylodu ti se nalazi
	 * {
				provider: string,
				secret: string,
				token: string,
			}
	 */

	// this.twoFactorProviders[payloadIzRegister.provider]

	/**
	 * Register user.
	 * 
	 * @param {RegistrationData} payload
	 * @return {User|{User, string}}
	 */
	async register(payload: RegistrationData) {
		this._validationAdapter.registration(payload);

		// if (payload.twoFactorAuthentication) {
		// 	payload.twoFactorAuthenticationData.forEach(async providerData => {
		// 		await this._twoFactorProviders.get(providerData.provider).validate(providerData);
		// 	});
		// }
		const user = await this._storageAdapter.register(payload);

		if(!payload.twoFactorAuthentication) {
			// payload.twoFactorAuthenticationData.forEach(providerData => {
			// 	if (!this._twoFactorProviders.has(providerData.provider)) {
			// 		this._errorAdapter.throwTwoFactorProviderError(new Error("Invalid 2fa provider name"));
			// 	}
				
			// })
			// return await this._twoFactorProvider
			console.log("UPALO JE U NE2FA");
			
			return user;
		}
		console.log("PRIJE 2FA");
		
		const twoFactorUser = await this._twoFactorProvider.register(payload.email);
		
		console.log("DOSLO JE 2FA");
		console.log(twoFactorUser);
		
		return {
			user,
			twoFactorUser,
		}; 
	}


	/**
	 * Login user
	 * 
	 * @param {LoginData} payload 
	 * @return {string}
	 */
	async login(payload: LoginData): Promise<string|undefined> {
		this._validationAdapter.login(payload);
		
		const user = await this._storageAdapter.login(payload);

		if (user) {
			let twoFactorUser;
			if (payload.twoFactorAuthentication && payload.twoFactorAuthenticationData) {
				twoFactorUser = await this._twoFactorProvider.verify(payload.twoFactorAuthenticationData);
			}
			
			const sessionId = await this._cacheAdapter.createSession(user);
			return sessionId;
		}
	}
	


	async verifyTwoFactorUser(user: TwoFactorAuthenticationData) {
		await this._twoFactorProvider.verify(user);
	}
	

	/**
	 * Logout user
	 * 
	 * @param {string} sessionId 
	 */
	async logout(sessionId: string): Promise<void> {
		await this._cacheAdapter.logout(sessionId);
	}
	

	/**
	 * 
	 * @param sessionId 
	 * @return 
	 */
	async getSessions(sessionId: string): Promise<object> {
		return await this._cacheAdapter.getSession(sessionId);
	}

	/**
	 * 
	 * @param {UserInterface} payload 
	 */
	async createSession(payload: UserInterface): Promise<void> {
		await this._cacheAdapter.createSession(payload);
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