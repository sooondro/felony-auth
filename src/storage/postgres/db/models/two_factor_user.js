'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class TwoFactorUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.userId = this.belongsTo(models.User, {foreignKey: 'user_id'});
    }
  }
  TwoFactorUser.init({
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id',
      references: {
        model: 'User',
        key: 'id',
      }
    },
    secret: DataTypes.STRING,
    provider: DataTypes.STRING,
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