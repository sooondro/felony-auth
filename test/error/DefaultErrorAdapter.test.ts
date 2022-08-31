import AuthenticationError from "../../src/error/AuthenticationError";
import DefaultErrorAdapter from "../../src/error/DefaultErrorAdapter";
import { ValidationErrors } from "../../src/error/ValidationError";
import ErrorData from "../../src/types/ErrorData";

/**
 * Test for error handler
 */
describe("DefaultErrorAdapter", () => {
  describe("handleError", () => {
    const errorAdapter = new DefaultErrorAdapter();

    beforeEach(() => {
      jest.spyOn(errorAdapter, "handleError");
    });

    afterEach(() => {
      // restore the spy created with spyOn
      jest.restoreAllMocks();
    });

    it("should return a new AuthenticationError with statusCode 401 when a string is provided", () => {
      const error = "foobar";

      const result = errorAdapter.handleError(error);

      expect(errorAdapter.handleError).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(AuthenticationError);
      expect(result.message).toEqual("foobar");
      expect(result.name).toEqual("AuthenticationError");

      if (result instanceof AuthenticationError) {
        expect(result.statusCode).toEqual(401);
      }
    });

    it("should return the same AuthenticationError instance if it was provided as a parameter", () => {
      const error = new AuthenticationError("foobar", { name: "Foo", statusCode: 4323 });

      const result: AuthenticationError = errorAdapter.handleError(error);

      expect(errorAdapter.handleError).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(AuthenticationError);
      expect(result).toEqual(error);
    });

    it("should return the same ValidationErrors instance if it was provided as a parameter", () => {
      const error = new ValidationErrors();

      const result: ValidationErrors = errorAdapter.handleError(error) as ValidationErrors;

      expect(errorAdapter.handleError).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(ValidationErrors);
      expect(result).toEqual(error);
      expect(result.statusCode).toEqual(422);
      expect(result.message).toEqual("ValidationError");
    });

    it("should return a new AuthenticationError instance created when an Error object is provided", () => {
      const error = new Error("Other error");
      error.name = "WannabeBcryptError";

      const result: AuthenticationError = errorAdapter.handleError(error);

      expect(errorAdapter.handleError).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(AuthenticationError);
      expect(result.name).toEqual("WannabeBcryptError");
      expect(result.message).toEqual("Other error");
      expect(result.statusCode).toEqual(500);
    });

    it("should return a new AuthenticationError created from the provided ErrorData object", () => {
      const error: ErrorData = {
        name: "TestError",
        message: "this is a test error",
        statusCode: 500
      };

      const result: AuthenticationError = errorAdapter.handleError(error);

      expect(errorAdapter.handleError).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(AuthenticationError);
      expect(result.name).toEqual("TestError");
      expect(result.message).toEqual("this is a test error");
      expect(result.statusCode).toEqual(500);
    });
  });
});