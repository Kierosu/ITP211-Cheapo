var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const driver = sequelize.define('driver', {
    comItemID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    comItemName: {
        type: Sequelize.STRING
    },
    comItemDescription: {
        type: Sequelize.STRING,
    },
    comItemPrice: {
        type: Sequelize.DECIMAL
    },
    comItemImage: {
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
driver.sync({ force: true, logging: console.log }).then(() => {
    // Table created
    console.log("Completed Items table synced");
});

module.exports = sequelize.model('driver', driver);