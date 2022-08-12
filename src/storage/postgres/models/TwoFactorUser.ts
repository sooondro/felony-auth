import { Table, Column, Model } from 'sequelize-typescript';
import TwoFactorUserInterface from '../../../models/TwoFactorUserInterface';
// import User from './User';

/**
 * Definition for two-factor user model schema.
 */
@Table
export default class TwoFactorUser extends Model<TwoFactorUserInterface> {
  /**
   * Two-factor user email.
   */
  @Column
  email!: string;

  /**
   * Two-factor provider.
   */
  @Column
  provider!: string;

  /**
   * Two-factor secret.
   */
  @Column
  secret!: string;
}
