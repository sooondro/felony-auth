import User from "./user";
import TwoFactorUser from "./two_factor_user";

class Models {
  public User: any;
  public TwoFactorUser: any;

  constructor(sequelize: any, DataTypes: any) {
    this.User = User(sequelize, DataTypes);
    this.TwoFactorUser = TwoFactorUser(sequelize, DataTypes);
  }
}

export default Models;