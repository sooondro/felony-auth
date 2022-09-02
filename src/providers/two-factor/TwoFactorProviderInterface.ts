import { Authentication } from '../../Authentication'

import AuthenticableTwoFactorUser from '../../types/AuthenticableTwoFactorUser'
import AuthenticableUser from '../../types/AuthenticableUser'
import TwoFactorRegistrationData from '../../types/TwoFactorRegistrationData'

/**
 * Interface for the 2FA provider
 */
export interface TwoFactorProviderInterface {
  /**
   * Type of provider e.g. software tokens (TOTP), SMS text message, hardware tokens.
   */
  provider: string

  /**
   * Used for injecting Authentication class into the adapter.
   *
   * @param {Authentication} authentication
   */
  initialize: (authentication: Authentication) => void

  /**
   * Generates data required for two-factor user registration.
   *
   * @param {AuthenticableUser} user
   */
  generateRegistrationData: (user: AuthenticableUser) => TwoFactorRegistrationData

  /**
   * Generates QR code based on two-factor registration data.
   *
   * @param {AuthenticableTwoFactorUser} user
   */
  generateQRCode: (user: AuthenticableTwoFactorUser) => Promise<string>

  /**
   * Verifies the 2FA data e.g. if the one time password (TOTP) is valid.
   *
   * @param {AuthenticableTwoFactorUser} user
   * @param {string} code
   */
  verify: (user: AuthenticableTwoFactorUser, code: string) => void
}
