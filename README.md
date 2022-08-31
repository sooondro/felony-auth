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

The Authentication class is empty when instantiated and needs to have adapters and providers injected into it. Since the Authentication class depends on interfaces, when custom implementation is needed, make sure that your adapters and providers implement the right interface.

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

const connectionUri = "postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test";

await postgresAdapter.setupPostgresConnectionWithConnectionUri(connectionUri);
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

await postgresAdapter.setupPostgresConnectionWithConnectionData(config);

Authentication.StorageAdapter = postgresAdapter;
```

### RedisAdapter
Just as the PostgresAdapter, Redis also requires a connection to be made before using it. Bear in mind that setting up a Redis connection is also an async task. You can establish a Redis connection using the following code:
```js
const redisAdapter = new RedisAdapter();

await redisAdapter.createConnection("redis://localhost:6379");

Authentication.CacheAdapter = redisAdapter;
```

## Usage
### Locally 
Firstly, to start using the module locally, the environment has to be set. We at Barrage visioned this to be a painless process, and to ensure that, we provided a docker-compose.yml file which will compose a docker container and run a Postgres and Redis instance in it. Before using it, please be sure you have docker installed. To run the docker-compose.yml file and setup your docker environment, write the following command in the terminal at the root of your project:???
```terminal
docker compose up
```

After setting up the docker container, the next step is to create the Postgres database models that are required for the module to run correctly. Long gone are the days of manually writing your models. To help you out, we created migrations which will bootstrap your models in one commad. To run the migrations, write the following command in your terminal:
```terminal
npm run migrate
```

We provided additional scripts in case you need to revert migrations.

To revert only the last migration, use the following command:
```terminal
npm run migrate-down
```
To revert all the migrations:
```terminal
npm run migrate-down-all
```

## Testing 
The felony-auth module has been thoroughly tested with the Jest testing framework. Before running the tests, make sure you have already ran the docker-compose and migration files. To run the test, write the following command in the terminal:
```terminal
npm run test
```

In case you need to clear Jest cache memory, use to following command: 
```terminal
npm run jest-clear
```