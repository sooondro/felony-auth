import Authentication from "../Authentication";
import AuthenticableTwoFactorUser from "../types/AuthenticableTwoFactorUser";
import AuthenticableUser from "../types/AuthenticableUser";
import LoginData from "../types/LoginData";
import RegistrationData from "../types/RegistrationData";
import TwoFactorRegistrationData from "../types/TwoFactorRegistrationData";

/**
 * Storage adapter interface.
 * 
 * @type {Interface}
 */
export default interface StorageAdapterInterface {
  /**
   * Used for injecting Authentication class into the adapter.
   * 
   * @param {Authentication} authentication 
   */
  initialize(authentication: Authentication): void;
  /**
   * Register user.
   * 
   * @param {RegistrationData} payload 
   */
  register(payload: RegistrationData): Promise<AuthenticableUser>;

  /**
   * Login user.
   * 
   * @param {LoginData} payload 
   */
  login(payload: LoginData): Promise<AuthenticableUser>;

  /**
   * Fetch user from the database by email.
   * 
   * @param {string} email 
   */
  getUserByEmail(email: string): Promise<AuthenticableUser>;

  /**
   * Fetch user from the database by id.
   * @param {string} id 
   */
  getUserById(id: string): Promise<AuthenticableUser>;

  /**
   * Fetch user from the database by username.
   * 
   * @param {string} username 
   */
  getUserByUsername(username: string): Promise<AuthenticableUser>;

  /**
   * Fetch two-factor user from the database by AuthenticableUser object
   * 
   * @param {AuthenticableUser} user 
   */
  getTwoFactorUser(user: AuthenticableUser): Promise<AuthenticableTwoFactorUser>;

  /**
   * Fetch two-factor user from the database by email.
   * 
   * @param {string} email 
   */
  getTwoFactorUserByEmail(email: string): Promise<AuthenticableTwoFactorUser>;

  /**
   * Register two-factor user to the database.
   * 
   * @param {TwoFactorRegistrationData} twoFactorUser 
   */
  registerTwoFactorUser(twoFactorUser: TwoFactorRegistrationData)
    : Promise<AuthenticableTwoFactorUser>;

  /**
   * Change user's password.
   * 
   * @param {string} email 
   * @param {string} oldPassword 
   * @param {string} newPassword 
   */
  changePassword(email: string, oldPassword: string, newPassword: string): Promise<void>;
}
