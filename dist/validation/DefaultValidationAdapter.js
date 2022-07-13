"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validator_1 = __importDefault(require("validator"));
class DefaultValidationAdapter {
    constructor(errorAdapter) {
        this.errorAdapter = errorAdapter;
    }
    registration(payload) {
        if (!validator_1.default.isEmail(payload.email)) {
            this.errorAdapter.throwRegistrationValidationError(new Error("Invalid email"));
        }
        if (!validator_1.default.isLength(payload.password, { min: 6 })) {
            this.errorAdapter.throwRegistrationValidationError(new Error("Password needs to be at least 6 characters long"));
        }
    }
    login(payload) {
        throw new Error("Method not implemented.");
    }
    isEmail(email) {
        throw new Error("Method not implemented.");
    }
    isEmptyString(string) {
        throw new Error("Method not implemented.");
    }
}
exports.default = DefaultValidationAdapter;
//# sourceMappingURL=DefaultValidationAdapter.js.map