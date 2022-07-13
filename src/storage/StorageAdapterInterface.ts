import RegistrationData from "../types/RegistrationData";

export default interface StorageAdapterInterface {
  register(payload: RegistrationData);
  login(payload: object): object;
  getUserByEmail(email: string);
  getUserById(id: string);
  getUserByUsername(username: string);
}
