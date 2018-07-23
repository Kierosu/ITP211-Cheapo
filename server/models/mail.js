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

Mail.sync({ force: false, logging: console.log }).then(() => {
    console.log("Mail table synced");
    Mail.upsert({
        mailID: 1,
        sender: 1,
        receiver: 6,
        title: 'New item posted',
        message: 'You have posted a new item: Blue Shoe',
        status: 'notSeen'
    })
    Mail.upsert({
        mailID: 2,
        sender: 1,
        receiver: 7,
        title: 'New item posted',
        message: 'You have posted a new item: Pink Shoe',
        status: 'notSeen'
    })
    Mail.upsert({
        mailID: 3,
        sender: 1,
        receiver: 8,
        title: 'New item posted',
        message: 'You have posted a new item: Purple Shoe',
        status: 'notSeen'
    })
    Mail.upsert({
        mailID: 4,
        sender: 1,
        receiver: 9,
        title: 'New item posted',
        message: 'You have posted a new item: Red Shoe',
        status: 'notSeen'
    })
    Mail.upsert({
        mailID: 5,
        sender: 1,
        receiver: 10,
        title: 'New item posted',
        message: 'You have posted a new item: A poster',
        status: 'notSeen'
    })
});

module.exports = sequelize.model('Mail', Mail);