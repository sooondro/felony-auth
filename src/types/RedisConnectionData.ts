/**
 * Data required for conecting to the Redis database.
 */
interface RedisConnectionData {
  socket: {
    /**
     * Host to which the connection will be made.
     */
    host: string
    /**
     * Port number to which the connection will be made.
     */
    port: number
  }
  /**
   * Password in case Redis is configured to requirepass.
   */
  password?: string
}

export default RedisConnectionData
