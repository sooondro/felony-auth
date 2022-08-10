/**
 * Data required for conecting to the postgres database.
 */
type PostgresConnectionData = {
  /**
   * Database name.
   */
  database: string,

  /**
   * Database user's username.
   */
  username: string,

  /**
   * Database user's password.
   */
  password: string,

  /**
   * Database host. e.g. localhost.
   */
  host: string,

  /**
   * Database port number.
   */
  port: number,
};

export default PostgresConnectionData;