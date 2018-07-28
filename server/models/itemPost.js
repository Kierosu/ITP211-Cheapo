// models/itemPost.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const itemPost = sequelize.define('itemPost', {

    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    itemPic: {
        type: Sequelize.STRING
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
    },
    price :{
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
    },
    brand: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "",
    },
    prodDesc: {
        type: Sequelize.STRING,
        defaultValue: "",
    },  
    ownerName: {
        type:Sequelize.STRING,
    },
    sellerID: {
        type: Sequelize.INTEGER,
    }
});

// force: true will drop the table if it already exists
itemPost.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("Item Posting table synced");
});

module.exports = sequelize.model('itemPost', itemPost);