import { authenticator } from 'otplib'
import QRCode from 'qrcode'

import { Authentication } from '../../Authentication'
import { TwoFactorProviderInterface } from './TwoFactorProviderInterface'
import { AuthenticationError } from '../../error/AuthenticationError'

import TwoFactorRegistrationData from '../../types/TwoFactorRegistrationData'
import AuthenticableTwoFactorUser from '../../types/AuthenticableTwoFactorUser'
import AuthenticableUser from '../../types/AuthenticableUser'

export class TOTPTwoFactorProvider implements TwoFactorProviderInterface {
  private authentication!: Authentication

  /**
   * Type of two-factor provider.
   */
  provider = 'TOTP'

  /**
   * Used for injecting Authentication class into the adapter.
   *
   * @param {Authentication} authentication
   */
  initialize (authentication: Authentication): void {
    this.authentication = authentication
  }

  /**
   * Generates data required for two-factor user registration.
   *
   * @param {AuthenticableUser} user
   * @returns
   */
  generateRegistrationData (user: AuthenticableUser): TwoFactorRegistrationData {
    const secret = authenticator.generateSecret()

    const userData: TwoFactorRegistrationData = {
      userId: user.id,
      secret,
      provider: this.provider
    }

    return userData
  }

  /**
   * Generates QR code base on AuthenticableTwoFactorUser object.
   *
   * @param {AuthenticableTwoFactorUser} user
   * @returns
   */
  async generateQRCode (user: AuthenticableTwoFactorUser): Promise<string> {
    return await QRCode.toDataURL(authenticator.keyuri(user.userId, '2FA Felony', user.secret))
  }

  /**
   * Verifies the given code with the secret stored in the database.
   *
   * @param {TwoFactorAuthenticationData} user
   * @param {string} token
   * @returns
   */
  verify (user: AuthenticableTwoFactorUser, token: string): void {
    if (!authenticator.check(token, user.secret)) {
      // 'Verification failed! Invalid 2FA code!'
      throw new AuthenticationError('invalid credentials', { name: 'AuthenticationError', statusCode: 401 })
    }
  }
}
