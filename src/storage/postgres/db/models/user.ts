'use strict'
import { Model, UUIDV4 } from 'sequelize'

interface UserAttributes {
  id: string
  username: string
  firstName?: string
  lastName?: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export default (sequelize: any, DataTypes: any): any => {
  class User extends Model<UserAttributes> implements UserAttributes {
    declare id: string
    declare username: string
    declare firstName: string
    declare lastName: string
    declare email: string
    declare password: string
    declare createdAt: Date
    declare updatedAt: Date
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        primaryKey: true,
        validate: {
          isUUID: 4
        }
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      firstName: {
        type: DataTypes.STRING,
        field: 'first_name',
        validate: {
          notEmpty: true
        }
      },
      lastName: {
        type: DataTypes.STRING,
        field: 'last_name',
        validate: {
          notEmpty: true
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 256]
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at'
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'user',
      freezeTableName: true
    }
  )
  return User
}
