import { Authentication } from '../Authentication'
import { ErrorAdapterInterface } from './ErrorAdapterInterface'
import { AuthenticationError } from './AuthenticationError'
import { ValidationErrors } from './ValidationError'

import ErrorData from '../types/ErrorData'

/**
 * Default error adapter.
 *
 * @type {Class}
 */
export class DefaultErrorAdapter implements ErrorAdapterInterface {
  private authentication!: Authentication

  /**
   * Used for injecting Authentication class into the adapter.
   *
   * @param {Authentication} authentication
   */
  initialize (authentication: Authentication): void {
    this.authentication = authentication
  }

  /**
   * Handler function for occurred errors.
   *
   * @param {string | ErrorData | Error | AuthenticationError | ValidationErrors} error
   * @returns {AuthenticationError | ValidationErrors}
   */
  handleError (error: string | ErrorData | Error | AuthenticationError | ValidationErrors): AuthenticationError | ValidationErrors {
    if (typeof error === 'string') {
      return new AuthenticationError(error, { name: 'AuthenticationError', statusCode: 401 })
    } else if (error instanceof AuthenticationError || error instanceof ValidationErrors) {
      return error
    } else if (error instanceof Error) {
      return new AuthenticationError(error.message, { name: error.name, statusCode: 500 })
    }

    return new AuthenticationError(error.message, { name: error.name, statusCode: error.statusCode })
  }

  // /**
  //  * Handler for registration errors.
  //  *
  //  * @param {string | ErrorData | Error | AuthenticationError | ValidationError | ValidationErrors} error
  //  */
  // handleRegistrationError(error: string | ErrorData | Error | AuthenticationError | ValidationErrors) {
  //   if (typeof error === "string") {
  //     return new AuthenticationError("RegisrationError", error, 401);
  //   } else if (error instanceof AuthenticationError || error instanceof ValidationErrors) {
  //     return error;
  //   } else if (error instanceof Error) {
  //     return new AuthenticationError(error.name, error.message, 500);
  //   }
  //   return new AuthenticationError(error.name, error.message, error.statusCode);
  // }

  // handleLoginError(error: string | ErrorData | Error | AuthenticationError | ValidationErrors) {
  //   if (typeof error === "string") {
  //     return new AuthenticationError("LoginError", error, 401);
  //   } else if (error instanceof AuthenticationError || error instanceof ValidationErrors) {
  //     return error;
  //   } else if (error instanceof Error) {
  //     return new AuthenticationError(error.name, error.message, 500);
  //   }
  //   return new AuthenticationError(error.name, error.message, error.statusCode);
  // }
}
