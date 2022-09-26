/**
 * Data required for conecting to the Postgres database.
 */
interface PostgresConnectionData {
  /**
   * Database name.
   */
  database: string

  /**
   * Database user's username.
   */
  username: string

  /**
   * Database user's password.
   */
  password: string

  /**
   * Database host. e.g. localhost.
   */
  host: string

  /**
   * Database port number.
   */
  port: number

  /**
   * SQL dialect.
   */
  dialect: string
}

export default PostgresConnectionData
