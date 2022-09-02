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

  // /**
  //  * Handler for login errors.
  //  *
  //  * @param error
  //  */
  // login(error: string | object | Error): never {
  //   throw new Error("Method not implemented.");
  // }

  // /**
  //  * Throw session adapter error.
  //  *
  //  * @param {Error} error
  //  * @throws {Error}
  //  */
  // throwSessionAdapterError(error: Error): never {
  //   throw error;
  // }

  // /**
  //  * Throw CSRF error.
  //  *
  //  * @param {Error} error
  //  * @throws {Error}
  //  */
  // throwCSRFError(error: Error): never {
  //   throw error;
  // }

  // /**
  //  * Throw data not found error.
  //  *
  //  * @param {Error} error
  //  * @throws {Error}
  //  */
  // throwDataNotFoundError(error: Error): never {
  //   throw error;
  // }

  // /**
  //  * Throw two-factor verification error.
  //  *
  //  * @param {Error} error
  //  * @throws {Error}
  //  */
  // throwTwoFactorVerificationError(error: Error): never {
  //   throw error;
  // }

  // /**
  //  * Throw two-factor registration error.
  //  *
  //  * @param {Error} error
  //  * @throws {Error}
  //  */
  // throwTwoFactorRegistrationError(error: Error): never {
  //   throw error;
  // }

  // /**
  //  * Throw login validation error.
  //  *
  //  * @param {Error} error
  //  * @throws {Error}
  //  */
  // throwLoginValidationError(error: Error): never {
  //   throw error;
  // }

  // /**
  //  * Throw login error.
  //  *
  //  * @param {Error} error
  //  * @throws {Error}
  //  */
  // throwLoginError(error: Error): never {
  //   throw error;
  // }

  // /**
  //  * Throw two-factor provider error.
  //  *
  //  * @param {Error} error
  //  * @throws {Error}
  //  */
  // throwTwoFactorProviderError(error: Error): never {
  //   throw error;
  // }

  // /**
  //  * Throw registration validation error.
  //  *
  //  * @param {Error} error
  //  * @throws {Error}
  //  */
  // throwRegistrationValidationError(error: Error): never {
  //   throw error;
  // }

  // /**
  //  * Throw registration error.
  //  *
  //  * @param {Error} error
  //  * @throws {Error}
  //  */
  // throwRegistrationError(error: Error): never {
  //   throw error;
  // }

  // /**
  //  * Throw storage connection error.
  //  *
  //  * @param {Error} error
  //  * @throws {Error}
  //  */
  // throwStorageConnectionError(error: Error): never {
  //   throw error;
  // }

  // /**
  //  * Throw storage adapter error.
  //  *
  //  * @param {Error} error
  //  * @throws {Error}
  //  */
  // throwStorageAdapterError(error: Error): never {
  //   throw error;
  // }
}
