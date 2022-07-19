import UserInterface from "./UserInterface";

export default interface SessionInterface {
  get key(): string;
  get value(): UserInterface;
}