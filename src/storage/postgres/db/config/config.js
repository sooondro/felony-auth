// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

console.log(process.env.DB_USER);

module.exports = {
  "development": {
    "username": "postgres",
    "password": "postgrespw",
    "database": "migrations",
    "host": "127.0.0.1",
    "port": "55002",
    "dialect": "postgres"
  },
  "test": {
    "username": "postgres",
    "password": "postgrespw",
    "database": "migrations",
    "host": "127.0.0.1",
    "port": "55000",
    "dialect": "postgres"
  },
  "production": {
    "username": "postgres",
    "password": "postgrespw",
    "database": "migrations",
    "host": "127.0.0.1",
    "port": "55000",
    "dialect": "postgres"
  }
};
