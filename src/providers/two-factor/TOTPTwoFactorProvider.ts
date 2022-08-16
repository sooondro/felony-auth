import { authenticator } from "otplib";
import QRCode from "qrcode";

import TwoFactorProviderInterface from "./TwoFactorProviderInterface";
import StorageAdapterInterface from "../../storage/StorageAdapterInterface";
import ErrorAdapterInterface from "../../error/ErrorAdapterInterface";
import TwoFactorAuthenticationData from "../../types/TwoFactorAuthenticationData";
import TwoFactorRegistrationData from "../../types/TwoFactorRegistrationData";
import AuthenticableTwoFactorUser from "../../types/AuthenticableTwoFactorUser";

export default class TOTPTwoFactorProvider implements TwoFactorProviderInterface {

  private _storageAdapter!: StorageAdapterInterface;
  private _errorAdapter!: ErrorAdapterInterface;

  public get storageAdapter() {
    return this._storageAdapter;
  }
  public set storageAdapter(storageAdapter: StorageAdapterInterface) {
    this._storageAdapter = storageAdapter;
  }
  public get errorAdapter() {
    return this._errorAdapter;
  }
  public set errorAdapter(errorAdapter: ErrorAdapterInterface) {
    this._errorAdapter = errorAdapter;
  }

  /**
   * Type of 2FA
   */
  provider = "TOTP";

  /**
   * Verifies the given code with the secret stored in the database.
   * 
   * @param {TwoFactorAuthenticationData} userData 
   * @returns 
   */
  async verify(userData: TwoFactorAuthenticationData): Promise<AuthenticableTwoFactorUser | void> {
    const user = await this._storageAdapter.getTwoFactorUserByEmail(userData.email);

    if (user) {
      if (!authenticator.check(userData.code, user.secret)) {
        this._errorAdapter.throwTwoFactorVerificationError(new Error("Verification failed. Invalid code or email sent."));
      }
      return user;
    }
  }

  /**
   * Registers a new user 2FA user. Generates a secret for the new user and saves it in the database.
   * 
   * @param {string} email 
   * @returns 
   */
  async register(email: string): Promise<string | void> {
    const secret = authenticator.generateSecret();

    const userData: TwoFactorRegistrationData = {
      email,
      secret: secret,
      provider: this.provider,
    };

    const user = await this._storageAdapter.registerTwoFactorUser(userData);

    if (user) {
      return await QRCode.toDataURL(authenticator.keyuri(email, '2FA Felony', user.secret));
    }
  }
}