import AuthenticableUser from "../types/AuthenticableUser";
import UserInterface from "./UserInterface";

export default interface SessionInterface {
  get id(): string;
  get csrf(): string;
  get user(): AuthenticableUser;
}