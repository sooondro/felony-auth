# felony-auth

A criminally easy to use out-of-the-box authentication module designed to bootstrap your project's authentication in no time.

Authentication is something that most of modern applications require. We at Barrage found ourselves writing the same logic project after project, and thought that there must be an easier way of doing things. The idea of creating an authentication module to be used in future projects was born. We tailored the module to fit our needs at Barrage, creating default implementations that we use, but made sure that other users can customize it for their own needs too. Felony-auth is technology agnostic and relies on abstraction which is achieved through interfaces.

Felony-auth comes with default implementations and is visioned as an install and use solution for authentication. The default configuration comes with validation and error adapters, as well as a Postgres adapter for storing data to the database, Redis adapter for handling cache memory and a 2FA provider for handling two-factor authentication designed to use a time-based one-time password (TOTP). 

The plan for the future is to create adapters for other technologies and make felony-auth a developers favorite. As a potential user that means you can be a contributor as well, feel free to contact us.

## Instalation
Install felony-auth as a dependency of your project:

```shell script
npm install --save felony-auth
```

## Configuration
To use the felony-auth, you have to import the main Authentication class and create an instance of it. The Authentication class provides methods with which you can interact with the set adapters and providers. 

```js
import { Authentication } from "felony-auth";

const Authentication = new Authentication();
```

The Authentication class is empty when instantiated and needs to have adapters and providers injected into it. Since the Authentication class depends on interfaces, when custom implementation is needed, make sure that your adapters and providers implement the corresponding interface.

To use the default implementation, first of all, modify the import statement:

```js
import { 
  Authentication, 
  DefaultValidationAdapter, 
  DefaultErrorAdapter, 
  PostgresAdapter, 
  RedisAdapter, 
  TOTPTwoFactorProvider } from "felony-auth";
```

The next step is to create new instances of the adapters and providers and inject them into the Authentication class using setter methods. 

### DefaultValidationAdapter, DefaultErrorAdapter and TOTPTwoFactorProvider
The default validation adapter, error adapter and two-factor provider do not require any additional setup. You can instantiate and inject them right away.
```js
const Authentication = new Authentication();

const defaultErrorAdapter = new DefaultErrorAdapter();
const defaultValidationAdapter = new DefaultValidationAdapter();
const twoFactorProvider = new TOTPTwoFactorProvider();

Authentication.ErrorAdapter = defaultErrorAdapter;
Authentication.ValidationAdapter = defaultValidationAdapter;
Authentication.TwoFactorProvider = twoFactorProvider;
```

### PostgresAdapter
Another step is required before injecting the postgres adapter to be used as your storage adapter. To be precise, after creating an instance, a connection has to be established. To establish a connection to the database, you can use the following two methods. Since establishing a connection is an async task, the method has to be awaited or the promise has to be handled using .then().

Using the connection string:
```js
const postgresAdapter = new PostgresAdapter();

const connectionUrl = "postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test";

await postgresAdapter.setupConnectionWithConnectionUrl(connectionUrl);

Authentication.StorageAdapter = postgresAdapter;
```

Using the config data: 
```js
const postgresAdapter = new PostgresAdapter();
const config: PostgresConnectionData = {
  database: "felony_auth_test",
  username: "postgres",
  password: "postgrespw",
  host: "127.0.0.1",
  dialect: "postgres",
  port: 5432
};

await postgresAdapter.setupConnectionWithConnectionData(config);

Authentication.StorageAdapter = postgresAdapter;
```

### RedisAdapter
Just as the PostgresAdapter, Redis also requires a connection to be made before using it. Bear in mind that setting up a Redis connection is also an async task. You can establish a Redis connection using the following two methods:

Using the connection string:
```js
const redisAdapter = new RedisAdapter();

await redisAdapter.setupConnectionWithConnectionUrl("redis://localhost:6379");

Authentication.CacheAdapter = redisAdapter;
```

Using the config data: 
```js
const redisAdapter = new RedisAdapter();

const config: RedisConnectionData = {
  socket: {
    host: "localhost",
    port: 6379
  }
};

await redisAdapter.setupConnectionWithConnectionData(config);

Authentication.CacheAdapter = redisAdapter;
```

## Requirements
Firstly, to start using the module, the environment has to be set. For the module to run correctly, if the default implementation is used, there needs to be a Postgres database and a Redis cache broker setup.

### Bootstrap default setup using Docker and migrations
We at Barrage visioned this to be a painless process, and to ensure that, we provided a docker-compose.yml file which will compose a docker container and run a Postgres and Redis instance in it. Before using it, please be sure you have docker installed. To run the docker-compose.yml file and setup your docker environment, write the following command in the terminal at the root of your project:

```terminal
docker compose up
```

If you want to modify the credentials or connection information with which you connect to Postgres and Redis, open the docker-compose.yml file and write your custom credentials, ports, database name, etc.

docker-compose.yml:
```yaml
version: "3.9"
services:
  db:
    image: postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespw
      POSTGRES_DB: felony_auth_test
    ports:
      - 5432:5432
  cache:
    image: redis
    restart: always
    ports:
      - 6379:6379
```

If you modified the Postgres information in the docker-compose.yml file, make sure to also edit the data found in src\storage\postgres\db\config\config.js so that it matches the data in docker-compose.yml. 

config.js:
```js
module.exports = {
  "test": {
    "username": "postgres",
    "password": "postgrespw",
    "database": "felony_auth_test",
    "host": "127.0.0.1",
    "port": "5432",
    "dialect": "postgres",
    "logging": false,
  },
}
```

After setting up the docker container, the next step is to create the Postgres database models that are required for the module to run correctly. Long gone are the days of manually writing your models. To help you out, we created migrations which will bootstrap your models in one commad. To run the migrations, write the following command in your terminal:
```terminal
npm run migrate
```

We provided additional scripts in case you need to revert your migrations.

To revert only the last migration, use the following command:
```terminal
npm run migrate-down
```
To revert all the migrations:
```terminal
npm run migrate-down-all
```

After running the docker-compose.yml and migration files, you're all set to go. You can start using the felony-auth module.

## Usage
The Authentication class is ready to use after all the required dependencies are injected and the necessary connections established. 

The module flow starts with the register method. The register method registers a new user to the database (if the user does not exist already), an returns an AuthenticableUser object. The twoFactorAuthentication flag inside the RegistrationData object must be set to true if you want to enable two-factor authentication for the new user. 

```ts
const payload = {
  username: "FooBar",
  firstName: "Foo",
  lastName: "Bar",
  email: "foo@bar.com",
  password: "foobar",
  twoFactorAuthentication: false
};

try {
  const result = await Authentication.register(payload);
} catch (error) {
  // handle the error
}
```

After a successful registration, the new user is eligible to login. Logging in the user can be done with or without two-factor authentication, depending on whether two-factor authentication is enabled for the user. When a user is successfully logged in, a session ID is returned. 

```ts
const payload = {
  email: "foo@bar.com",
  password: "foobar",
  twoFactorAuthentication: false
};

try {
  const sessionId = await Authentication.login(payload);
} catch (error) {
  // handle the error
}
```

There is a chance that the user did not want to setup two-factor authentication during the registration, but wants to in the future. To enable 2FA for the user, you can do so using the AuthenticableUser object or the session ID. Both approaches will return an AuthenticableTwoFactorUser object and a QR code in a string format. The QR should be scanned by an authenticator app like google authenticator.

```ts

try {
  const result = await Authentication.registerTwoFactorUser(authUser);

  // OR

  const result = await Authentication.registerTwoFactorUserBySessionId(sessionId);
} catch (error) {
  // handle the error
}
```
<!-- 
If a two-factor user was not verified during the login process, you can do it using the verify method. The verify method's return type is void, if the users credentials are wrong, an error will be thrown. 
```ts

try {
await Authentication.verifyTwoFactorUser(authUser);
} catch (error) {
  // handle the error
}
``` -->

A CSRF defense mehanism has also been implemented. Each session created contains a CSRF token. You can validate the received CSRF token by calling the validateCSRFToken method. If the token is not correct, an error will be thrown. 

```ts
try {
await Authentication.validateCSRFToken(sessionId, csrfToken);
} catch (error) {
  // handle the error
}
```

You can fetch the data stored inside the user's session by calling the getSession method.
```ts
try {
await Authentication.getSession(sessionId);
} catch (error) {
  // handle the error
}
```

The user can also change his password by calling the changePassword method.
```ts
try {
await Authentication.changePassword(email, oldPassword, newPassword);
} catch (error) {
  // handle the error
}
```

After the user is done using your application, he can logout and delete his session using the logout method.
```ts
try {
await Authentication.logout(sessionId);
} catch (error) {
  // handle the error
}
```

## Testing 
The felony-auth module has been thoroughly tested with the Jest testing framework. Before running the tests, make sure you have already ran the docker-compose and migration files. If Postgres and Redis was manually created, changes to the test will be required in order for the test to run successfully. To run the test, write the following command in the terminal:
```terminal
npm run test
```

In case you need to clear Jest cache memory, use to following command: 
```terminal
npm run jest-clear
```

## Aditional documentation
We believe that the best documentation for the code is code itself, therefore we encourage you to dig through our code and inspect what is happening there. 