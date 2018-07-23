
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;
const moment = require('moment');
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
        defaultValue: Sequelize.NOW,
        get: function() {
            return moment.utc(this.getDataValue('regDate')).format('YYYY-MM-DD');
        }
    },
    userType: {
        type: Sequelize.STRING,
        defaultValue: "Member"
    },
    TwoFA: {
        type: Sequelize.STRING,
        defaultValue: "disabled"
    },
    SecretToken: {
        type: Sequelize.STRING,
    },
    valueRecieved:{
        type: Sequelize.DECIMAL(10,2)
    }
});


User.sync({force: false, logging: console.log}).then(()=>{
    console.log("User table synced");
    User.upsert({
        userID: 1,
        username: "CheapSupport",
        email: "CheapSupport@gmail.com",
        password: "cheapo",
        userType: "Admin"
    });
    User.upsert({
        userID: 2,
        username: "Shafie",
        email: "shafie@gmail.com",
        password: "shafieMemeLord",
        userType: "Admin"
    });
    User.upsert({
        userID: 3,
        username: "Matthew",
        email: "matthew@gmail.com",
        password: "matthewMemeLord",
        userType: "Admin"
    });
    User.upsert({
        userID: 4,
        username: "Rayson",
        email: "rayson@gmail.com",
        password: "raysonMemeLord",
        userType: "Admin"
    });
    User.upsert({
        userID: 5,
        username: "Kierosu",
        email: "eugenetan9134@gmail.com",
        password: "WowWee123",
        profilePic: "ayaya.png",
        userType: "Admin"
    });
    User.upsert({
        userID: 6,
        username: "Teh Yang",
        email: "tehyang@gmail.com",
        password: "tehyangMemeLord",
        userType: "Admin"
    }); 
    User.upsert({
        userID: 7,
        username: "zuko",
        email: "zuko@gmail.com",
        password: "zuko",
        userType: "Member"
    });
    User.upsert({
        userID: 8,
        username: "test",
        email: "test@test.com",
        password: "test",
        userType: "Admin"
    });
    User.upsert({
        userID: 9,
        username: "appa",
        email: "appa@gmail.com",
        password: "appa",
        userType: "Member"
    });
    User.upsert({
        userID: 10,
        username: "toph",
        email: "toph@gmail.com",
        password: "toph",
        userType: "Member"
    });
});

User.beforeUpsert(function(user, options) {
    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        var passEncrypt = {password: hash}
        User.update(passEncrypt,{where:{userID:user.userID}});
    })
});

module.exports = sequelize.model('User', User);