import { AuthenticationError } from "../../src/error/AuthenticationError";

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

  it("should set the raw value and set name and status code to default values when only raw is provided", () => {
    const error = new AuthenticationError("foobar", { raw: new Error("foo") });

    expect(error.message).toBeDefined();
    expect(error.message).toEqual("foobar");
    expect(error.statusCode).toBeDefined();
    expect(error.statusCode).toEqual(401);
    expect(error.name).toBeDefined();
    expect(error.name).toEqual("AuthenticationError");
    expect(error.raw).toBeDefined();
    expect(error.raw).toBeInstanceOf(Error);
    expect(error.raw?.message).toEqual("foo");
  });

  it("should set all the properties correctly when all the values are provided", () => {
    const error = new AuthenticationError("foobar", { name: "Foo", statusCode: 500, raw: new Error("foo") });

    expect(error.message).toBeDefined();
    expect(error.message).toEqual("foobar");
    expect(error.statusCode).toBeDefined();
    expect(error.statusCode).toEqual(500);
    expect(error.name).toBeDefined();
    expect(error.name).toEqual("Foo");
    expect(error.raw).toBeDefined();
    expect(error.raw).toBeInstanceOf(Error);
    expect(error.raw?.message).toEqual("foo");
  });
});