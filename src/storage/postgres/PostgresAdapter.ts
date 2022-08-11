import { Sequelize, Repository } from 'sequelize-typescript';
import Bcrypt from 'bcrypt';

import RegistrationData from "../../types/RegistrationData";
import LoginData from '../../types/LoginData';
import PostgresConnectionData from "../../types/PostgresConnectionData";
import TwoFactorRegistrationData from "../../types/TwoFactorRegistrationData";
import AuthenticableUser from "../../types/AuthenticableUser";
import AuthenticableTwoFactorUser from "../../types/AuthenticableTwoFactorUser";

import User from "./models/User";
import TwoFactorUser from "./models/TwoFactorUser";

import ErrorAdapterInterface from "../../error/ErrorAdapterInterface";
import StorageAdapterInterface from "../StorageAdapterInterface";


export default class PostgresAdapter implements StorageAdapterInterface {

  private client!: Sequelize;
  private userRepository!: Repository<User>;
  private twoFactorUserRepository!: Repository<TwoFactorUser>;
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
   * Set up Postgres client with the config object
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
        models: [User, TwoFactorUser],
        repositoryMode: true,
      },
    );

    await this.authenticateConnection();
  }

  /**
   * Set up Postgres client with connection string
   * 
   * @param {string} connectionUri 
   * @throws
   */
  async setupPostgresConnectionWithUri(connectionUri: string) {
    this.client = new Sequelize(
      connectionUri,
      {
        models: [User, TwoFactorUser],
        repositoryMode: true,
      }
    );

    await this.authenticateConnection();
  }

  /**
   * Authenticate Postgres client connection
   * @throws 
   */
  async authenticateConnection() {
    try {
      await this.client.authenticate();
      this.userRepository = this.client.getRepository(User);
      this.twoFactorUserRepository = this.client.getRepository(TwoFactorUser);

    } catch (error) {
      if (error instanceof Error) {
        this.errorAdapter.throwStorageConnectionError(error);
      }
    }
  }

  /**
   * Add new user to the database
   * 
   * @param {RegistrationData} payload 
   * @return {Promise<AuthenticableUser>}
   * @throws
   */
  async register(payload: RegistrationData): Promise<AuthenticableUser | void> {
    try {
      const hashedPassword = await Bcrypt.hash(payload.password, 12);

      const [user, created] = await this.userRepository.findOrCreate({
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

      const authUser: AuthenticableUser = this.convertUserToAuthenticableUser(user);

      return authUser;
    } catch (error) {
      if (error instanceof Error) {
        this.errorAdapter.throwRegistrationError(error);
      }
    }
  }

  /**
   * Login user
   * 
   * @param {LoginData} payload 
   * @return {Promise<User>}
   * @throws
   */
  async login(payload: LoginData): Promise<AuthenticableUser | void> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: payload.email }
      });

      if (!user) {
        throw new Error("No user found with the given email");
      }

      const result = await Bcrypt.compare(payload.password, user.password);
      if (!result) {
        throw new Error("Wrong email or password");
      }

      const authUser: AuthenticableUser = this.convertUserToAuthenticableUser(user);

      return authUser;
    } catch (error) {
      if (error instanceof Error) {
        this.errorAdapter.throwLoginError(error);
      }
    }
  }

  /**
   * Fetch user from the database by email
   * 
   * @param {string} email 
   * @return {Promise<User>}
   * @throws 
   */
  async getUserByEmail(email: string): Promise<AuthenticableUser | void> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email }
      });
      if (!user) {
        throw new Error("No user found with the given email");
      }

      const authUser: AuthenticableUser = this.convertUserToAuthenticableUser(user);

      return authUser;
    } catch (error) {
      if (error instanceof Error) {
        this.errorAdapter.throwStorageAdapterError(error);
      }
    }
  }

  /**
   * Fetch user from the database by id
   * 
   * @param {string} id 
   * @return {Promise<User>}
   * @throws Login Error
   */
  async getUserById(id: string): Promise<AuthenticableUser | void> {
    try {
      const user = await this.userRepository.findByPk(id);
      if (!user) {
        throw new Error("No user found with the given ID");
      }

      const authUser: AuthenticableUser = this.convertUserToAuthenticableUser(user);

      return authUser;
    } catch (error) {
      if (error instanceof Error) { 
        this.errorAdapter.throwStorageAdapterError(error);
      }
    }
  }

  /**
   * Fetch user from the database by username
   * 
   * @param {string} username 
   * @return {Promise<User>}
   */
  async getUserByUsername(username: string): Promise<AuthenticableUser | void> {
    try {
      const user = await this.userRepository.findOne({
        where: { username: username }
      });

      if (!user) {
        throw new Error("No user found with the given username");
      }

      const authUser: AuthenticableUser = this.convertUserToAuthenticableUser(user);

      return authUser;
    } catch (error) {
      if (error instanceof Error) { 
        this.errorAdapter.throwStorageAdapterError(error);
      }
    }
  }

  /**
   * Register two-factor user
   * 
   * @param {TwoFactorRegistrationData} twoFactorUser 
   * @return {Promise<AuthenticableTwoFactorUser>}
   * @throws
   */
  async registerTwoFactorUser(twoFactorUser: TwoFactorRegistrationData): Promise<AuthenticableTwoFactorUser | void> {
    try {
      const [user, created] = await this.twoFactorUserRepository.findOrCreate({
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

      const authUser: AuthenticableTwoFactorUser = this.convertTwoFactorUserToAuthenticableTwoFactorUser(user);

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
   * @return {Promise<TwoFactorUser>}
   */
  async getTwoFactorUserByEmail(email: string): Promise<AuthenticableTwoFactorUser | void> {
    try {
      const user = await this.twoFactorUserRepository.findOne({
        where: { email: email }
      });

      if (!user) {
        throw new Error("No user found with the given email");
      }

      const authUser: AuthenticableTwoFactorUser = this.convertTwoFactorUserToAuthenticableTwoFactorUser(user);

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
   */
  async changePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
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

      await this.userRepository.update(
        { password: newHashedPassword },
        { where: { email: email } }
      );
    } catch (error) {
      if (error instanceof Error) { 
        this.errorAdapter.throwStorageAdapterError(error);
      }
    }
  }

  convertUserToAuthenticableUser(user: User): AuthenticableUser {
    const authUser: AuthenticableUser = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }

    return authUser;
  }

  convertTwoFactorUserToAuthenticableTwoFactorUser(user: TwoFactorUser): AuthenticableTwoFactorUser {
    const authUser: AuthenticableTwoFactorUser = {
      id: user.id,
      email: user.email,
      provider: user.provider,
      secret: user.secret
    }

    return authUser;
  }
}

