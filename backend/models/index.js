const { Sequelize } = require('sequelize');
const config = require('../config/config.js').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = require('./user')(sequelize, Sequelize);
db.File = require('./file')(sequelize, Sequelize);
db.Metadata = require('./metadata')(sequelize, Sequelize);

// Associations
db.User.hasMany(db.File, { foreignKey: 'userId' });
db.File.belongsTo(db.User, { foreignKey: 'userId' });
db.File.hasOne(db.Metadata, { foreignKey: 'userId' });

db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Tables synced with DB');
  })
  .catch((err) => {
    console.error('❌ Error syncing tables:', err);
  });

module.exports = db;
