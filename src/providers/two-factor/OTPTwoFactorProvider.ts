import twoFactorAuthenticationData from "../../types/TwoFactorAuthenticationData";
import TwoFactorProviderInterface from "./TwoFactorProviderInterface";

export class OTPTwoFactorProvider implements TwoFactorProviderInterface {
  provider: string;
  validate(providerData: twoFactorAuthenticationData): Promise<void | Error> {
    throw new Error("Method not implemented.");
  }
}