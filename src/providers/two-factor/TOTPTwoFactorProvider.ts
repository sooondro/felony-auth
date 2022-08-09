import { authenticator } from "otplib";
import QRCode from "qrcode";

import TwoFactorProviderInterface from "./TwoFactorProviderInterface";
import StorageAdapterInterface from "../../storage/StorageAdapterInterface";
import ErrorAdapterInterface from "../../error/ErrorAdapterInterface";
import TwoFactorAuthenticationData from "../../types/TwoFactorAuthenticationData";
import TwoFactorRegistrationData from "../../types/TwoFactorRegistrationData";
import AuthenticableTwoFactorUser from "../../types/AuthenticableTwoFactorUser";

export default class TOTPTwoFactorProvider implements TwoFactorProviderInterface {

  private _storageAdapter: StorageAdapterInterface;
  private _errorAdapter: ErrorAdapterInterface;

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

  provider = "TOTP";

  /**
   * 
   * @param {TwoFactorAuthenticationData} userData 
   * @returns 
   */
  async verify(userData: TwoFactorAuthenticationData): Promise<AuthenticableTwoFactorUser | undefined> {
    const user = await this._storageAdapter.getTwoFactorUserByEmail(userData.email);

    if (user) {
      if (!authenticator.check(userData.code, user.secret)) {
        this._errorAdapter.throwTwoFactorVerificationError(new Error("Verification failed. Invalid code or email sent."));
      }
      return user;
    }
  }

  async register(email: string): Promise<string|undefined> {
    const secret = authenticator.generateSecret();

    const userData: TwoFactorRegistrationData = {
      email,
      secret: secret,
      provider: this.provider,
    };

    const user = await this._storageAdapter.registerTwoFactorUser(userData);
    console.log("2FA USER ", user);

    if (user)
      return await QRCode.toDataURL(authenticator.keyuri(email, '2FA Felony', user.secret));
  }
}