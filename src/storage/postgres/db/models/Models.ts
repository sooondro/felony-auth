
import User from './user'
import TwoFactorUser from './two_factor_user'

/**
 * Models class used a container for instantiating and holding Sequelize models.
 */
class Models {
  public User: any
  public TwoFactorUser: any

  constructor (sequelize: any, DataTypes: any) {
    this.User = User(sequelize, DataTypes)
    this.TwoFactorUser = TwoFactorUser(sequelize, DataTypes)

    this.User.hasMany(this.TwoFactorUser, { foreignKey: 'user_id' })
    this.TwoFactorUser.belongsTo(this.User, { foreignKey: 'user_id' })
  }
}

export default Models
