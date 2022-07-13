import TwoFactorAuthenticationData from "./TwoFactorAuthenticationData";

type RegistrationData = {
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  twoFactorAuthentication: boolean,
  twoFactorAuthenticationData?: [TwoFactorAuthenticationData],
};

export default RegistrationData;