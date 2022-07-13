"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DefaultErrorAdapter {
    throwTwoFactorProviderError(error) {
        throw new Error(`Two factor provider error:  ${error.message}`);
    }
    throwRegistrationValidationError(error) {
        throw new Error(`Registration validation error:  ${error.message}`);
    }
    throwRegistrationError(error) {
        throw new Error(`Registration error:  ${error.message}`);
    }
    throwStorageConnectionError(error) {
        throw new Error(`Storage connection error:  ${error.message}`);
    }
}
exports.default = DefaultErrorAdapter;
//# sourceMappingURL=DefaultErrorAdapter.js.map