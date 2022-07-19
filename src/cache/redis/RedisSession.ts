import { v4 as uuidv4 } from 'uuid';

import SessionInterface from '../../models/SessionInterface';
import UserInterface from "../../models/UserInterface";

export default class RedisSession implements SessionInterface {
  constructor(user: UserInterface) {
    this._key = uuidv4();
    this._value = user;
  }

  private _key: string;
  private _value: UserInterface;

  public get key() {
    return this._key;
  }

  public get value() {
    return this._value;
  }
}