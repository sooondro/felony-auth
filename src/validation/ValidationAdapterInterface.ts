// import ErrorAdapterInterface from "../error/ErrorAdapterInterface";
import RegistrationData from '../types/RegistrationData'
import LoginData from '../types/LoginData'
import Authentication from '../Authentication'

/**
 * Validation adapter interface.
 *
 * @type {Interface}
 */
export default interface ValidationAdapterInterface {
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
