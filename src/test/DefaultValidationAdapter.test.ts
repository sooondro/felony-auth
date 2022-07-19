// import "mocha";
// import { expect } from "chai";
// import DefaultValidationAdapter from "../validation/DefaultValidationAdapter";
// import DefaultErrorAdapter from "../error/DefaultErrorAdapter";
// import RegistrationData from "../types/RegistrationData";
// import sinon from "sinon";

// describe("DefaultValidationAdapter", () => {
//   describe("registration", () => {
//     let instance: DefaultValidationAdapter;

//     beforeEach(() => {
//       instance = new DefaultValidationAdapter(new DefaultErrorAdapter());
//     });

//     context("when invalid email is provided", () => {
//       it("should throw errror", () => {
//         const mock = sinon.mock(instance);
//         const expectation = mock.expects("");
//         expectation.exactly(1);
//         expect(instance.registration(invalidData)).to.throw;
//         mock.verify();
//       });
//     });

//     // context("when valid email is provided", () => {
//     //   it("should return true", () => {
//     //     expect(instance.isEmail("test@test.com")).to.be.true;
//     //   });
//     // });
//   });
// });


// const invalidData: RegistrationData = {
//   username: "",
//   firstName: "",
//   lastName: "",
//   email: "",
//   password: "",
//   twoFactorAuthentication: false
// }