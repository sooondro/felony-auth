import { createClient } from 'redis'
import { RedisClientType } from '@redis/client'

import { Authentication } from '../../Authentication'
import { CacheAdapterInterface } from '../CacheAdapterInterface'
import { RedisSession } from './RedisSession'
import { AuthenticationError } from '../../error/AuthenticationError'
import AuthenticableUser from '../../types/AuthenticableUser'
import Session from '../../types/Session'
import RedisConnectionData from '../../types/RedisConnectionData'

/**
 * Redis adapter.
 */
export class RedisAdapter implements CacheAdapterInterface {
  private client!: RedisClientType
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
   * Set up Redis connection with the config object.
   *
   * @param {string} url
   */
  async setupConnectionWithConnectionString (url: string): Promise<void> {
    this.client = createClient({
      url
    })

    await this.client.connect()
  }

  /**
     * Set up Redis connection with the config object.
     *
     * @param {RedisConnectionData} config
     */
  async setupConnectionWithConnectionData (config: RedisConnectionData): Promise<void> {
    this.client = createClient({
      socket: config.socket,
      password: config.password
    })

    await this.client.connect()
  }

  /**
   * Create redis session.
   *
   * @param {UserInterface} payload
   * @return {Promise<string>}
   */
  async createSession (payload: AuthenticableUser): Promise<string> {
    const session = new RedisSession(payload)
    await this.client.set(session.Id, JSON.stringify(session))
    return session.Id
  }

  /**
   * Retreive user session.
   *
   * @param {string} id
   * @return {Promise<Session>}
   */
  async getSession (id: string): Promise<Session> {
    const session = await this.client.get(id)
    if (session === null) {
      // Session not found
      throw new AuthenticationError('invalid credentials', { name: 'AuthenticationError', statusCode: 401 })
    }

    const parsedSession: Session = JSON.parse(session)

    return parsedSession
  }

  /**
   * Logout user.
   *
   * @param {string} id
   */
  async logout (id: string): Promise<void> {
    await this.client.del(id)
  }

  /**
   * Validate whether the received csrf token is equal to the one stored in the user session.
   *
   * @param {string} sessionId
   * @param {string} token
   */
  async validateCSRF (sessionId: string, token: string): Promise<void> {
    const session = await this.getSession(sessionId)
    if (session.csrf !== token) {
      // 'Invalid CSRF token'
      throw new AuthenticationError('invalid credentials', { name: 'AuthenticationError', statusCode: 401 })
    }
  }
}
