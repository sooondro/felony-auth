import { Authentication } from '../Authentication'
import { AuthenticationError } from './AuthenticationError'
import { ValidationErrors } from './ValidationError'

import ErrorData from '../types/ErrorData'

/**
 * Error adapter interface.
 *
 * @type {Interface}
 */
export interface ErrorAdapterInterface {
  /**
   * Used for injecting Authentication class into the adapter.
   *
   * @param {Authentication} authentication
   */
  initialize: (authentication: Authentication) => void

  /**
   * Error handler function.
   *
   * @param {string | ErrorData | Error | AuthenticationError | ValidationErrors} error
   */
  handleError: (error: string | ErrorData | Error | AuthenticationError | ValidationErrors) => AuthenticationError | ValidationErrors
}
