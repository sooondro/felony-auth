// import ErrorAdapterInterface from "../error/ErrorAdapterInterface";
import RegistrationData from "../types/RegistrationData";
import LoginData from "../types/LoginData";

/**
 * Validation adapter interface
 * 
 * @type {Interface}
 */
export default interface ValidationAdapterInterface {
  /**
   * Validate registration data
   * 
   * @param {RegistrationData} payload 
   * @throws
   */
	registration(payload: RegistrationData): void | Error;

  /**
   * Validate login data
   * 
   * @param {LoginData} payload 
   * @throws 
   */
  login(payload: LoginData): void | Error;
}