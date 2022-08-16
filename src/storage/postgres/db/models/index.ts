// 'use strict';

// import { readdirSync } from 'fs';
// import { basename as _basename, join } from 'path';
// import Sequelize, { DataTypes } from 'sequelize';
// const basename = _basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const c = await import (`${__dirname}/../config/config.js`);
// const config = c[env];
// const db: any = {};

'use strict';

import fs from 'fs';
import path, { join } from 'path';
import { Sequelize, DataTypes } from 'sequelize';
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// PITANJE
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require(__dirname + '/../config/config.js')[env];
const db: any = {};

let sequelize: any;
if (config.use_env_variable) {
  sequelize = new Sequelize(config); // (process.env[config.use_env_variable], config); PITANJE
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.ts');
  })
  .forEach(file => {
    // PITANJE
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const model = require(join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
