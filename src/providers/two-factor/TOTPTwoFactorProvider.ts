import { authenticator } from "otplib";
import QRCode from "qrcode";

import TwoFactorProviderInterface from "./TwoFactorProviderInterface";
import TwoFactorRegistrationData from "../../types/TwoFactorRegistrationData";
import AuthenticableTwoFactorUser from "../../types/AuthenticableTwoFactorUser";
import AuthenticableUser from "../../types/AuthenticableUser";
import Authentication from "../../Authentication";

export default class TOTPTwoFactorProvider implements TwoFactorProviderInterface {
  private authentication!: Authentication;

  /**
   * Type of 2FA
   */
  provider = "TOTP";

  /**
   * Used for injecting Authentication class into the adapter.
   * 
   * @param {Authentication} authentication 
   */
  initialize(authentication: Authentication): void {
    this.authentication = authentication;
  }

  /**
   * Verifies the given code with the secret stored in the database.
   * 
   * @param {TwoFactorAuthenticationData} user
   * @param {string} code 
   * @returns 
   */
  async verify(user: AuthenticableTwoFactorUser, code: string): Promise<AuthenticableTwoFactorUser> {
    if (!authenticator.check(code, user.secret)) {
      throw "Verification failed. Invalid 2FA code.";
    }

    return user;
  }

  /**
   * Registers a new user 2FA user. Generates a secret for the new user and saves it in the database.
   * 
   * @param {AuthenticableUser} user 
   * @returns 
   */
  async register(user: AuthenticableUser): Promise<TwoFactorRegistrationData> {
    const secret = authenticator.generateSecret();

    const userData: TwoFactorRegistrationData = {
      userId: user.id,
      secret: secret,
      provider: this.provider,
    };

    return userData;
  }

  /**
   * Generates QR code base on AuthenticableTwoFactorUser object
   * 
   * @param {AuthenticableTwoFactorUser} user 
   * @returns 
   */
  async generateQRCode(user: AuthenticableTwoFactorUser): Promise<string> {
    return await QRCode.toDataURL(authenticator.keyuri(user.userId, '2FA Felony', user.secret));
  }
}