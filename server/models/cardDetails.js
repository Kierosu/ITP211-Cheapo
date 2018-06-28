// models/comments.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const cardDetails = sequelize.define('cardDetails', {
    CardID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userID: {
        type: Sequelize.INTEGER
    },
    cardName: {
        type: Sequelize.STRING
    },
    cardNumber: {
        type: Sequelize.STRING
    },
    expiryDate: {
        type: Sequelize.STRING
    },
    verification: {
        type: Sequelize.STRING,
    },
    shippingAddress: {
        type: Sequelize.STRING
    },
    blockUnit: {
        type: Sequelize.STRING,
        defaultValue: ""
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
cardDetails.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("User Information Details table synced");
});

module.exports = sequelize.model('cardDetails', cardDetails);