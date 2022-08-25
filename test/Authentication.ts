// import Authentication from "../src/Authentication";
// import { ValidationErrors } from "../src/error/ValidationError";
// import PostgresAdapter from "../src/storage/postgres/PostgresAdapter";
// import RegistrationData from "../src/types/RegistrationData";
// import DefaultErrorAdapter from "../src/error/DefaultErrorAdapter";
// import DefaultValidationAdapter from "../src/validation/DefaultValidationAdapter";

// import db from "../src/storage/postgres/db/models";
// const DB: any = db;
// const { User, TwoFactorUser } = DB;

// describe("Authentication", () => {

//   let authentication: Authentication;

//   beforeAll(() => {
//     authentication = new Authentication();
//     const postgresAdapter = new PostgresAdapter();
//     const errorAdapter = new DefaultErrorAdapter();
//     const validationAdapter = new DefaultValidationAdapter();
//     authentication.storageAdapter = postgresAdapter;
//     authentication.errorAdapter = errorAdapter;
//     authentication.validationAdapter = validationAdapter;
//   });

//   beforeEach(async () => {
//     jest.spyOn(authentication, "register");
//     await User.destroy({ where: {} });
//   });

//   afterEach(() => {
//     jest.resetAllMocks();
//   });

//   describe("register", () => {
//     it("should throw ValidationErrors if invalid data is provided", async () => {
//       const payload: RegistrationData = {
//         username: "",
//         firstName: "",
//         lastName: "",
//         email: "",
//         password: "",
//         twoFactorAuthentication: false
//       };

//       try {
//         await authentication.register(payload);

//         fail();
//       } catch (error) {
//         expect(authentication.register).toHaveBeenCalledTimes(1);
//         expect(error).toBeInstanceOf(ValidationErrors);
//       }
//     });

//     // it("should throw ValidationErrors if user already exists", async () => {
//     //   const payload: RegistrationData = {
//     //     username: "FooBar",
//     //     firstName: "Foo",
//     //     lastName: "Bar",
//     //     email: "foo@bar.com",
//     //     password: "foobar",
//     //     twoFactorAuthentication: false
//     //   };


//     //   const user = await authentication.register(payload);
//     //   const secondUser = await authentication.register(payload);

//     //   console.log(user);
//     //   console.log(secondUser);
      
      

//     //   expect(secondUser).toBeInstanceOf(ValidationErrors);
//     //   expect(authentication.register).toHaveBeenCalledTimes(2);
//     // });
//   });
// });