'use strict';
import { Model } from 'sequelize';

interface UserAttributes {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class User extends Model<UserAttributes> implements UserAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    declare id: string;
    declare username: string;
    declare firstName: string;
    declare lastName: string;
    declare email: string;
    declare password: string;
    declare createdAt: Date;
    declare updatedAt: Date;

    static associate(models: any) {
      // define association here
    }
  }
  User.init(
    {
      id: {
        // type: DataTypes.UUID,
        // defaultValue: UUIDV4,
        // allowNull: false,
        // primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        field: 'first_name',
      },
      lastName: {
        type: DataTypes.STRING,
        field: 'last_name',
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
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
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'user',
      freezeTableName: true,
    }
  );
  return User;
};