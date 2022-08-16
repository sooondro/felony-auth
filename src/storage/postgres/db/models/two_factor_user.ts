'use strict';
import { Model } from 'sequelize';

interface TwoFactorUserAttributes {
  id: number;
  userId: string;
  secret: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class TwoFactorUser extends Model<TwoFactorUserAttributes> implements TwoFactorUser {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    declare id: number;
    declare userId: string;
    declare secret: string;
    declare provider: string;
    declare createdAt: Date;
    declare updatedAt: Date;

    static associate(models: any) {
      // define association here
      // this.userId = this.belongsTo(models.User, {foreignKey: 'user_id'});
    }
  }
  TwoFactorUser.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id',
      references: {
        model: 'user',
        key: 'id',
      }
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  }, {
    sequelize,
    modelName: 'TwoFactorUser',
    tableName: 'two_factor_user',
    freezeTableName: true,
  });
  return TwoFactorUser;
};