/**
 * Validation errors class used as a holder for ValidationError.
 */
export class ValidationErrors extends Error {
  public statusCode = 422
  public errors: Map<string, ValidationError> = new Map<string, ValidationError>()
  // public erros: { [key: string]: ValidationError };

  constructor () {
    super('ValidationError')
  }

  /**
   * Used for adding new ValidationError to the map.
   *
   * @param {string} field
   * @param {string} error
   */
  addError (field: string, error: string): void {
    const value = (this.errors.get(field)) ?? new ValidationError(field)

    value.addError(error)

    this.errors.set(field, value)
  }

  /**
   * Used for checking whether the errors map contains errors.
   *
   * @returns {boolean}
   */
  hasErrors (): boolean {
    for (const value of this.errors.values()) {
      if (!value.isEmpty()) {
        return true
      }
    }

    return false
  }
}

/**
 * Validation error class.
 */
export class ValidationError {
  public name: string
  public errors: string[] = []

  constructor (name: string) {
    this.name = name
  }

  /**
   * Used for adding errors to the errors array.
   *
   * @param {string} error
   */
  addError (error: string): void {
    this.errors.push(error)
  }

  /**
   * Used for checking whether the errors array is empty.
   *
   * @returns {boolean}
   */
  isEmpty (): boolean {
    return this.errors.length === 0
  }
}
