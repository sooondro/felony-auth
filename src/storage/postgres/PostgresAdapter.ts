import { Sequelize, DataTypes } from 'sequelize'
import Bcrypt from 'bcrypt'

import { Authentication } from '../../Authentication'
import { StorageAdapterInterface } from '../StorageAdapterInterface'
import Models from './db/models/Models'
import { ValidationErrors } from '../../error/ValidationError'
import { AuthenticationError } from '../../error/AuthenticationError'

import RegistrationData from '../../types/RegistrationData'
import LoginData from '../../types/LoginData'
import PostgresConnectionData from '../../types/PostgresConnectionData'
import TwoFactorRegistrationData from '../../types/TwoFactorRegistrationData'
import AuthenticableUser from '../../types/AuthenticableUser'
import AuthenticableTwoFactorUser from '../../types/AuthenticableTwoFactorUser'

/**
 * Storage adapter for the Postgres database.
 */
export class PostgresAdapter implements StorageAdapterInterface {
  private client!: Sequelize
  private authentication!: Authentication
  public models!: Models

  /**
   * Getter method for Postgres client.
   */
  public get Client (): Sequelize {
    return this.client
  }

  /**
   * Used for injecting Authentication class into the adapter.
   *
   * @param {Authentication} authentication
   */
  initialize (authentication: Authentication): void {
    this.authentication = authentication
  }

  /**
   * Set up Postgres connection with the config object.
   *
   * @param {PostgresConnectionData} config
   * @throws
   */
  async setupConnectionWithConnectionData (config: PostgresConnectionData): Promise<void> {
    this.client = new Sequelize(config.database, config.username, config.password, {
      dialect: 'postgres',
      host: config.host,
      port: config.port,
      logging: false
    })

    this.models = new Models(this.client, DataTypes)
  }

  /**
   * Set up Postgres connection with the config object.
   *
   * @param {string} connectionUrl
   * @throws
   */
  async setupConnectionWithConnectionString (connectionUrl: string): Promise<void> {
    this.client = new Sequelize(connectionUrl, {
      dialect: 'postgres',
      logging: false
    })

    this.models = new Models(this.client, DataTypes)
  }

  /**
   * Add new user to the database.
   *
   * @param {RegistrationData} payload
   * @return {Promise<AuthenticableUser>}
   * @throws {ValidationErrors}
   */
  async register (payload: RegistrationData): Promise<AuthenticableUser> {
    const hashedPassword = await Bcrypt.hash(payload.password, 12)

    const [user, created]: [AuthenticableUser, boolean] = await this.models.User.findOrCreate({
      where: { email: payload.email },
      defaults: {
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: hashedPassword
      }
    })

    if (!created) {
      const validationErrors = new ValidationErrors()
      validationErrors.addError('email', 'invalid credentials')
      throw validationErrors
    }

    return user
  }

  /**
   * Register two-factor user.
   *
   * @param {TwoFactorRegistrationData} payload
   * @return {Promise<AuthenticableTwoFactorUser>}
   * @throws {ValidationErrors}
   */
  async registerTwoFactorUser (payload: TwoFactorRegistrationData): Promise<AuthenticableTwoFactorUser> {
    const [user, created]: [AuthenticableTwoFactorUser, boolean] = await this.models.TwoFactorUser.findOrCreate({
      where: { userId: payload.userId, provider: payload.provider },
      defaults: {
        userId: payload.userId,
        provider: payload.provider,
        secret: payload.secret
      }
    })

    if (!created) {
      const validationErrors = new ValidationErrors()
      validationErrors.addError('provider', 'user with the given provider already exists')
      throw validationErrors
    }

    return user
  }

  /**
   * Login user.
   *
   * @param {LoginData} payload
   * @return {Promise<AuthenticableUser>}
   * @throws {ValidationErrors}
   */
  async login (payload: LoginData): Promise<{ user: AuthenticableUser, twoFactorUsers: AuthenticableTwoFactorUser[] }> {
    const user = await this.models.User.findOne({
      where: { email: payload.email },
      include: {
        model: this.models.TwoFactorUser
      }
    })

    if (user === null) {
      const validationErrors = new ValidationErrors()
      validationErrors.addError('email', 'invalid credentials')
      throw validationErrors
    }

    const result = await Bcrypt.compare(payload.password, user.password)

    if (!result) {
      throw new AuthenticationError('invalid credentials', { name: 'AuthenticationError', statusCode: 401 })
    }

    const authUser: AuthenticableUser = user

    return { user: authUser, twoFactorUsers: user.TwoFactorUsers }
  }

  /**
   * Fetch user from the database by email.
   *
   * @param {string} email
   * @return {Promise<AuthenticableUser>}
   * @throws {ValidationErrors}
   */
  async getUserByEmail (email: string): Promise<AuthenticableUser> {
    const user = await this.models.User.findOne({
      where: { email }
    })

    if (user === null) {
      const validationErrors = new ValidationErrors()
      validationErrors.addError('email', 'invalid credentials')
      throw validationErrors
    }

    const authUser: AuthenticableUser = user

    return authUser
  }

  /**
   * Fetch user from the database by id.
   *
   * @param {string} id
   * @return {Promise<AuthenticableUser>}
   * @throws {ValidationErrors}
   */
  async getUserById (id: string): Promise<AuthenticableUser> {
    const user = await this.models.User.findByPk(id)

    if (user === null) {
      const validationErrors = new ValidationErrors()
      validationErrors.addError('id', 'invalid credentials')
      throw validationErrors
    }

    const authUser: AuthenticableUser = user

    return authUser
  }

  /**
   * Fetch user from the database by username.
   *
   * @param {string} username
   * @return {Promise<AuthenticableUser>}
   * @throws {ValidationErrors}
   */
  async getUserByUsername (username: string): Promise<AuthenticableUser> {
    const user = await this.models.User.findOne({
      where: { username }
    })

    if (user === null) {
      const validationErrors = new ValidationErrors()
      validationErrors.addError('username', 'invalid credentials')
      throw validationErrors
    }

    const authUser: AuthenticableUser = user

    return authUser
  }

  /**
   * Fetch two-factor user by AuthenticableUser object.
   *
   * @param {AuthenticableUser} user
   * @return {AuthenticableTwoFactorUser}
   * @throws {ValidationErrors}
   */
  async getTwoFactorUser (user: AuthenticableUser): Promise<AuthenticableTwoFactorUser> {
    const twoFactorUser: AuthenticableTwoFactorUser = await this.models.TwoFactorUser.findOne({
      where: { userId: user.id }
    })

    if (twoFactorUser === null) {
      const validationErrors = new ValidationErrors()
      validationErrors.addError('id', 'invalid credentials')
      throw validationErrors
    }

    return twoFactorUser
  }

  /**
   * Used for fetching array of names of all the enabled two-factor providers for the given email.
   *
   * @param {string} email
   * @returns {string[]}
   * @throws {ValidationErrors}
   */
  async getUsersTwoFactorProvidersByEmail (email: string): Promise<string[]> {
    const user = await this.models.User.findOne({
      where: { email },
      include: {
        model: this.models.TwoFactorUser
      }
    })

    if (user === null) {
      const validationErrors = new ValidationErrors()
      validationErrors.addError('email', 'invalid credentials')
      throw validationErrors
    }

    const result: string[] = []

    user.TwoFactorUsers.forEach((element: { provider: string }) => {
      result.push(element.provider)
    })

    return result
  }

  /**
   * Change user's password.
   *
   * @param {string} email
   * @param {string} oldPassword
   * @param {string} newPassword
   * @return {Promise<void>}
   * @throws {ValidationErrors | AuthenticationError}
   */
  async changePassword (email: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.models.User.findOne({
      where: { email }
    })

    if (user === null) {
      const validationErrors = new ValidationErrors()
      validationErrors.addError('email', 'invalid credentials')
      throw validationErrors
    }

    const result = await Bcrypt.compare(oldPassword, user.password)

    if (!result) {
      throw new AuthenticationError('invalid credentials', { name: 'AuthenticationError', statusCode: 401 })
    }

    const newHashedPassword = await Bcrypt.hash(newPassword, 12)

    await this.models.User.update(
      { password: newHashedPassword },
      { where: { email } }
    )
  }
}
