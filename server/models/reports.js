var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Reports = sequelize.define('Reports', {
    reportID:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    reportDetails:{
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    itemID:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Items',
            key: 'itemID'
        }
    }
    ,
    userID:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'userID'
        }
    }
});

Reports.sync({force: false, logging: console.log}).then(()=>{
    console.log("Reports table synced");
});

module.exports = sequelize.model('Reports', Reports);