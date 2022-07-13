"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Authentication_1 = __importDefault(require("./Authentication"));
const auth = new Authentication_1.default();
const registrationData = {
    username: "SandroSB",
    firstName: "Sandro",
    lastName: "Blavicki",
    email: "sandro.blavicki@barrage.net",
    password: "password",
    twoFactorAuthentication: false,
};
const res = auth.register(registrationData);
console.log(res);
//# sourceMappingURL=test.js.map