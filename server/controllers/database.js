var Sequelize = require('sequelize');
var sequelizeTransforms = require('sequelize-transforms');

const sequelize =new Sequelize({
  dialect: 'mssql',
  dialectModulePath: 'tedious',
  dialectOptions: {
    driver: 'SQL Server Native Client 11.0',
    instanceName: 'SQLEXPRESS'
  },
  host: 'localhost',
  username: 'cheapoAdmin',
  password: 'ItsCheap',
  database: 'Cheapo',
  pool: {
      min: 0,
      max: 10,
      idle: 10000
    }
});

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

sequelizeTransforms(sequelize);

module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;

// var Sequelize = require('sequelize');
// var sequelizeTransforms = require('sequelize-transforms');

// const sequelize = new Sequelize({
//   dialect: 'mssql',
//   dialectModulePath: 'tedious',
//   dialectOptions: {
//     driver: 'SQL Server Native Client 11.0',
//     instanceName: 'MSSQLSERVER'
//   },
//   host: 'localhost',
//   username: 'admin',
//   password: 'admin',
//   database: 'Cheapo',
//   pool: {
//     min: 0,
//     max: 10,
//     idle: 10000
//   }
// });

// sequelize.authenticate().then(() => {
//   console.log('Connection has been established successfully.');
// }).catch(err => {
//   console.error('Unable to connect to the database:', err);
// });

// sequelizeTransforms(sequelize);

// module.exports.sequelize = sequelize;
// module.exports.Sequelize = Sequelize;