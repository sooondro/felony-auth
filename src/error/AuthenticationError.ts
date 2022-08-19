export default class AuthenticationError extends Error {
  public statusCode?: number;
  public raw?: Error;

  constructor(message: string, name?: string, statusCode?: number, raw?: Error) {
    super(message);
    this.name = name || "AuthenticationError";
    this.statusCode = statusCode || 401;
    this.raw = raw;
  }
}