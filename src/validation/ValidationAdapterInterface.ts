// import ErrorAdapterInterface from "../error/ErrorAdapterInterface";
import RegistrationData from "../types/RegistrationData";
import LoginData from "../types/LoginData";

export default interface ValidationAdapterInterface {
	registration(payload: RegistrationData): void | Error;
  login(payload: LoginData): void | Error;
}