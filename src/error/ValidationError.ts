export class ValidationErrors extends Error {
  public satusCode = 422;
  public errors: Map<string, ValidationError> = new Map<string, ValidationError>;

  constructor() {
    super("ValidationError");
  }

  addError(field: string, error: string) {
    const value = this.errors.get(field) || new ValidationError(field);

    value.addError(error);

    this.errors.set(field, value);
  }

  hasErrors(): boolean {
    // Tiborov kod
    // let hasErrors = false;

    // for (const key in this.errors) {
    //   hasErrors = this.errors.get(key)?.isEmpty() || false;
    // }
    // return hasErrors;

    for (const value of this.errors.values()) {
      if(!value.isEmpty()) {
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