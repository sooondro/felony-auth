import { authenticator } from "otplib";
import QRCode from "qrcode";

import TwoFactorProviderInterface from "./TwoFactorProviderInterface";
import StorageAdapterInterface from "../../storage/StorageAdapterInterface";
import ErrorAdapterInterface from "../../error/ErrorAdapterInterface";
import twoFactorAuthenticationData from "../../types/TwoFactorAuthenticationData";
import TwoFactorRegistrationData from "../../types/TwoFactorRegistrationData";

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

  async verify(userData: twoFactorAuthenticationData) {
    const user = await this._storageAdapter.getTwoFactorUserByEmail(userData.email);

    if(!authenticator.check(userData.code, user.secret)) {
      this._errorAdapter.throwTwoFactorVerificationError(new Error("Verification failed. Invalid code or email sent."));
    }
    return user;
  }

  async register(email: string) {
    const secret = authenticator.generateSecret();

    const userData: TwoFactorRegistrationData = {
      email,
      secret: secret,
      provider: this.provider,
    };

    const user = await this._storageAdapter.registerTwoFactorUser(userData);
    console.log("2FA USER ", user);

    return await QRCode.toDataURL(authenticator.keyuri(email, '2FA Felony', user.secret));
  }
}