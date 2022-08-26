module.exports = {
  "development": {
    "use_env_variable": "DATABASE_URL",
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
    "logging": false,
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
}
