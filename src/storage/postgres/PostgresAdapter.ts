import { Sequelize, DataTypes } from 'sequelize';
import Bcrypt from 'bcrypt';

import RegistrationData from "../../types/RegistrationData";
import LoginData from '../../types/LoginData';
import PostgresConnectionData from "../../types/PostgresConnectionData";
import TwoFactorRegistrationData from "../../types/TwoFactorRegistrationData";
import AuthenticableUser from "../../types/AuthenticableUser";
import AuthenticableTwoFactorUser from "../../types/AuthenticableTwoFactorUser";

// import User from "./models/User";
// import TwoFactorUser from "./models/TwoFactorUser";

// import db from "./db/models";
// const DB: any = db;
// const { User, TwoFactorUser } = DB;
// import from "./db/models/user";

import Models from "./db/models/Models";

import StorageAdapterInterface from "../StorageAdapterInterface";
import Authentication from '../../Authentication';
import { ValidationErrors } from '../../error/ValidationError';

/**
 * Storage adapter for the Postgres database
 */
export default class PostgresAdapter implements StorageAdapterInterface {

  private client!: Sequelize;
  private authentication!: Authentication; //PITANJE ? ili !
  public models!: Models;

  // constructor( // PITANJE izbacio, postavlja se pomocu metoda
  //   config: {
  //     connectionUri?: string,
  //     connectionData?: PostgresConnectionData
  //   }
  // ) {
  //   if (config.connectionUri) {
  //     this.setupPostgresConnectionWithConnectionUri(config.connectionUri)
  //   } else if (config.connectionData) {
  //     this.setupPostgresConnectionWithConnectionData(config.connectionData);
  //   }
  // }

  public get Client(): Sequelize {
    return this.client;
  }

  /**
   * Used for injecting Authentication class into the adapter.
   * 
   * @param {Authentication} authentication 
   */
  initialize(authentication: Authentication): void {
    this.authentication = authentication;
  }

  /**
   * Set up Postgres client with the config object.
   * 
   * @param {PostgresConnectionData} config 
   * @throws
   */
  async setupPostgresConnectionWithConnectionData(config: PostgresConnectionData) {
    this.client = new Sequelize(config.database, config.username, config.password, {
      dialect: 'postgres',
      host: config.host,
      port: config.port,
      logging: false,
      // models: [User, TwoFactorUser],
    });

    this.models = new Models(this.client, DataTypes);
    // await this.client.authenticate();
  }

  /**
   * Set up Postgres client with connection string.
   * 
   * @param {string} connectionUri
   * @throws
   */
  async setupPostgresConnectionWithConnectionUri(connectionUri: string) {
    this.client = new Sequelize(connectionUri), { 
      dialect: "postgres",  
      logging: false 
    };

    this.models = new Models(this.client, DataTypes);
    // await this.client.authenticate();
  }

  /**
   * Add new user to the database.
   * 
   * @param {RegistrationData} payload 
   * @return {Promise<AuthenticableUser>}
   * @throws
   */
  async register(payload: RegistrationData): Promise<AuthenticableUser> {
    const hashedPassword = await Bcrypt.hash(payload.password, 12);

    const [user, created] = await this.models.User.findOrCreate({
      where: { email: payload.email },
      defaults: {
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: hashedPassword,
      }
    });

    if (!created) {
      const validationErrors = new ValidationErrors();
      validationErrors.addError("email", "invalid credentials");
      throw validationErrors;
    }

    const authUser: AuthenticableUser = user;

    return authUser;
  }

  /**
   * Register two-factor user.
   * 
   * @param {TwoFactorRegistrationData} payload 
   * @return {Promise<AuthenticableTwoFactorUser>}
   * @throws
   */
  async registerTwoFactorUser(payload: TwoFactorRegistrationData): Promise<AuthenticableTwoFactorUser> {
    const [user, created] = await this.models.TwoFactorUser.findOrCreate({
      where: { userId: payload.userId, provider: payload.provider },
      defaults: {
        userId: payload.userId,
        provider: payload.provider,
        secret: payload.secret,
      }
    });

    if (!created) {
      const validationErrors = new ValidationErrors();
      validationErrors.addError("id", "invalid credentials"); // PITANJE
      throw validationErrors;
    }

    const authUser: AuthenticableTwoFactorUser = user;

    return authUser;
  }

  /**
   * Login user.
   * 
   * @param {LoginData} payload 
   * @return {Promise<AuthenticableUser>}
   * @throws
   */
  async login(payload: LoginData): Promise<AuthenticableUser> {
    const user = await this.models.User.findOne({
      where: { email: payload.email }
    });

    if (!user) {
      const validationErrors = new ValidationErrors();
      validationErrors.addError("email", "invalid credentials");
      throw validationErrors;
    }

    const result = await Bcrypt.compare(payload.password, user.password);

    if (!result) {
      throw "Invalid credentials!";
    }

    const authUser: AuthenticableUser = user;

    return authUser;
  }

  /**
   * Fetch user from the database by email.
   * 
   * @param {string} email 
   * @return {Promise<AuthenticableUser>}
   * @throws 
   */
  async getUserByEmail(email: string): Promise<AuthenticableUser> {
    const user = await this.models.User.findOne({
      where: { email: email }
    });

    if (!user) {
      const validationErrors = new ValidationErrors();
      validationErrors.addError("email", "invalid credentials");
      throw validationErrors;
    }

    const authUser: AuthenticableUser = user;

    return authUser;
  }

  /**
   * Fetch user from the database by id.
   * 
   * @param {string} id 
   * @return {Promise<AuthenticableUser>}
   * @throws Login Error
   */
  async getUserById(id: string): Promise<AuthenticableUser> {
    const user = await this.models.User.findByPk(id);

    if (!user) {
      const validationErrors = new ValidationErrors();
      validationErrors.addError("id", "invalid credentials");
      throw validationErrors;
    }

    const authUser: AuthenticableUser = user;

    return authUser;
  }

  /**
   * Fetch user from the database by username.
   * 
   * @param {string} username 
   * @return {Promise<AuthenticableUser>}
   */
  async getUserByUsername(username: string): Promise<AuthenticableUser> {
    const user = await this.models.User.findOne({
      where: { username: username }
    });

    if (!user) {
      const validationErrors = new ValidationErrors();
      validationErrors.addError("username", "invalid credentials");
      throw validationErrors;
    }

    const authUser: AuthenticableUser = user;

    return authUser;
  }

  /**
   * Fetch two-factor user by AuthenticableUser object
   * 
   * @param {AuthenticableUser} user 
   * @return {AuthenticableTwoFactorUser}
   */
  async getTwoFactorUser(user: AuthenticableUser): Promise<AuthenticableTwoFactorUser> {
    const twoFactorUser: AuthenticableTwoFactorUser = await this.models.TwoFactorUser.findOne({
      where: { userId: user.id }
    });

    if (!twoFactorUser) {
      const validationErrors = new ValidationErrors();
      validationErrors.addError("id", "invalid credentials");
      throw validationErrors;
    }

    return twoFactorUser;
  }

  // /**
  //  * Fetch two-factor user from the database by email.
  //  * 
  //  * @param {string} email 
  //  * @return {Promise<AuthenticableTwoFactorUser>}
  //  */
  // async getTwoFactorUserByEmail(email: string): Promise<AuthenticableTwoFactorUser> {
  //   const user = await this.models.TwoFactorUser.findOne({
  //     where: { email: email }
  //   });

  //   if (!user) {
  //     const validationErrors = new ValidationErrors();
  //     validationErrors.addError("email", "invalid credentials");
  //     throw validationErrors;
  //   }

  //   const authUser: AuthenticableTwoFactorUser = user;

  //   return authUser;
  // }

  /**
   * Change user's password.
   * 
   * @param {string} email 
   * @param {string} oldPassword 
   * @param {string} newPassword 
   * @return {Promise<void>}
   */
  async changePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.models.User.findOne({
      where: { email: email }
    });

    if (!user) {
      const validationErrors = new ValidationErrors();
      validationErrors.addError("email", "invalid credentials");
      throw validationErrors;
    }

    const result = await Bcrypt.compare(oldPassword, user.password);

    if (!result) {
      throw "Invalid credentials!";
    }

    const newHashedPassword = await Bcrypt.hash(newPassword, 12);

    await this.models.User.update(
      { password: newHashedPassword },
      { where: { email: email } }
    );
  }
}

