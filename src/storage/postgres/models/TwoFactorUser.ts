import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import TwoFactorUserInterface from '../../../models/TwoFactorUserInterface';
import User from './User';

@Table
export default class TwoFactorUser extends Model<TwoFactorUserInterface> {
  // @ForeignKey(() => User)
  // @Column
  // userId: number

  @Column
  email: string

  @Column
  provider: string

  @Column
  secret: string
}


// CREATE TABLE "TwoFactorUsers" (
//   id SERIAL PRIMARY KEY,
//   email VARCHAR(256) NOT NULL,
//   provider VARCHAR(256) NOT NULL,
//   secret VARCHAR(256) NOT NULL
// );