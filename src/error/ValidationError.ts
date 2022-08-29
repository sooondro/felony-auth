export class ValidationErrors extends Error {
  public statusCode = 422;
  public errors: Map<string, ValidationError> = new Map<string, ValidationError>;
  // public erros: { [key: string]: ValidationError };

  constructor() {
    super("ValidationError");
  }

  addError(field: string, error: string) {
    const value = this.errors.get(field) || new ValidationError(field);

    value.addError(error);

    this.errors.set(field, value);
  }

  hasErrors(): boolean {
    for (const value of this.errors.values()) {
      if (!value.isEmpty()) {
        return true;
      }
    }

    return false;
  }
}

export class ValidationError {
  public name: string;
  public errors: string[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addError(error: string) {
    this.errors.push(error);
  }

  isEmpty(): boolean {
    return !this.errors.length
  }
}