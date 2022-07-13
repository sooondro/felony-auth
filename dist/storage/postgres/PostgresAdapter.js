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
const sequelize_typescript_1 = require("sequelize-typescript");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("./models/User"));
class PostgresAdapter {
    constructor(config, errorAdapter) {
        this.errorAdapter = errorAdapter;
        this.setupPostgresConnection(config);
    }
    register(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            let hashedPassword;
            try {
                hashedPassword = yield bcrypt_1.default.hash(payload.password, 12);
                const [user, created] = yield this.userRepository.findOrCreate({
                    where: { email: payload.email },
                    defaults: {
                        username: payload.username,
                        firstName: payload.firstName,
                        lastName: payload.lastName,
                        email: payload.email,
                        password: hashedPassword
                    }
                });
                if (!created) {
                    this.errorAdapter.throwRegistrationError(new Error("User already exists"));
                }
                return user;
            }
            catch (error) {
                this.errorAdapter.throwRegistrationError(error);
            }
        });
    }
    login(payload) {
        throw new Error("Method not implemented.");
    }
    getUserByemail(email) {
        throw new Error("Method not implemented.");
    }
    getUserById(id) {
        throw new Error("Method not implemented.");
    }
    getUserByUsername(username) {
        throw new Error("Method not implemented.");
    }
    // jel se koristi sequelize-typescript
    setupPostgresConnection(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config.hasUriConnection) {
                this.client = new sequelize_typescript_1.Sequelize(config.uri, {
                    models: [User_1.default],
                    repositoryMode: true,
                });
            }
            else {
                this.client = new sequelize_typescript_1.Sequelize({
                    host: 'localhost',
                    port: 55000,
                    database: config.database,
                    dialect: 'postgres',
                    username: config.username,
                    password: config.password,
                    models: [User_1.default],
                    repositoryMode: true,
                    // {
                    //   host: config.host,
                    //   port: config.port,
                    //   dialect: 'postgres',
                    // }
                });
            }
            try {
                yield this.client.authenticate();
                this.userRepository = this.client.getRepository(User_1.default);
            }
            catch (error) {
                this.errorAdapter.throwStorageConnectionError(error);
            }
        });
    }
}
exports.default = PostgresAdapter;
//# sourceMappingURL=PostgresAdapter.js.map