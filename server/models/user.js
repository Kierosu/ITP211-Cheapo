
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;
const bcrypt = require("bcrypt");
const saltRounds = 10;

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
    },
    TwoFA: {
        type: Sequelize.STRING,
        defaultValue: "disabled"
    },
    SecretToken: {
        type: Sequelize.STRING,
    }
});


User.sync({force: false, logging: console.log}).then(()=>{
    console.log("User table synced");
    User.upsert({
        userID: 1,
        username: "Shafie",
        email: "shafie@gmail.com",
        password: "shafieMemeLord",
        userType: "Admin",
        membership: "Gold",
    });
    User.upsert({
        userID: 2,
        username: "Matthew",
        email: "matthew@gmail.com",
        password: "matthewMemeLord",
        userType: "Admin",
        membership: "Gold"
    });
    User.upsert({
        userID: 3,
        username: "Rayson",
        email: "rayson@gmail.com",
        password: "raysonMemeLord",
        userType: "Admin",
        membership: "Gold"
    });
    User.upsert({
        userID: 4,
        username: "Kierosu",
        email: "eugenetan9134@gmail.com",
        password: "WowWee123",
        profilePic: "ayaya.png",
        userType: "Admin",
        membership: "Gold"
    });
    User.upsert({
        userID: 5,
        username: "Teh Yang",
        email: "tehyang@gmail.com",
        password: "tehyangMemeLord",
        userType: "Admin",
        membership: "Gold"
    });
});

User.beforeUpsert(function(user, options) {
    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        var passEncrypt = {password: hash}
        User.update(passEncrypt,{where:{userID:user.userID}});
    })
});

module.exports = sequelize.model('User', User);