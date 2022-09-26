import { ValidationError, ValidationErrors } from "../../src/error/ValidationError"

describe("ValidationError", () => {
  describe("addError", () => {
    it("should add a new error string to the errors array when addError method is called", () => {
      const validationError = new ValidationError("test")

      jest.spyOn(validationError, "addError")

      validationError.addError("test error")

      expect(validationError.addError).toHaveBeenCalledTimes(1)
      expect(validationError.addError).toHaveBeenCalledWith("test error")
      expect(validationError.errors[0]).toEqual("test error")
    })
  })

  describe("isEmpty", () => {
    it("should return true if the errors array is empty", () => {
      const validationError = new ValidationError("test")

      jest.spyOn(validationError, "isEmpty")

      const result = validationError.isEmpty()

      expect(validationError.isEmpty).toHaveBeenCalledTimes(1)
      expect(result).toBeTruthy()
    })

    it("should return false it the errors array is not empty", () => {
      const validationError = new ValidationError("test")

      jest.spyOn(validationError, "addError")
      jest.spyOn(validationError, "isEmpty")

      validationError.addError("test error")
      const result = validationError.isEmpty()

      expect(validationError.addError).toHaveBeenCalledTimes(1)
      expect(validationError.addError).toHaveBeenCalledWith("test error")
      expect(validationError.isEmpty).toHaveBeenCalledTimes(1)
      expect(result).toBeFalsy()
    })
  })
})

describe("ValidationErrors", () => {
  describe("addError", () => {
    it("should create a new ValidationError and add it to the map if the field doesn't already exist", () => {
      const validationErrors = new ValidationErrors()
      const field = "test"

      jest.spyOn(validationErrors, "addError")


      validationErrors.addError(field, "this is a test")

      expect(validationErrors.addError).toHaveBeenCalledTimes(1)
      expect(validationErrors.errors.get(field)).toBeDefined()
      expect(validationErrors.errors.get(field)).toBeInstanceOf(ValidationError)
      expect(validationErrors.errors.get(field)?.errors[0]).toEqual("this is a test")
    })

    it("should add a new error message to the errors array of the ValidationError instance if the field already exists", () => {
      const validationErrors = new ValidationErrors()
      const field = "test"

      jest.spyOn(validationErrors, "addError")

      validationErrors.addError(field, "this is a test")
      validationErrors.addError(field, "this is another test")

      const keyIterator = validationErrors.errors.keys()
      const key1 = keyIterator.next().value
      const key2 = keyIterator.next().value

      expect(validationErrors.addError).toHaveBeenCalledTimes(2)
      expect(validationErrors.errors.get(field)).toBeDefined()
      expect(validationErrors.errors.get(field)).toBeInstanceOf(ValidationError)
      expect(validationErrors.errors.get(field)?.errors[0]).toEqual("this is a test")
      expect(validationErrors.errors.get(field)?.errors[1]).toEqual("this is another test")
      expect(validationErrors.errors.get(field)?.errors.length).toEqual(2)
      expect(key1).toEqual("test")
      expect(key2).toBeUndefined()
    })
  })

  describe("hasErrors", () => {
    it("should return false when errors map has no elements inside", () => {
      const validationErrors = new ValidationErrors()

      jest.spyOn(validationErrors, "hasErrors")
      
      const result = validationErrors.hasErrors()
      
      expect(validationErrors.hasErrors).toHaveBeenCalledTimes(1)
      expect(result).toBeFalsy()
    })

    it("should return false when only empty ValidationError object are inside the map", () => {
      const validationErrors = new ValidationErrors()

      jest.spyOn(validationErrors, "addError")
      jest.spyOn(validationErrors, "hasErrors")
      jest.spyOn(ValidationError.prototype, "isEmpty")

      validationErrors.errors.set("fake", new ValidationError("fake"))
      validationErrors.errors.set("fake2", new ValidationError("fake"))
      validationErrors.errors.set("fake3", new ValidationError("fake"))
      
      const result = validationErrors.hasErrors()

      expect(validationErrors.hasErrors).toHaveBeenCalledTimes(1)
      expect(result).toBeFalsy()
    })

    it("should return true if any of the ValidationError objects inside errors map contains errors", () => {
      const validationErrors = new ValidationErrors()
      
      jest.spyOn(validationErrors, "addError")
      jest.spyOn(validationErrors, "hasErrors")
      jest.spyOn(ValidationError.prototype, "isEmpty")

      validationErrors.addError("test", "this is a test")
      validationErrors.errors.set("fake", new ValidationError("fake"))
      const result = validationErrors.hasErrors()

      expect(validationErrors.addError).toHaveBeenCalledTimes(1)
      expect(validationErrors.hasErrors).toHaveBeenCalledTimes(1)
      expect(result).toBeTruthy()
    })
  })
})