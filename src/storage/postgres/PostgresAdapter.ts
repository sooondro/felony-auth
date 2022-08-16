import { Sequelize, Repository } from 'sequelize-typescript';
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

import ErrorAdapterInterface from "../../error/ErrorAdapterInterface";
import StorageAdapterInterface from "../StorageAdapterInterface";


/**
 * Storage adapter for the Postgres database
 */
export default class PostgresAdapter implements StorageAdapterInterface {

  private client!: Sequelize;
  // private userRepository!: Repository<User>;
  // private twoFactorUserRepository!: Repository<TwoFactorUser>;
  private errorAdapter: ErrorAdapterInterface;

  constructor(
    errorAdapter: ErrorAdapterInterface,
    connectionUri: string,
    // config?: PostgresConnectionData,
  ) {
    this.errorAdapter = errorAdapter;

    this.setupPostgresConnectionWithUri(connectionUri)
    // if (config) this.setupPostgresConnectionWithConfig(config);
    // else this.setupPostgresConnectionWithUri(connectionUri)
  }

  /**
   * Set up Postgres client with the config object.
   * 
   * @param {PostgresConnectionData} config 
   * @throws
   */
  async setupPostgresConnectionWithConfig(config: PostgresConnectionData) {
    this.client = new Sequelize(
      {
        host: 'localhost',
        port: config.port,
        database: config.database,
        dialect: 'postgres',
        username: config.username,
        password: config.password,
        models: [db.User, db.TwoFactorUser],
        repositoryMode: true,
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
  async setupPostgresConnectionWithUri(connectionUri: string) {
    this.client = new Sequelize(
      connectionUri,
      {
        models: [db.User, db.TwoFactorUser],
        repositoryMode: true,
      }
    );

    await this.authenticateConnection();
  }

  /**
   * Authenticate Postgres client connection.
   * @throws 
   */
  async authenticateConnection() {
    try {
      await this.client.authenticate();
      // this.userRepository = this.client.getRepository(db.User);
      // this.twoFactorUserRepository = this.client.getRepository(db.TwoFactorUser);

    } catch (error) {
      if (error instanceof Error) {
        this.errorAdapter.throwStorageConnectionError(error);
      }
    }
  }

  /**
   * Add new user to the database.
   * 
   * @param {RegistrationData} payload 
   * @return {Promise<AuthenticableUser | void>}
   * @throws
   */
  async register(payload: RegistrationData): Promise<AuthenticableUser | void> {
    try {
      const hashedPassword = await Bcrypt.hash(payload.password, 12);

      // const [user, created] = await this.userRepository.findOrCreate({
      //   where: { email: payload.email },
      //   defaults: {
      //     username: payload.username,
      //     firstName: payload.firstName,
      //     lastName: payload.lastName,
      //     email: payload.email,
      //     password: hashedPassword,
      //   }
      // });
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
        throw new Error("User already exists");
      }

      // const authUser: AuthenticableUser = this.convertUserToAuthenticableUser(user);
      const authUser: AuthenticableUser = user;

      return authUser;
    } catch (error) {
      if (error instanceof Error) {
        this.errorAdapter.throwRegistrationError(error);
      }
    }
  }

  /**
   * Login user.
   * 
   * @param {LoginData} payload 
   * @return {Promise<AuthenticableUser | void>}
   * @throws
   */
  async login(payload: LoginData): Promise<AuthenticableUser | void> {
    try {
      // const user = await this.userRepository.findOne({
      //   where: { email: payload.email }
      // });
      const user = await db.User.findOne({
        where: { email: payload.email }
      });

      if (!user) {
        throw new Error("No user found with the given email");
      }

      const result = await Bcrypt.compare(payload.password, user.password);
      if (!result) {
        throw new Error("Wrong email or password");
      }

      // const authUser: AuthenticableUser = this.convertUserToAuthenticableUser(user);
      const authUser: AuthenticableUser = user;

      return authUser;
    } catch (error) {
      if (error instanceof Error) {
        this.errorAdapter.throwLoginError(error);
      }
    }
  }

  /**
   * Fetch user from the database by email.
   * 
   * @param {string} email 
   * @return {Promise<AuthenticableUser | void>}
   * @throws 
   */
  async getUserByEmail(email: string): Promise<AuthenticableUser | void> {
    try {
      // const user = await this.userRepository.findOne({
      //   where: { email: email }
      // });
      
      const user = await db.User.findOne({
        where: { email: email }
      });

      if (!user) {
        throw new Error("No user found with the given email");
      }

      // const authUser: AuthenticableUser = this.convertUserToAuthenticableUser(user);
      const authUser: AuthenticableUser = user;


      return authUser;
    } catch (error) {
      if (error instanceof Error) {
        this.errorAdapter.throwStorageAdapterError(error);
      }
    }
  }

  /**
   * Fetch user from the database by id.
   * 
   * @param {string} id 
   * @return {Promise<AuthenticableUser | void>}
   * @throws Login Error
   */
  async getUserById(id: string): Promise<AuthenticableUser | void> {
    try {
      // const user = await this.userRepository.findByPk(id);
      const user = await db.User.findByPk(id);

      if (!user) {
        throw new Error("No user found with the given ID");
      }

      // const authUser: AuthenticableUser = this.convertUserToAuthenticableUser(user);
      const authUser: AuthenticableUser = user;


      return authUser;
    } catch (error) {
      if (error instanceof Error) { 
        this.errorAdapter.throwStorageAdapterError(error);
      }
    }
  }

  /**
   * Fetch user from the database by username.
   * 
   * @param {string} username 
   * @return {Promise<AuthenticableUser | void>}
   */
  async getUserByUsername(username: string): Promise<AuthenticableUser | void> {
    try {
      // const user = await this.userRepository.findOne({
      //   where: { username: username }
      // });
      const user = await db.User.findOne({
        where: { username: username }
      });

      if (!user) {
        throw new Error("No user found with the given username");
      }

      // const authUser: AuthenticableUser = this.convertUserToAuthenticableUser(user);
      const authUser: AuthenticableUser = user;


      return authUser;
    } catch (error) {
      if (error instanceof Error) { 
        this.errorAdapter.throwStorageAdapterError(error);
      }
    }
  }

  /**
   * Register two-factor user.
   * 
   * @param {TwoFactorRegistrationData} twoFactorUser 
   * @return {Promise<AuthenticableTwoFactorUser | void>}
   * @throws
   */
  async registerTwoFactorUser(twoFactorUser: TwoFactorRegistrationData): Promise<AuthenticableTwoFactorUser | void> {
    try {
      // const [user, created] = await this.twoFactorUserRepository.findOrCreate({
      //   where: { email: twoFactorUser.email },
      //   defaults: {
      //     email: twoFactorUser.email,
      //     provider: twoFactorUser.provider,
      //     secret: twoFactorUser.secret,
      //   }
      // });
      const [user, created] = await db.TwoFactorUser.findOrCreate({
        where: { email: twoFactorUser.email },
        defaults: {
          email: twoFactorUser.email,
          provider: twoFactorUser.provider,
          secret: twoFactorUser.secret,
        }
      });

      if (!created) {
        throw new Error("Two factor user already exists");
      }

      // const authUser: AuthenticableTwoFactorUser = this.convertTwoFactorUserToAuthenticableTwoFactorUser(user);
      const authUser: AuthenticableTwoFactorUser = user;


      return authUser;
    } catch (error) {
      if (error instanceof Error) { 
        this.errorAdapter.throwTwoFactorRegistrationError(error);
      }
    }
  }

  /**
   * Fetch two-factor user from the database by email.
   * 
   * @param {string} email 
   * @return {Promise<AuthenticableTwoFactorUser | void>}
   */
  async getTwoFactorUserByEmail(email: string): Promise<AuthenticableTwoFactorUser | void> {
    try {
      // const user = await this.twoFactorUserRepository.findOne({
      //   where: { email: email }
      // });
      const user = await db.TwoFactorUser.findOne({
        where: { email: email }
      });

      if (!user) {
        throw new Error("No user found with the given email");
      }

      // const authUser: AuthenticableTwoFactorUser = this.convertTwoFactorUserToAuthenticableTwoFactorUser(user);
      const authUser: AuthenticableTwoFactorUser = user;

      return authUser;
    } catch (error) {
      if (error instanceof Error) { 
        this.errorAdapter.throwTwoFactorProviderError(error);
      }
    }
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
    try {
      // const user = await this.userRepository.findOne({
      //   where: { email: email }
      // });
      const user = await db.User.findOne({
        where: { email: email }
      });

      if (!user) {
        throw new Error("No user found with the given email");
      }

      const result = await Bcrypt.compare(oldPassword, user.password);
      if (!result) {
        throw new Error("Wrong email or password");
      }

      const newHashedPassword = await Bcrypt.hash(newPassword, 12);

      // await this.userRepository.update(
      //   { password: newHashedPassword },
      //   { where: { email: email } }
      // );
      await db.User.update(
        { password: newHashedPassword },
        { where: { email: email } }
      );
    } catch (error) {
      if (error instanceof Error) { 
        this.errorAdapter.throwStorageAdapterError(error);
      }
    }
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

