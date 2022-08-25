import User from "./db/models/user";
import TwoFactorUser from "./db/models/two_factor_user";

class Models {
  public User: any;
  public TwoFactorUser: any;

  constructor(sequelize: any, DataTypes: any) {
    this.User = User(sequelize, DataTypes);
    this.TwoFactorUser = TwoFactorUser(sequelize, DataTypes);
  }
}

export default Models;