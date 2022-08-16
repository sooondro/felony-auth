import { v4 as uuidv4 } from 'uuid';

import SessionInterface from '../../models/SessionInterface';
import AuthenticableUser from '../../types/AuthenticableUser';

/**
 * Redis session.
 * 
 * @type {Class}
 */
export default class RedisSession implements SessionInterface {
  constructor(user: AuthenticableUser) {
    this._id = uuidv4();
    this._csrf = uuidv4();
    this._user = user;
  }

  private _id: string;
  private _csrf: string;
  private _user: AuthenticableUser;

  /**
   * Get session id.
   * 
   * @return {string}
   */
  public get id(): string {
    return this._id;
  }

  /**
   * Get session csrf token.
   * 
   * @return {string}
   */
  get csrf(): string {
    return this._csrf;
  }

  /**
   * Get session value.
   * 
   * @return {AuthenticableUser}
   */
  public get user(): AuthenticableUser {
    return this._user;
  }
}