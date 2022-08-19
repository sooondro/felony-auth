import { Sequelize } from 'sequelize-typescript';
import Bcrypt from 'bcrypt';

import RegistrationData from "../../types/RegistrationData";
import LoginData from '../../types/LoginData';
import PostgresConnectionData from "../../types/PostgresConnectionData";
import TwoFactorRegistrationData from "../../types/TwoFactorRegistrationData";
import AuthenticableUser from "../../types/AuthenticableUser";
import AuthenticableTwoFactorUser from "../../types/AuthenticableTwoFactorUser";

// import User from "./models/User";
// import TwoFactorUser from "./models/TwoFactorUser";

import db from "./db/models";
// import from "./db/models/user";

import StorageAdapterInterface from "../StorageAdapterInterface";
import Authentication from '../../Authentication';
import { ValidationErrors } from '../../error/ValidationError';

/**
 * Storage adapter for the Postgres database
 */
export default class PostgresAdapter implements StorageAdapterInterface {

  private client!: Sequelize;
  private authentication!: Authentication; //pitanje ? ili !

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
    this.client = new Sequelize(
      {
        host: config.host,
        port: config.port,
        database: config.database,
        dialect: 'postgres',
        username: config.username,
        password: config.password,
        models: [db.User, db.TwoFactorUser],
      },
    );

    await this.authenticateConnection();
  }

  /**
   * Set up Postgres client with connection string.
   * 
   * @param {string} connectionUri 
   * @throws
   */
  async setupPostgresConnectionWithConnectionUri(connectionUri: string) {
    this.client = new Sequelize(
      connectionUri,
      {
        models: [db.User, db.TwoFactorUser],
      }
    );

    await this.authenticateConnection();
  }

  /**
   * Authenticate Postgres client connection.
   * @throws 
   */
  async authenticateConnection() {
    await this.client.authenticate();
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

    const [user, created] = await db.User.findOrCreate({
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
   * @param {TwoFactorRegistrationData} twoFactorUser 
   * @return {Promise<AuthenticableTwoFactorUser>}
   * @throws
   */
  async registerTwoFactorUser(twoFactorUser: TwoFactorRegistrationData): Promise<AuthenticableTwoFactorUser> {
    const [user, created] = await db.TwoFactorUser.findOrCreate({
      where: { userId: twoFactorUser.userId },
      defaults: {
        userId: twoFactorUser.userId,
        provider: twoFactorUser.provider,
        secret: twoFactorUser.secret,
      }
    });

    if (!created) {
      // const error = new ValidationError("email");
      // error.addErrorMessage("Invalid credentials!");
      // throw error;
      const validationErrors = new ValidationErrors();
      validationErrors.addError("email", "invalid credentials");
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
    const user = await db.User.findOne({
      where: { email: payload.email }
    });

    if (!user) {
      // const error = new ValidationError("email");
      // error.addErrorMessage("Invalid credentials!");
      // throw error;
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
    const user = await db.User.findOne({
      where: { email: email }
    });

    if (!user) {
      // const error = new ValidationError("email");
      // error.addErrorMessage("Invalid credentials!");
      // throw error;
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
    const user = await db.User.findByPk(id);

    if (!user) {
      // const error = new ValidationError("id");
      // error.addErrorMessage("Invalid credentials!");
      // throw error;
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
    const user = await db.User.findOne({
      where: { username: username }
    });

    if (!user) {
      // const error = new ValidationError("username");
      // error.addErrorMessage("Invalid credentials!");
      // throw error;
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
    const twoFactorUser = await db.TwoFactorUser.findOne({
      where: { userId: user.id }
    });

    if (!twoFactorUser) {
      // const error = new ValidationError("id");
      // error.addErrorMessage("Invalid credentials!");
      // throw error;
      const validationErrors = new ValidationErrors();
      validationErrors.addError("id", "invalid credentials");
      throw validationErrors;
    }

    return twoFactorUser;
  }

  /**
   * Fetch two-factor user from the database by email.
   * 
   * @param {string} email 
   * @return {Promise<AuthenticableTwoFactorUser>}
   */
  async getTwoFactorUserByEmail(email: string): Promise<AuthenticableTwoFactorUser> {
    const user = await db.TwoFactorUser.findOne({
      where: { email: email }
    });

    if (!user) {
      // const error = new ValidationError("email");
      // error.addErrorMessage("Invalid credentials!");
      // throw error;
      const validationErrors = new ValidationErrors();
      validationErrors.addError("email", "invalid credentials");
      throw validationErrors;
    }

    const authUser: AuthenticableTwoFactorUser = user;

    return authUser;
  }

  /**
   * Change user's password.
   * 
   * @param {string} email 
   * @param {string} oldPassword 
   * @param {string} newPassword 
   * @return {Promise<void>}
   */
  async changePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await db.User.findOne({
      where: { email: email }
    });

    if (!user) {
      // const error = new ValidationError("email");
      // error.addErrorMessage("Invalid credentials!");
      // throw error;
      const validationErrors = new ValidationErrors();
      validationErrors.addError("email", "invalid credentials");
      throw validationErrors;
    }

    const result = await Bcrypt.compare(oldPassword, user.password);

    if (!result) {
      throw "Invalid credentials!";
    }

    const newHashedPassword = await Bcrypt.hash(newPassword, 12);

    await db.User.update(
      { password: newHashedPassword },
      { where: { email: email } }
    );
  }

  // /**
  //  * Convert a class User object to object of type AuthenticableUser.
  //  * 
  //  * @param {User} user 
  //  * @return {AuthenticableUser}
  //  */
  // convertUserToAuthenticableUser(user: User): AuthenticableUser {
  //   const authUser: AuthenticableUser = {
  //     id: user.id,
  //     username: user.username,
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //     email: user.email
  //   }

  //   return authUser;
  // }

  // /**
  //  * Convert a class TwoFactorUser object to object of type AuthenticableTwoFactorUser.
  //  * 
  //  * @param {TwoFactorUser} user 
  //  * @return {AuthenticableTwoFactorUser}
  //  */
  // convertTwoFactorUserToAuthenticableTwoFactorUser(user: TwoFactorUser): AuthenticableTwoFactorUser {
  //   const authUser: AuthenticableTwoFactorUser = {
  //     id: user.id,
  //     email: user.email,
  //     provider: user.provider,
  //     secret: user.secret
  //   }

  //   return authUser;
  // }
}

