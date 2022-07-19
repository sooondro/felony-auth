import RegistrationData from "../types/RegistrationData";
import TwoFactorRegistrationData from "../types/TwoFactorRegistrationData";

export default interface StorageAdapterInterface {
  register(payload: RegistrationData);
  login(payload: object): object;
  getUserByEmail(email: string);
  getUserById(id: string);
  getUserByUsername(username: string);
  getTwoFactorUserByEmail(email: string);
  registerTwoFactorUser(twoFactoUser: TwoFactorRegistrationData);
}
