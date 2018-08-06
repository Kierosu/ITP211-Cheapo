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
        allowNull: false
    }
    ,
    userID:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    status:{
        type: Sequelize.STRING,
        defaultValue: ''
    }
});

Reports.sync({force: true, logging: console.log}).then(()=>{
    console.log("Reports table synced");
    Reports.upsert({
        reportID:1,
        reportDetails:'Router was damaged',
        itemID: 5,
        userID:7
    });
});

module.exports = sequelize.model('Reports', Reports);