var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const FList = sequelize.define('FList', {
    fListID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    follower: {
        type: Sequelize.INTEGER,
        allowNull: false,
        trim: true
    },
    following: {
        type: Sequelize.INTEGER,
        allowNull: false,
        trim: true
    }
});

FList.sync({ force: false, logging: console.log }).then(() => {
    console.log("FList table synced");
    FList.upsert({
        fListID: 1,
        follower: 1,
        following: 7
    });
    FList.upsert({
        fListID: 2,
        follower: 2,
        following: 7
    });
    FList.upsert({
        fListID: 3,
        follower: 3,
        following: 7
    });
    FList.upsert({
        fListID: 4,
        follower: 4,
        following: 7
    });
    FList.upsert({
        fListID: 5,
        follower: 7,
        following: 5
    });
    FList.upsert({
        fListID: 6,
        follower: 7,
        following: 6
    });
    FList.upsert({
        fListID: 7,
        follower: 7,
        following: 8
    });
    FList.upsert({
        fListID: 8,
        follower: 7,
        following: 9
    });
});

module.exports = sequelize.model('FList', FList);