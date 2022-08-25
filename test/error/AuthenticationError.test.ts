import AuthenticationError from "../../src/error/AuthenticationError";

describe("AuthenticationError", () => {
  it("should set the name and status code when only message is provided", () => {
    const error = new AuthenticationError("foobar");

    expect(error.message).toBeDefined();
    expect(error.message).toEqual("foobar");
    expect(error.statusCode).toBeDefined();
    expect(error.statusCode).toEqual(401);
    expect(error.name).toBeDefined();
    expect(error.name).toEqual("AuthenticationError");
  });

  it("should set status code to default value when message and ")
});