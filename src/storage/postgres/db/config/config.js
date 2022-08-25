// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()
const config = {
  // "development": {
  //   // "use_env_variable": "DATABASE_URL",
  //   "username": "postgres",
  //   "password": "postgrespw",
  //   "database": "felony_auth",
  //   "host": "127.0.0.1",
  //   "port": "5432",
  //   "dialect": "postgres"
  // },
  // "test": {
  //   "use_env_variable": "DATABASE_TEST_URL",
  //   "username": "postgres",
  //   "password": "postgrespw",
  //   "database": "felony_auth",
  //   "host": "127.0.0.1",
  //   "port": "5432",
  //   "dialect": "postgres"
  // },
  // "production": {
  //   "use_env_variable": "DATABASE_URL",
  //   "username": "postgres",
  //   "password": "postgrespw",
  //   "database": "felony_auth",
  //   "host": "127.0.0.1",
  //   "port": "5432",
  //   "dialect": "postgres"
  // }
  "development": {
    "username": "postgres",
    "password": "postgrespw",
    "database": "felony_auth",
    "host": "127.0.0.1",
    "port": "5432",
    "dialect": "postgres"
  },
  "test": {
    "username": "postgres",
    "password": "postgrespw",
    "database": "felony_auth_test",
    "host": "127.0.0.1",
    "port": "5432",
    "dialect": "postgres",
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "username": "postgres",
    "password": "postgrespw",
    "database": "felony_auth",
    "host": "127.0.0.1",
    "port": "5432",
    "dialect": "postgres"
  }
};

module.exports = config;