/**
 * Authentication error class. All the errors except the ValidationErrors get converted to this class.
 */
export class AuthenticationError extends Error {
  public statusCode: number
  public raw?: Error

  constructor (message: string, optionalParameters: {name?: string, statusCode?: number, raw?: Error} = {}) {
    super(message)
    this.name = optionalParameters.name ?? 'AuthenticationError'
    this.statusCode = optionalParameters.statusCode ?? 401
    this.raw = optionalParameters.raw
  }
}
