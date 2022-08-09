import AuthenticableTwoFactorUser from "../../types/AuthenticableTwoFactorUser";
import TwoFactorAuthenticationData from "../../types/TwoFactorAuthenticationData";

export default interface TwoFactorProviderInterface {
	provider: string,
	verify(userData: TwoFactorAuthenticationData): Promise<AuthenticableTwoFactorUser | undefined>;
	register(email: string): Promise<string|undefined>;
}