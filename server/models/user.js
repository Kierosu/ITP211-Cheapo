
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
});

module.exports = sequelize.model('User', User);