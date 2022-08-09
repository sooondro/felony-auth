import UserInterface from "../models/UserInterface";
import AuthenticableTwoFactorUser from "../types/AuthenticableTwoFactorUser";
import AuthenticableUser from "../types/AuthenticableUser";
import LoginData from "../types/LoginData";
import RegistrationData from "../types/RegistrationData";
import TwoFactorRegistrationData from "../types/TwoFactorRegistrationData";

/**
 * Storage adapter interface
 * 
 * @type {Interface}
 */
export default interface StorageAdapterInterface {
  /**
   * Register user
   * 
   * @param {RegistrationData} payload 
   */
  register(payload: RegistrationData): Promise<AuthenticableUser | void>;

  /**
   * Login user
   * 
   * @param {LoginData} payload 
   */
  login(payload: LoginData): Promise<AuthenticableUser | void>;

  /**
   * Fetch user from the database by email 
   * 
   * @param {string} email 
   */
  getUserByEmail(email: string): Promise<AuthenticableUser | null>;

  /**
   * Fetch user from the database by id
   * @param {string} id 
   */
  getUserById(id: string): Promise<AuthenticableUser | null>;

  /**
   * Fetch user from the database by username
   * 
   * @param {string} username 
   */
  getUserByUsername(username: string): Promise<AuthenticableUser | null>;

  /**
   * Fetch two-factor user from the database by email
   * 
   * @param {string} email 
   */
  getTwoFactorUserByEmail(email: string): Promise<AuthenticableTwoFactorUser | null>;

  /**
   * Register two-factor user to the database
   * 
   * @param {TwoFactorRegistrationData} twoFactorUser 
   */
  registerTwoFactorUser(twoFactorUser: TwoFactorRegistrationData)
    : Promise<AuthenticableTwoFactorUser|undefined>;
}
