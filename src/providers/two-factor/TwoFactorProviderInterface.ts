import twoFactorAuthenticationData from "../../types/TwoFactorAuthenticationData";

export default interface TwoFactorProviderInterface {
	provider: string,
	verify(providerData: twoFactorAuthenticationData);
	register(email: string);
}