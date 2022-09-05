import { v4 as uuidv4 } from 'uuid'

import { SessionInterface } from '../SessionInterface'
import AuthenticableUser from '../../types/AuthenticableUser'

/**
 * Redis session.
 *
 * @type {Class}
 */
export class RedisSession implements SessionInterface {
  private readonly id: string
  private readonly csrf: string
  private readonly user: AuthenticableUser

  constructor (user: AuthenticableUser) {
    this.id = uuidv4()
    this.csrf = uuidv4()
    this.user = user
  }

  /**
   * Get session id.
   *
   * @return {string}
   */
  public get Id (): string {
    return this.id
  }

  /**
   * Get session csrf token.
   *
   * @return {string}
   */
  public get Csrf (): string {
    return this.csrf
  }

  /**
   * Get session value.
   *
   * @return {AuthenticableUser}
   */
  public get User (): AuthenticableUser {
    return this.user
  }
}
