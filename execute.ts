import Authentication from "./src/Authentication";
import DefaultErrorAdapter from "./src/error/DefaultErrorAdapter";
import DefaultValidationAdapter from "./src/validation/DefaultValidationAdapter";
import PostgresAdapter from "./src/storage/postgres/PostgresAdapter";
import RegistrationData from "./src/types/RegistrationData";
import LoginData from "./src/types/LoginData";
import RedisAdapter from "./src/cache/redis/RedisAdapter";
import TOTPTwoFactorProvider from "./src/providers/two-factor/TOTPTwoFactorProvider";

const auth = new Authentication();

const postgresConnectionUri = "postgres://postgres:postgrespw@localhost:55000";
const redisConnectionUri = "redis://127.0.0.1:6379";

const newUser: RegistrationData = {
  username: "sandrooooooooo",
  firstName: "sandro",
  lastName: "blavicki",
  email: "sandro.blavicki+9@gmail.com",
  password: "password",
  twoFactorAuthentication: true,
};

const loginUser: LoginData = {
  email: "sandro.blavicki+5@gmail.com",
  password: "password",
  twoFactorAuthentication: false
}

const errorAdapter = new DefaultErrorAdapter();
const validationAdapter = new DefaultValidationAdapter(errorAdapter);
const postgresAdapter = new PostgresAdapter(errorAdapter, postgresConnectionUri);
const redisAdapter = new RedisAdapter(errorAdapter, redisConnectionUri);
const twoFactorProvider = new TOTPTwoFactorProvider();

twoFactorProvider.errorAdapter = errorAdapter;
twoFactorProvider.storageAdapter = postgresAdapter;

auth.errorAdapter = errorAdapter;
auth.validationAdapter = validationAdapter;
auth.storageAdapter = postgresAdapter;
auth.cacheAdapter = redisAdapter;
auth.twoFactorProvider = twoFactorProvider;

setTimeout(() => {
  // postgresAdapter.register(newUser).then((user) => {
  //   console.log("MDA USER", user);

  // }).catch((err) => {
  //   console.log("ERRORCINA", err);

  // });

  // postgresAdapter.login(loginUser).then((sessionId) => {
  //   console.log(sessionId);

  // }).catch((err) => {
  //   console.log("ERRORCINA", err);

  // });

  auth.register(newUser).then((data) => {
    console.log("SUCCESS ", data);
  }).catch(err => {
    console.log("ERRORCINA ", err);
  });


}, 5000);

// postgresAdapter.authenticateConnection().then(() => {
//   console.log("Success");
// }).catch((err) => {
//   console.log("ERRORCINA", err);
// });
// try {
//   // postgresAdapter.getUserByEmail(newUser.email);
// } catch (error) {
//   console.log(error);
// }

