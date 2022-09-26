import { StorageAdapterInterface } from './storage/StorageAdapterInterface'
import { CacheAdapterInterface } from './cache/CacheAdapterInterface'
import { ErrorAdapterInterface } from './error/ErrorAdapterInterface'
import { ValidationAdapterInterface } from './validation/ValidationAdapterInterface'
import { TwoFactorProviderInterface } from './providers/two-factor/TwoFactorProviderInterface'

import { AuthenticationError } from './error/AuthenticationError'

import LoginData from './types/LoginData'
import Session from './types/Session'
import RegistrationData from './types/RegistrationData'
import AuthenticableUser from './types/AuthenticableUser'
import AuthenticableTwoFactorUser from './types/AuthenticableTwoFactorUser'

export class Authentication {
  private errorAdapter!: ErrorAdapterInterface
  private validationAdapter!: ValidationAdapterInterface
  private storageAdapter!: StorageAdapterInterface
  private globalAuthConfig!: object
  private cacheAdapter!: CacheAdapterInterface
  private twoFactorProviders = new Map<string, TwoFactorProviderInterface>()

  /**
   * Getter for the error adapter.
   */
  public get ErrorAdapter (): ErrorAdapterInterface {
    return this.errorAdapter
  }

  /**
   * Setter for the error adapter.
   */
  public set ErrorAdapter (errorAdapter: ErrorAdapterInterface) {
    errorAdapter.initialize(this)
    this.errorAdapter = errorAdapter
  }

  /**
   * Getter for the validation adapter.
   */
  public get ValidationAdapter (): ValidationAdapterInterface {
    return this.validationAdapter
  }

  /**
   * Setter for the validation adapter.
   */
  public set ValidationAdapter (validationAdapter: ValidationAdapterInterface) {
    validationAdapter.initialize(this)
    this.validationAdapter = validationAdapter
  }

  /**
   * Getter for the storage adapter.
   */
  public get StorageAdapter (): StorageAdapterInterface {
    return this.storageAdapter
  }

  /**
   * Setter for the storage adapter.
   */
  public set StorageAdapter (storageAdapter: StorageAdapterInterface) {
    storageAdapter.initialize(this)
    this.storageAdapter = storageAdapter
  }

  /**
   * Getter for the cache adapter.
   */
  public get CacheAdapter (): CacheAdapterInterface {
    return this.cacheAdapter
  }

  /**
   * Setter for the cache adapter.
   */
  public set CacheAdapter (cacheAdapter: CacheAdapterInterface) {
    cacheAdapter.initialize(this)
    this.cacheAdapter = cacheAdapter
  }

  /**
   * Getter for the global auth config object.
   */
  public get GlobalAuthConfig (): object {
    return this.globalAuthConfig
  }

  /**
   * Setter for the global auth config object.
   */
  public set GlobalAuthConfig (globalAuthConfig: object) {
    this.globalAuthConfig = globalAuthConfig
  }

  /**
   * Getter for the two-factor providers.
   */
  public get TwoFactorProviders (): Map<string, TwoFactorProviderInterface> {
    return this.twoFactorProviders
  }

  /**
   * Setter for the two-factor providers.
   */
  public set TwoFactorProviders (twoFactorProviders: Map<string, TwoFactorProviderInterface>) {
    this.twoFactorProviders = twoFactorProviders
  }

  /**
   * Setter method used to add a new two-factor provider.
   *
   * @param {TwoFactorProviderInterface} payload
   */
  addTwoFactorProvider (payload: TwoFactorProviderInterface): void { // PITANJE da ostavim da prepise vrijednost ako vec postoji ili da radim provjeru
    this.twoFactorProviders.set(payload.provider, payload)
  }

  /**
   * Getter method used to fetch a certain two-factor provider.
   *
   * @param {string} provider
   * @return {TwoFactorProviderInterface}
   * @throws
   */
  getTwoFactorProvider (provider: string): TwoFactorProviderInterface {
    const result = this.twoFactorProviders.get(provider)

    if (result === undefined || result === null) {
      throw new AuthenticationError('provider not found', { name: 'AuthenticationError', statusCode: 500 })
    }

    return result
  }

  /**
   * Register user.
   *
   * @param {RegistrationData} payload
   * @return {Promise<{ user: AuthenticableUser, twoFactorUser?: AuthenticableTwoFactorUser, qrCode?: string }>}
   * @throws
   */
  async register (payload: RegistrationData): Promise<{ user: AuthenticableUser, twoFactorUser?: AuthenticableTwoFactorUser, qrCode?: string }> {
    try {
      this.validationAdapter.registration(payload)

      const user = await this.storageAdapter.register(payload)
      const result: { user: AuthenticableUser, twoFactorUser?: AuthenticableTwoFactorUser, qrCode?: string } = { user }

      if (payload.twoFactorAuthenticationProvider !== undefined && payload.twoFactorAuthenticationProvider !== null) {
        const { twoFactorUser, qrCode } = await this.registerTwoFactorUser(user, payload.twoFactorAuthenticationProvider)
        result.twoFactorUser = twoFactorUser
        result.qrCode = qrCode
      }

      return result
    } catch (error: any) {
      throw this.errorAdapter.handleError(error)
    }
  }

  /**
   * Login user.
   *
   * @param {LoginData} payload
   * @return {Promise<string>}
   * @throws
   */
  async login (payload: LoginData): Promise<string> {
    try {
      this.validationAdapter.login(payload)

      const { user, twoFactorUsers } = await this.storageAdapter.login(payload)

      if (twoFactorUsers.length !== 0) {
        await this.twoFactorAuthenticationLogin(payload, twoFactorUsers)
      }

      const sessionId = await this.cacheAdapter.createSession(user)
      return sessionId
    } catch (error: any) {
      throw this.errorAdapter.handleError(error)
    }
  }

  /**
   * Sequence for two-factor authentication login process.
   *
   * @param {LoginData} payload
   * @param {AuthenticableTwoFactorUser[]} twoFactorUsers
   */
  async twoFactorAuthenticationLogin (payload: LoginData, twoFactorUsers: AuthenticableTwoFactorUser[]): Promise<void> {
    if (payload.twoFactorAuthenticationData === undefined || payload.twoFactorAuthenticationData === null) {
      throw new AuthenticationError('invalid credentials', { name: 'AuthenticationError', statusCode: 401 })
    }

    const provider = payload.twoFactorAuthenticationData.provider

    const twoFactorUser = twoFactorUsers.find(user => user.provider === provider)

    if (twoFactorUser === undefined) {
      throw new AuthenticationError('invalid credentials', { name: 'AuthenticationError', statusCode: 401 })
    }

    await this.verifyTwoFactorUser(twoFactorUser, payload.twoFactorAuthenticationData.code, payload.twoFactorAuthenticationData.provider)
  }

  /**
   * Registers a new two-factor user to the database.
   *
   * @param {AuthenticableUser} user
   * @return {Promise<{ twoFactorUser: AuthenticableTwoFactorUser, qrCode: string }>}
   * @throws
   */
  async registerTwoFactorUser (user: AuthenticableUser, provider: string): Promise<{ twoFactorUser: AuthenticableTwoFactorUser, qrCode: string }> {
    try {
      const twoFactorProvider = this.getTwoFactorProvider(provider)

      const twoFactorUserRegistrationData = twoFactorProvider.generateRegistrationData(user)

      const twoFactorUser = await this.storageAdapter.registerTwoFactorUser(twoFactorUserRegistrationData)

      const qrCode = await twoFactorProvider.generateQRCode(twoFactorUser)

      return { twoFactorUser, qrCode }
    } catch (error: any) {
      throw this.errorAdapter.handleError(error)
    }
  }

  /**
   * Setup 2fa for user by session ID.
   *
   * @param {string} sessionId
   * @returns {Promise<{ twoFactorUser: AuthenticableTwoFactorUser, qrCode: string }>}
   * @throws
   */
  async registerTwoFactorUserBySessionId (sessionId: string, provider: string): Promise<{ twoFactorUser: AuthenticableTwoFactorUser, qrCode: string }> {
    try {
      const session = await this.cacheAdapter.getSession(sessionId)

      return await this.registerTwoFactorUser(session.user, provider)
    } catch (error: any) {
      throw this.errorAdapter.handleError(error)
    }
  }

  /**
   * Verifies the two-factor user.
   *
   * @param {AuthenticableTwoFactorUser} twoFactorUser
   * @param {string} code
   * @param {string} provider
   * @throws
   */
  async verifyTwoFactorUser (twoFactorUser: AuthenticableTwoFactorUser, code: string, provider: string): Promise<void> {
    try {
      const twoFactorProvider = this.getTwoFactorProvider(provider)
      twoFactorProvider.verify(twoFactorUser, code)
    } catch (error: any) {
      throw this.errorAdapter.handleError(error)
    }
  }

  /**
   * Verifies the two-factor user using AuthenticableUser object.
   *
   * @param {AuthenticableUser} user
   * @param {string} code
   * @throws
   */
  async verifyTwoFactorUserByAuthenticableUser (user: AuthenticableUser, code: string, provider: string): Promise<void> {
    try {
      const twoFactorUser = await this.storageAdapter.getTwoFactorUser(user)
      const twoFactorProvider = this.getTwoFactorProvider(provider)
      twoFactorProvider.verify(twoFactorUser, code)
    } catch (error: any) {
      throw this.errorAdapter.handleError(error)
    }
  }

  /**
   * Validate whether the received csrf token is equal to the one stored in the user session.
   *
   * @param {string} sessionId
   * @param {string} token
   * @throws
   */
  async validateCSRFToken (sessionId: string, token: string): Promise<void> {
    try {
      this.cacheAdapter.validateCSRF(sessionId, token)
    } catch (error: any) {
      throw this.errorAdapter.handleError(error)
    }
  }

  /**
   * Logout user.
   *
   * @param {string} sessionId
   */
  async logout (sessionId: string): Promise<void> {
    await this.cacheAdapter.logout(sessionId)
  }

  /**
   * Retreive user session.
   *
   * @param sessionId
   * @returns {Promise<Session>}
   * @throws
   */
  async getSession (sessionId: string): Promise<Session> {
    try {
      return await this.cacheAdapter.getSession(sessionId)
    } catch (error: any) {
      throw this.errorAdapter.handleError(error)
    }
  }

  /**
   * Create user session.
   *
   * @param {AuthenticableUser} payload
   * @returns {Promise<string>}
   * @throws
   */
  async createSession (payload: AuthenticableUser): Promise<string> {
    try {
      return await this.cacheAdapter.createSession(payload)
    } catch (error: any) {
      throw this.errorAdapter.handleError(error)
    }
  }

  /**
   * Change user's password.
   *
   * @param {string} email
   * @param {string} oldPassword
   * @param {string} newPassword
   * @throws
   */
  async changePassword (email: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      await this.storageAdapter.changePassword(email, oldPassword, newPassword)
    } catch (error: any) {
      throw this.errorAdapter.handleError(error)
    }
  }

  /**
   * Fetch an AuthenticableTwoFactorUser.
   *
   * @param {AuthenticableUser} user
   * @return {Promise<AuthenticableTwoFactorUser>}
   * @throws
   */
  async getTwoFactorUser (user: AuthenticableUser): Promise<AuthenticableTwoFactorUser> {
    try {
      return await this.storageAdapter.getTwoFactorUser(user)
    } catch (error: any) {
      throw this.errorAdapter.handleError(error)
    }
  }

  /**
   * Fetch all the providers enabled for the given email.
   *
   * @param {string} email
   * @returns {Promise<string[]>}
   * @throws
   */
  async getUsersTwoFactorProviders (email: string): Promise<string[]> {
    try {
      return await this.storageAdapter.getUsersTwoFactorProvidersByEmail(email)
    } catch (error: any) {
      throw this.errorAdapter.handleError(error)
    }
  }
}
