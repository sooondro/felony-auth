import { Authentication } from '../Authentication'

import RegistrationData from '../types/RegistrationData'
import LoginData from '../types/LoginData'

/**
 * Validation adapter interface.
 *
 * @type {Interface}
 */
export interface ValidationAdapterInterface {
  /**
   * Used for injecting Authentication class into the adapter.
   *
   * @param {Authentication} authentication
   */
  initialize: (authentication: Authentication) => void

  /**
   * Validate registration data.
   *
   * @param {RegistrationData} payload
   * @throws
   */
  registration: (payload: RegistrationData) => void

  /**
   * Validate login data.
   *
   * @param {LoginData} payload
   * @throws
   */
  login: (payload: LoginData) => void
}
