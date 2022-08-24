import PostgresAdapter from "../../../src/storage/postgres/PostgresAdapter";
import PostgresConnectionData from "../../../src/types/PostgresConnectionData";
import RegistrationData from "../../../src/types/RegistrationData";

import db from "../../../src/storage/postgres/db/models";
import { ValidationErrors } from "../../../src/error/ValidationError";
const DB: any = db;
const { User, TwoFactorUser } = DB;

describe("PostgresAdapter", () => {
  // describe("setupPostgresConnectionWithConnectionData", () => {
  //   it("should instantiate the client when valid connection data is passed", async () => {
  //     const postgresAdapter = new PostgresAdapter();
  //     const config: PostgresConnectionData = {
  //       database: "felony_auth_test",
  //       username: "postgres",
  //       password: "postgrespw",
  //       host: "127.0.0.1",
  //       dialect: "postgres",
  //       port: 5432
  //     };

  //     jest.spyOn(postgresAdapter, "setupPostgresConnectionWithConnectionData");

  //     await postgresAdapter.setupPostgresConnectionWithConnectionData(config);

  //     expect(postgresAdapter.setupPostgresConnectionWithConnectionData).toHaveBeenCalledTimes(1);
  //     expect(postgresAdapter["client"]).toBeDefined();
  //     expect(postgresAdapter["client"]["config"].database).toEqual("felony_auth_test");
  //     expect(postgresAdapter["client"]["config"].username).toEqual("postgres");
  //     expect(postgresAdapter["client"]["config"].password).toEqual("postgrespw");
  //     expect(postgresAdapter["client"]["config"].host).toEqual("127.0.0.1");
  //     expect(postgresAdapter["client"]["config"].port).toEqual(5432);
  //   });
  // });

  // describe("setupPostgresConnectionWithConnectionUri", () => {
  //   it("should instantiate the client when valid connection uri is passed", async () => {
  //     const postgresAdapter = new PostgresAdapter();
  //     const connectioUri = "postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test";

  //     jest.spyOn(postgresAdapter, "setupPostgresConnectionWithConnectionUri");

  //     await postgresAdapter.setupPostgresConnectionWithConnectionUri(connectioUri);

  //     expect(postgresAdapter.setupPostgresConnectionWithConnectionUri).toHaveBeenCalledTimes(1);
  //     expect(postgresAdapter["client"]).toBeDefined();
  //     expect(postgresAdapter["client"]["config"].database).toEqual("felony_auth_test");
  //     expect(postgresAdapter["client"]["config"].username).toEqual("postgres");
  //     expect(postgresAdapter["client"]["config"].password).toEqual("postgrespw");
  //     expect(postgresAdapter["client"]["config"].host).toEqual("127.0.0.1");
  //     expect(postgresAdapter["client"]["config"].port).toEqual("5432");
  //   });
  // });

  describe("register", () => {
    let postgresAdapter: PostgresAdapter;

    beforeAll(async () => {
      postgresAdapter = new PostgresAdapter();
      // postgresAdapter.setupPostgresConnectionWithConnectionUri("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test"); //PITANJE
      // User.destroy({ where: {} });
    });

    beforeEach(() => {
      jest.spyOn(postgresAdapter, "register");
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    // it("should return a User object when new user is registered", async () => {
    //   const registrationData: RegistrationData = {
    //     username: "FooBar",
    //     firstName: "Foo",
    //     lastName: "Bar",
    //     email: "foo@bar.com",
    //     password: "foobar",
    //     twoFactorAuthentication: false
    //   };


    //   const user = await postgresAdapter.register(registrationData);

    //   expect(postgresAdapter.register).toHaveBeenCalledTimes(1);
    //   expect(user.username).toEqual("FooBar");
    //   expect(user.firstName).toEqual("Foo");
    //   expect(user.lastName).toEqual("Bar");
    //   expect(user.email).toEqual("foo@bar.com");
    // });

    // it("should throw an error when invalid registration data is provided", async  () => {
    //   const registrationData: RegistrationData = {
    //     username: "",
    //     firstName: "",
    //     lastName: "",
    //     email: "",
    //     password: "",
    //     twoFactorAuthentication: false
    //   };

    //   try {
    //     const user = await postgresAdapter.register(registrationData);
    //     console.log("USER", user);

    //     fail();
    //   } catch (error) {
    //     expect(postgresAdapter.register).toThrow();
    //     expect(postgresAdapter.register).toHaveBeenCalledTimes(1);
    //   }
    // }); PITANJE

    it.only("should throw when a user with the same email already exists in the database",async  () => {
      const registrationData: RegistrationData = {
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        twoFactorAuthentication: false
      };
      // const user = 

      // expect(async () => { await postgresAdapter.register(registrationData)}).toThrow();


      // expect(await postgresAdapter.register).toThrow();
      // expect(postgresAdapter.register).toHaveBeenCalledTimes(1);

      try {
        await postgresAdapter.register(registrationData);
        fail();
      } catch (error) {
        console.log(error);
        expect(error).toBeInstanceOf(ValidationErrors);
        expect(postgresAdapter.register).toHaveBeenCalledTimes(1);
      }
    });
  });
});
