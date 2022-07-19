import TwoFactorAuthenticationData from "./TwoFactorAuthenticationData";

type LoginData = {
  email: string,
  password: string,
  twoFactorAuthentication: boolean,
  twoFactorAuthenticationData?: TwoFactorAuthenticationData,
};

export default LoginData;