'use strict'
import { Model, UUIDV4 } from 'sequelize'

interface TwoFactorUserAttributes {
  id: string
  userId: string
  secret: string
  provider: string
  createdAt: Date
  updatedAt: Date
}

export default (sequelize: any, DataTypes: any): any => {
  class TwoFactorUser extends Model<TwoFactorUserAttributes> implements TwoFactorUser {
    declare id: string
    declare userId: string
    declare secret: string
    declare provider: string
    declare createdAt: Date
    declare updatedAt: Date
  }

  TwoFactorUser.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: UUIDV4,
      primaryKey: true,
      validate: {
        isUUID: 4,
        notEmpty: true,
        notNull: true
      }
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      },
      validate: {
        isUUID: 4,
        notEmpty: true,
        notNull: true
      }
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        notNull: true
      }
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        notNull: true
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
  }, {
    sequelize,
    modelName: 'TwoFactorUser',
    tableName: 'two_factor_user',
    freezeTableName: true
  })
  return TwoFactorUser
}
