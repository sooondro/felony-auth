import Authentication from "./Authentication"
import RegistrationData from "./types/RegistrationData"

const auth = new Authentication();

const registrationData = {
  username: "SandroSB",
  firstName: "Sandro",
  lastName: "Blavicki",
  email: "sandro.blavicki@barrage.net",
  password: "password",
  twoFactorAuthentication: false,
}

const res = auth.register(registrationData);

console.log(res);
