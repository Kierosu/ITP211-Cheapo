// models/comments.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const finalProducts = sequelize.define('finalProducts', {
    finalProductID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    finalProductName: {
        type: Sequelize.STRING
    },
    finalProductDescription: {
        type: Sequelize.STRING,
    },
    finalProductPrice: {
        type: Sequelize.DECIMAL
    },
    finalProductImage: {
        type: Sequelize.STRING,
        defaultValue: ""
    },
    userID: {
        type: Sequelize.INTEGER
    },
    sellerId: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATE,
        field: 'createdAt',
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: 'updatedAt'
    }
}, {
        freezeTableName: true, // Model tableName will be the same as the model name
        timestamps: false,
        underscored: true
    });
// force: true will drop the table if it already exists
finalProducts.sync({ force: true, logging: console.log }).then(() => {
    // Table created
    console.log("Final Products table synced");
});

module.exports = sequelize.model('finalProducts', finalProducts);