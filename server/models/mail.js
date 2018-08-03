var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Mail = sequelize.define('Mail', {
    mailID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sender: {
        type: Sequelize.INTEGER,
        allowNull: false,
        trim: true
    },
    receiver: {
        type: Sequelize.INTEGER,
        allowNull: false,
        trim: true
    },
    title: {
        type: Sequelize.STRING
    },
    message: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Mail.sync({ force: true, logging: console.log }).then(() => {
    console.log("Mail table synced");
});

module.exports = sequelize.model('Mail', Mail);