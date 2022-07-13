import twoFactorAuthenticationData from "../../types/TwoFactorAuthenticationData";

export default interface TwoFactorProviderInterface {
	provider: string,
	validate(providerData: twoFactorAuthenticationData): Promise<void | Error>;
}