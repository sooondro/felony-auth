import Validator from 'validator'

import ValidationAdapterInterface from './ValidationAdapterInterface'
import Authentication from '../Authentication'

import RegistrationData from '../types/RegistrationData'
import LoginData from '../types/LoginData'
import { ValidationErrors } from '../error/ValidationError'

/**
 * Default validation adapter implementation.
 *
 * @type {Class}
 */
export default class DefaultValidationAdapter implements ValidationAdapterInterface {
  private authentication?: Authentication

  /**
   * Used for injecting Authentication class into the adapter
   *
   * @param {Authentication} authentication
   */
  initialize (authentication: Authentication): void {
    this.authentication = authentication
  }

  /**
   * Validate registration data.
   *
   * @param {RegistrationData} payload
   * @throws
   */
  registration (payload: RegistrationData): void {
    const validationErrors = new ValidationErrors()
    if (!Validator.isEmail(payload.email)) {
      validationErrors.addError('email', 'email')
    }

    if (!Validator.isLength(payload.password, { min: 6 })) {
      validationErrors.addError('password', 'min:6')
    }

    if (validationErrors.hasErrors()) {
      throw validationErrors
    }
  }

  /**
   * Validate login data.
   *
   * @param payload
   * @throws
   */
  login (payload: LoginData): void {
    const validationErrors = new ValidationErrors()
    if (!Validator.isEmail(payload.email)) {
      validationErrors.addError('email', 'email')
    }

    if (!Validator.isLength(payload.password, { min: 6 })) {
      validationErrors.addError('password', 'min:6')
    }

    if (validationErrors.hasErrors()) {
      throw validationErrors
    }
  }
}
