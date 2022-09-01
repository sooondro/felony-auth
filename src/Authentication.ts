import StorageAdapterInterface from './storage/StorageAdapterInterface'
import CacheAdapterInterface from './cache/CacheAdapterInterface'
import ErrorAdapterInterface from './error/ErrorAdapterInterface'
import ValidationAdapterInterface from './validation/ValidationAdapterInterface'
import TwoFactorProviderInterface from './providers/two-factor/TwoFactorProviderInterface'

import RegistrationData from './types/RegistrationData'
import LoginData from './types/LoginData'
import Session from './types/Session'
import AuthenticableUser from './types/AuthenticableUser'
import AuthenticableTwoFactorUser from './types/AuthenticableTwoFactorUser'
import ErrorData from './types/ErrorData'
import AuthenticationError from './error/AuthenticationError'
import { ValidationErrors } from './error/ValidationError'

export default class Authentication {
  private errorAdapter!: ErrorAdapterInterface
  private validationAdapter!: ValidationAdapterInterface
  private storageAdapter!: StorageAdapterInterface
  private readonly globalAuthConfig!: object
  private cacheAdapter!: CacheAdapterInterface
  private twoFactorProvider!: TwoFactorProviderInterface
  // TODO get back to this when we add multiple twoFactorProviders
  // private twoFactorProviders: Map<string, TwoFactorProviderInterface>;

  public get ErrorAdapter (): ErrorAdapterInterface {
    return this.errorAdapter
  }

  public set ErrorAdapter (errorAdapter: ErrorAdapterInterface) {
    errorAdapter.initialize(this)
    this.errorAdapter = errorAdapter
  }

  public get ValidationAdapter (): ValidationAdapterInterface {
    return this.validationAdapter
  }

  public set ValidationAdapter (validationAdapter: ValidationAdapterInterface) {
    validationAdapter.initialize(this)
    this.validationAdapter = validationAdapter
  }

  public get StorageAdapter (): StorageAdapterInterface {
    return this.storageAdapter
  }

  public set StorageAdapter (storageAdapter: StorageAdapterInterface) {
    storageAdapter.initialize(this)
    this.storageAdapter = storageAdapter
  }

  public get CacheAdapter (): CacheAdapterInterface {
    return this.cacheAdapter
  }

  public set CacheAdapter (cacheAdapter: CacheAdapterInterface) {
    cacheAdapter.initialize(this)
    this.cacheAdapter = cacheAdapter
  }

  public set TwoFactorProvider (twoFactorProvider: TwoFactorProviderInterface) {
    twoFactorProvider.initialize(this)
    this.twoFactorProvider = twoFactorProvider
  }

  public get TwoFactorProvider (): TwoFactorProviderInterface {
    return this.twoFactorProvider
  }

  public get GlobalAuthConfig (): object {
    return this.globalAuthConfig
  }

  // TODO get back to this when we add multiple twoFactorProviders
  // public set twoFactorProvider(twoFactorProvider: TwoFactorProviderInterface) {
  // this.twoFactorProviders.set(twoFactorProvider.provider, twoFactorProvider);
  // }
  // public get twoFactorProviders() {
  // return this.twoFactorProviders;
  // }
  // public set twoFactorProviders(twoFactorProviders: Map<string, TwoFactorProviderInterface>) {
  // this.twoFactorProviders = twoFactorProviders;
  // }

  /**
   * Register user.
   *
   * @param {RegistrationData} payload
   * @return {{AuthenticableUser, AuthenticableTwoFactorUser}}
   */
  async register (payload: RegistrationData): Promise<{ user: AuthenticableUser, twoFactorUser?: AuthenticableTwoFactorUser, qrCode?: string }> {
    try {
      this.validationAdapter.registration(payload)

      const user = await this.storageAdapter.register(payload)
      const result: { user: AuthenticableUser, twoFactorUser?: AuthenticableTwoFactorUser, qrCode?: string } = { user }

      if (payload.twoFactorAuthentication) {
        const { twoFactorUser, qrCode } = await this.registerTwoFactorUser(user)
        result.twoFactorUser = twoFactorUser
        result.qrCode = qrCode
      }

      return result
    } catch (error: any) {
      const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error
      throw this.errorAdapter.handleError(err)
    }
  }

  /**
   * Login user.
   *
   * @param {LoginData} payload
   * @return {string}
   */
  async login (payload: LoginData): Promise<string> {
    try {
      this.validationAdapter.login(payload)

      const user = await this.storageAdapter.login(payload)

      if (payload.twoFactorAuthentication && (payload.twoFactorAuthenticationData != null)) {
        const twoFactorUser = await this.storageAdapter.getTwoFactorUser(user)
        this.twoFactorProvider.verify(twoFactorUser, payload.twoFactorAuthenticationData.code)
      }

      const sessionId = await this.cacheAdapter.createSession(user)
      return sessionId
    } catch (error: any) {
      const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error
      throw this.errorAdapter.handleError(err)
    }
  }

  /**
   *
   * @param {AuthenticableUser} user
   * @return {{ twoFactorUser: AuthenticableTwoFactorUser; qrCode: string; }}
   */
  async registerTwoFactorUser (user: AuthenticableUser): Promise<{ twoFactorUser: AuthenticableTwoFactorUser, qrCode: string }> {
    try {
      const twoFactorUserRegistrationData = this.twoFactorProvider.register(user)

      const twoFactorUser = await this.storageAdapter.registerTwoFactorUser(twoFactorUserRegistrationData)

      const qrCode = await this.twoFactorProvider.generateQRCode(twoFactorUser)

      return { twoFactorUser, qrCode }
    } catch (error: any) {
      const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error
      throw this.errorAdapter.handleError(err)
    }
  }

  /**
   * Setup 2fa for user by session ID.
   *
   * @param {string} sessionId
   * @returns {string}
   */
  async registerTwoFactorUserBySessionId (sessionId: string): Promise<{ twoFactorUser: AuthenticableTwoFactorUser, qrCode: string }> {
    try {
      const session = await this.cacheAdapter.getSession(sessionId)

      return await this.registerTwoFactorUser(session.user)
    } catch (error: any) {
      const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error
      throw this.errorAdapter.handleError(err)
    }
  }

  /**
   * Verifies the two-factor user.
   *
   * @param {AuthenticableTwoFactorUser} user
   */
  async verifyTwoFactorUser (twoFactorUser: AuthenticableTwoFactorUser, code: string): Promise<void> {
    try {
      this.twoFactorProvider.verify(twoFactorUser, code)
    } catch (error: any) {
      const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error
      throw this.errorAdapter.handleError(err)
    }
  }

  /**
   * Verifies the two-factor user using AuthenticableUser object.
   *
   * @param {AuthenticableUser} user
   * @param {string} code
   */
  async verifyTwoFactorUserByAuthenticableUser (user: AuthenticableUser, code: string): Promise<void> {
    try {
      const twoFactorUser = await this.storageAdapter.getTwoFactorUser(user)
      this.twoFactorProvider.verify(twoFactorUser, code)
    } catch (error: any) {
      const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error
      throw this.errorAdapter.handleError(err)
    }
  }

  /**
   * Validate whether the received csrf token is equal to the one stored in the user session.
   *
   * @param {string} sessionId
   * @param {string} token
   */
  async validateCSRFToken (sessionId: string, token: string): Promise<void> {
    try {
      this.cacheAdapter.validateCSRF(sessionId, token)
    } catch (error: any) {
      const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error
      throw this.errorAdapter.handleError(err)
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
   * @return
   */
  async getSession (sessionId: string): Promise<Session> {
    try {
      return await this.cacheAdapter.getSession(sessionId)
    } catch (error: any) {
      const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error
      throw this.errorAdapter.handleError(err)
    }
  }

  /**
   * Create user session.
   *
   * @param {AuthenticableUser} payload
   */
  async createSession (payload: AuthenticableUser): Promise<string> {
    try {
      return await this.cacheAdapter.createSession(payload)
    } catch (error: any) {
      const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error
      throw this.errorAdapter.handleError(err)
    }
  }

  /**
   * Change user's password.
   *
   * @param {string} email
   * @param {string} oldPassword
   * @param {string} newPassword
   */
  async changePassword (email: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      await this.storageAdapter.changePassword(email, oldPassword, newPassword)
    } catch (error: any) {
      const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error
      throw this.errorAdapter.handleError(err)
    }
  }

  /**
   *
   * @param {AuthenticableUser} user
   * @return {Promise<AuthenticableTwoFactorUser>}
   */
  async getTwoFactorUser (user: AuthenticableUser): Promise<AuthenticableTwoFactorUser> {
    try {
      return await this.storageAdapter.getTwoFactorUser(user)
    } catch (error: any) {
      const err: string | ErrorData | Error | AuthenticationError | ValidationErrors = error
      throw this.errorAdapter.handleError(err)
    }
  }
}
