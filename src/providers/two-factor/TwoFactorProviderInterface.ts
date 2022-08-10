import AuthenticableTwoFactorUser from "../../types/AuthenticableTwoFactorUser";
import TwoFactorAuthenticationData from "../../types/TwoFactorAuthenticationData";

/**
 * Interface for the 2FA provider
 */
export default interface TwoFactorProviderInterface {
	/**
	 * Type of provider e.g. software tokens (TOTP), SMS text message, hardware tokens.
	 */
	provider: string,

	/**
	 * Verifies the 2FA data e.g. if the one time password (TOTP) is valid.
	 * 
	 * @param {TwoFactorAuthenticationData} userData 
	 */
	verify(userData: TwoFactorAuthenticationData): Promise<AuthenticableTwoFactorUser | void>;

	/**
	 * Register a new 2FA user and save it in the database. Returns a QR code. 
	 * 
	 * @param {string} email 
	 */
	register(email: string): Promise<string | void>;
}