import StorageAdapterInterface from "./storage/StorageAdapterInterface";
import CacheAdapterInterface from "./cache/CacheAdapterInterface";
import ErrorAdapterInterface from "./error/ErrorAdapterInterface";
import ValidationAdapterInterface from "./validation/ValidationAdapterInterface";
import BehaviourProviderInterface from "./providers/behaviour/BehaviourProviderInterface";
import TwoFactorProviderInterface from "./providers/two-factor/TwoFactorProviderInterface";

import PostgresAdapter from "./storage/postgres/PostgresAdapter";
import DefaultValidationAdapter from './validation/DefaultValidationAdapter';
import DefaultErrorAdapter from "./error/DefaultErrorAdapter";

import PostgresConnectionData from "./types/PostgresConnectionData";
import RegistrationData from "./types/RegistrationData";
import LoginData from "./types/LoginData";
import User from "./storage/postgres/models/User";

const postgresConfig: PostgresConnectionData = {
	database: "felony",
	username: "postgres",
	password: "postgrespw",
	host: "localhost",
	port: 55000
}

const postgresConnectionUri = "postgres://postgres:postgrespw@localhost:55000/felony";

export default class Authentication {
	constructor(
		private errorAdapter: ErrorAdapterInterface = new DefaultErrorAdapter(),
		private validationAdapter: ValidationAdapterInterface = new DefaultValidationAdapter(errorAdapter),
		private storageAdapter: StorageAdapterInterface = new PostgresAdapter(errorAdapter, postgresConnectionUri),
		private globalAuthConfig?: object,
		private cacheAdapter?: CacheAdapterInterface,
		private behaviourAdapter?: BehaviourProviderInterface,
		private twoFactorProviders?: Map<string, TwoFactorProviderInterface>
	) {
		// this.errorAdapter = errorAdapter;
		// this.validationAdapter = validationAdapter;
		// this.storageAdapter = storageAdapter;
		// this.globalAuthConfig = globalAuthConfig;
		// this.cacheAdapter = cacheAdapter;
		// this.behaviourAdapter = behaviourAdapter;
		// this.twoFactorProviders = twoFactorProviders;
	}

	// private errorAdapter: ErrorAdapterInterface
	// private validationAdapter: ValidationAdapterInterface
	// private storageAdapter: StorageAdapterInterface
	// private globalAuthConfig: object
	// private cacheAdapter: CacheAdapterInterface
	// private behaviourAdapter: BehaviourProviderInterface
	// private twoFactorProviders: Map<string, TwoFactorProviderInterface>;

	//samo obvezno u konstruktoru

	//// dictionary
	/**
	 * 
	 * twoFactorProviders: {
	 * 	otp: OTP2FAprovideadapter
	 * }
	 */

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

	// provider string bi trebao biti enum ili validiran da je unutar definiranih vrijednosti za otp
	// ideja za validaciju: string providera in (Objec.keys(twoFactorProviders))

	// ERROR logika
	// REGISTER logika
	// TYPES direktorij
	// USER model - User file unutar postgres foldera ili spremit unutar adaptera, pa unutar konstruktora 
	// Proslijediti error adapter unutar konstruktora validatora i storageAdaptera


	async register(payload: RegistrationData): Promise<User> {
		this.validationAdapter.registration(payload);

		if (payload.twoFactorAuthentication) {
			payload.twoFactorAuthenticationData.forEach(async providerData => {
				await this.twoFactorProviders.get(providerData.provider).validate(providerData);
			});
		}
		
		return await this.storageAdapter.register(payload);
	}
	// koji provider - OTP 
	
	async login(payload: LoginData): Promise<object | Error> {
		this.validationAdapter.login(payload);
		const user = await this.storageAdapter.login(payload);

		return await this.cacheAdapter.createSession(user);
	}
	
	// 2fa - salje se secret i token

	setErrorAdapter(errorAdapter: ErrorAdapterInterface) {
		this.errorAdapter = errorAdapter;
	}

	setValidationAdapter(validationAdapter: ValidationAdapterInterface) {
		this.validationAdapter = validationAdapter;
	}

	setStorageAdapter(storageAdapter: StorageAdapterInterface) {
		this.storageAdapter = storageAdapter;
	}

	setCacheAdapter(cacheAdapter: CacheAdapterInterface) {
		this.cacheAdapter = cacheAdapter;
	}

	setBehaviourAdapter(behaviourAdapter: BehaviourProviderInterface) {
		this.behaviourAdapter = behaviourAdapter;
	}

	setTwoFactorProvider(twoFactorProvider: TwoFactorProviderInterface) {
		this.twoFactorProviders.set(twoFactorProvider.provider, twoFactorProvider);
	}

	removeTwoFactorProvider(twoFactorProvider: string) {
		if (!this.twoFactorProviders.has(twoFactorProvider)) this.errorAdapter.throwTwoFactorProviderError(new Error("No provider found with the given name"))
		this.twoFactorProviders.delete(twoFactorProvider);
	}







	// koristit pool ili client

	// GlobalAuthConfig???????????????



	// async logout(payload: object): Promise<void> {
	// 	try {
	// 		await this.cacheProvider.logout(payload);
	// 	} catch (error) {
	// 		throw error;
	// 	}
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
	// async getSessions(payload: object): Promise<void> {
	// 	try {
	// 		await this.cacheProvider.getSessions(payload);
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }
	// async createSession(payload: object): Promise<void> {
	// 	try {
	// 		await this.cacheProvider.createSession(payload);
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }
}