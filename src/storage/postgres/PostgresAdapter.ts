import { Sequelize, Repository } from 'sequelize-typescript';
import Bcrypt from 'bcrypt';

import RegistrationData from "../../types/RegistrationData";
import LoginData from '../../types/LoginData';
import PostgresConnectionData from "../../types/PostgresConnectionData";
import TwoFactorRegistrationData from "../../types/TwoFactorRegistrationData";

import User from "./models/User";
import TwoFactorUser from "./models/TwoFactorUser";

import ErrorAdapterInterface from "../../error/ErrorAdapterInterface";
import StorageAdapterInterface from "../StorageAdapterInterface";

export default class PostgresAdapter implements StorageAdapterInterface {

  private client: Sequelize;
  private userRepository: Repository<User>;
  private twoFactorUserRepository: Repository<TwoFactorUser>;
  private errorAdapter: ErrorAdapterInterface;

  constructor(
    errorAdapter: ErrorAdapterInterface,
    connectionUri?: string,
    config?: PostgresConnectionData,
  ) {
    this.errorAdapter = errorAdapter;

    config
      ? this.setupPostgresConnectionWithConfig(config)
      : this.setupPostgresConnectionWithUri(connectionUri);
  }

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

  async authenticateConnection() {
    try {
      await this.client.authenticate();
      this.userRepository = this.client.getRepository(User);
      this.twoFactorUserRepository = this.client.getRepository(TwoFactorUser);

    } catch (error) {
      this.errorAdapter.throwStorageConnectionError(error);
    }
  }

  async register(payload: RegistrationData): Promise<User> {
    let hashedPassword: string;
    try {
      hashedPassword = await Bcrypt.hash(payload.password, 12);

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
        this.errorAdapter.throwRegistrationError(new Error("User already exists"));
      }
      return user;
    } catch (error) {
      this.errorAdapter.throwRegistrationError(error);
    }
  }

  async login(payload: LoginData): Promise<User> {
    try {
      const user = await this.getUserByEmail(payload.email);
      if (!user) this.errorAdapter.throwLoginError(new Error("No user found with the given email"));

      const result = await Bcrypt.compare(payload.password, user.password);
      if (!result) this.errorAdapter.throwLoginError(new Error("Wrong email or password"));

      return user;
    } catch (error) {
      this.errorAdapter.throwLoginError(error);
    }
  }

  async registerTwoFactorUser(twoFactorUser: TwoFactorRegistrationData) {
    try {
      console.log("MDA USLO JE U 2FA REGISTRATION");
      
      const [user, created] = await this.twoFactorUserRepository.findOrCreate({
        where: { email: twoFactorUser.email },
        defaults: {
          email: twoFactorUser.email,
          provider: twoFactorUser.provider,
          secret: twoFactorUser.secret,
        }
      });
      console.log("KREIRALO JE 2FA USER", user);

      if(!created) {
        this.errorAdapter.throwTwoFactorRegistrationError(new Error("Two factor user already exists"));
      }
      
      return user;
    } catch (error) {
      this.errorAdapter
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    console.log(email);

    const user = await this.userRepository.findOne({
      where: { email: email }
    });
    if (!user) this.errorAdapter.throwLoginError(new Error("No user found with the given email"));
    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findByPk(id);
    if (!user) this.errorAdapter.throwLoginError(new Error("No user found with the key"));
    return user;
  }

  async getUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username: username }
    });
    if (!user) this.errorAdapter.throwLoginError(new Error("No user found with the given username"));
    return user;
  }

  async getTwoFactorUserByEmail(email: string) {
    const user = await this.twoFactorUserRepository.findOne({
      where: {email: email}
    });
    if (!user) this.errorAdapter.throwLoginError(new Error("No user found with the given email"));
    return user;
  }
}

