// import { Model, DataTypes } from 'sequelize';
// import PostgresAdapter from "../PostgresAdapter";
import UserInterface from '../../../models/UserInterface';

// import { Optional } from "sequelize";
import { Table, Column, Model } from 'sequelize-typescript';

/**
 * Definition for user model schema
 * 
 * @type {Schema}
 */
@Table
export default class User extends Model<UserInterface> {
  /**
   * Person username
   */
  @Column
  username!: string;
  
  /**
   * Person first name
   */
  @Column
  firstName!: string;
  
  /**
   * Person last name
   */
  @Column
  lastName!: string;
  
  /**
   * Person email
   */
  @Column
  email!: string;
  
  /**
   * Person password
   */
  @Column
  password!: string;
}




// interface UserAttributes {
//   id: number,
//   username: string,
//   firstName: string,
//   lastName: string,
//   email: string,
//   password: string,
// }

// interface UserCreationAttributes extends Optional<UserAttributes,'id' | 'username' | 'firstName' | 'lastName'> {}

// @Table({
//   timestamps: true,
// }) 
// class User extends Model<UserAttributes, UserCreationAttributes> {

// @Table({
//   timestamps: true,
// })


// @CreatedAt
// @Column
// createdat: Date

  // @UpdatedAt
  // @Column
  // updatedat: Date


// class User extends Model { }

// User.init({
//   id: {
//     type: DataTypes.INTEGER.UNSIGNED,
//     autoIncrement: true,
//     primaryKey: true
//   },
//   username: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   firstName: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   lastName: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// }, {
//   // tu koristis adapter.client
//   client,
//   modelName: 'user',
//   timestamps: true
// });