"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PostgresAdapter_1 = __importDefault(require("./storage/postgres/PostgresAdapter"));
const DefaultValidationAdapter_1 = __importDefault(require("./validation/DefaultValidationAdapter"));
const DefaultErrorAdapter_1 = __importDefault(require("./error/DefaultErrorAdapter"));
const postgresConfig = {
    database: "felony",
    username: "postgres",
    password: "postgrespw",
    hasUriConnection: true,
    uri: "postgres://postgres:postgrespw@localhost:55000"
};
class Authentication {
    constructor(errorAdapter = new DefaultErrorAdapter_1.default(), validationAdapter = new DefaultValidationAdapter_1.default(errorAdapter), storageAdapter = new PostgresAdapter_1.default(postgresConfig, errorAdapter), globalAuthConfig, cacheAdapter, behaviourAdapter, twoFactorProviders) {
        this.errorAdapter = errorAdapter;
        this.validationAdapter = validationAdapter;
        this.storageAdapter = storageAdapter;
        this.globalAuthConfig = globalAuthConfig;
        this.cacheAdapter = cacheAdapter;
        this.behaviourAdapter = behaviourAdapter;
        this.twoFactorProviders = twoFactorProviders;
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
    register(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validationAdapter.registration(payload);
            if (payload.twoFactorAuthentication) {
                payload.twoFactorAuthenticationData.forEach((providerData) => __awaiter(this, void 0, void 0, function* () {
                    yield this.twoFactorProviders.get(providerData.provider).validate(providerData);
                }));
            }
            return yield this.storageAdapter.register(payload);
        });
    }
    // koji provider - OTP 
    // 2fa - salje se secret i token
    setErrorAdapter(errorAdapter) {
        this.errorAdapter = errorAdapter;
    }
    setValidationAdapter(validationAdapter) {
        this.validationAdapter = validationAdapter;
    }
    setStorageAdapter(storageAdapter) {
        this.storageAdapter = storageAdapter;
    }
    setCacheAdapter(cacheAdapter) {
        this.cacheAdapter = cacheAdapter;
    }
    setBehaviourAdapter(behaviourAdapter) {
        this.behaviourAdapter = behaviourAdapter;
    }
    setTwoFactorProvider(twoFactorProvider) {
        this.twoFactorProviders.set(twoFactorProvider.provider, twoFactorProvider);
    }
    removeTwoFactorProvider(twoFactorProvider) {
        if (!this.twoFactorProviders.has(twoFactorProvider))
            this.errorAdapter.throwTwoFactorProviderError(new Error("No provider found with the given name"));
        this.twoFactorProviders.delete(twoFactorProvider);
    }
}
exports.default = Authentication;
//# sourceMappingURL=Authentication.js.map