// import { Model, DataTypes } from 'sequelize';
// import PostgresAdapter from "../PostgresAdapter";

// import { Optional } from "sequelize";
import { Table, Column, Model } from 'sequelize-typescript';

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

@Table({
  timestamps: true,
})
export default class User extends Model {
  @Column
  id: number

  @Column
  username: string

  @Column
  firstName: string

  @Column
  lastName: string

  @Column
  email: string

  @Column
  password: string
}


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