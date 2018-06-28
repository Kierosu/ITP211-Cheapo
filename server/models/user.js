var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const User = sequelize.define('User', {
    userID:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username:{
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    password:{
        type:Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    profilePic: {
        type: Sequelize.STRING,
        defaultValue: "defaultProfile.png"
    },
    joinDate: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.NOW
    },
    userType: {
        type: Sequelize.STRING,
        defaultValue: "Member"
    },
    membership: {
        type: Sequelize.STRING,
        defaultValue: "Bronze"
    }
});

User.sync({force: false, logging: console.log}).then(()=>{
    console.log("User table synced");
    User.upsert({
        userID: 1,
        username: "(Admin)Shafie",
        email: "shafie@gmail.com",
        password: "shafieMemeLord",
        userType: "Admin",
        membership: "Gold"
    });
    User.upsert({
        userID: 2,
        username: "(Admin)Matthew",
        email: "matthew@gmail.com",
        password: "matthewMemeLord",
        userType: "Admin",
        membership: "Gold"
    });
    User.upsert({
        userID: 3,
        username: "(Admin)Rayson",
        email: "rayson@gmail.com",
        password: "raysonMemeLord",
        userType: "Admin",
        membership: "Gold"
    });
    User.upsert({
        userID: 4,
        username: "(Admin)Kierosu",
        email: "eugenetan9134@gmail.com",
        password: "WowWee123",
        profilePic: "ayaya.png",
        userType: "Admin",
        membership: "Gold"
    });
    User.upsert({
        userID: 5,
        username: "(Admin)Teh Yang",
        email: "tehyang@gmail.com",
        password: "tehyangMemeLord",
        userType: "Admin",
        membership: "Gold"
    });
    User.upsert({
        userID: 6,
        username: "Aang",
        email: "aang@gmail.com",
        password: "$2a$10$V5/nSU3KOAWzevPK/R.fMeVR9fOrgg141dzbn4grXglrSOtYF1l4C",
        userType: "Member",
        membership: "Bronze"
    });
    User.upsert({
        userID: 7,
        username: "Zuko",
        email: "zuko@gmail.com",
        password: "$2a$10$u4PtvJIn7dSvvdszj9Sza.DlTmznD39XMDJUHcgRZ4179l/bPsRlW",
        userType: "Member",
        membership: "Bronze"
    });
    User.upsert({
        userID: 8,
        username: "Ozai",
        email: "ozai@gmail.com",
        password: "$2a$10$CFm4xqX8NqrxVYM6mKQVJO4gmaU4AJl8KI7cIFgmMe2/WzH3iDAE2",
        userType: "Member",
        membership: "Bronze"
    });
    User.upsert({
        userID: 9,
        username: "Toph",
        email: "toph@gmail.com",
        password: "$2a$10$O1HXAlR8oB8GV7NWRAB1XuNUhGpi/UQgYTZdSY7Bs3A2DQscqT9Qe",
        userType: "Member",
        membership: "Bronze"
    });
    User.upsert({
        userID: 10,
        username: "Azula",
        email: "azula@gmail.com",
        password: "$2a$10$LcrYG46Zcyk15PDojbHtruUZi7ttWBQi0PnYU9LAfU27MIT1AFHbG",
        userType: "Member",
        membership: "Bronze"
    });
});

module.exports = sequelize.model('User', User);