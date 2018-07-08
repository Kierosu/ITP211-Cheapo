// models/comments.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const wishList = sequelize.define('wishList', {
    ProductID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    UserId: {
        type: Sequelize.INTEGER
    },
    ProductName: {
        type: Sequelize.STRING
    },
    ProductDescription: {
        type: Sequelize.STRING,
    },
    ProductPrice: {
        type: Sequelize.DECIMAL
    },
    ProductImage: {
        type: Sequelize.STRING,
        defaultValue: ""
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
wishList.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("Wish List table synced");
});

module.exports = sequelize.model('wishList', wishList);