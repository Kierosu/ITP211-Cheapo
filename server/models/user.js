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
        username: "Shafie",
        email: "shafie@gmail.com",
        password: "$2y$12$92KE.UCLVwJlLCQeuVcfVuDXT6PU1WSGtafBLxzWAz6fYvkcsL4wq",
        userType: "Admin",
        membership: "Gold"
    });
    User.upsert({
        userID: 2,
        username: "Matthew",
        email: "matthew@gmail.com",
        password: "$2y$12$peVFN7CPvrqr6YZUozfQTeiUSaUOalkBFcmdaE/4gUeGHzz/AaXbe",
        userType: "Admin",
        membership: "Gold"
    });
    User.upsert({
        userID: 3,
        username: "Rayson",
        email: "rayson@gmail.com",
        password: "$2y$12$C4lTSl1DZ9qaGORW15EqJe9vOteBfB/Q4U/N6WuS/fmFa7cW0mf3W",
        userType: "Admin",
        membership: "Gold"
    });
    User.upsert({
        userID: 4,
        username: "Kierosu",
        email: "eugenetan9134@gmail.com",
        password: "$2y$12$cBhwdc2Wd9ietwssq7vCAeZDonEQdZzQw7WzMyARRio3smhGft8Yy",
        profilePic: "ayaya.png",
        userType: "Admin",
        membership: "Gold"
    });
    User.upsert({
        userID: 5,
        username: "Teh Yang",
        email: "tehyang@gmail.com",
        password: "$2y$12$GMJL9AxLIhrg34NsN.HcK.ToLEVBtpe.GoDiF7If1pIEayHp0tGSC",
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
    User.upsert({
        userID: 11,
        username: "test",
        email: "test@test.com",
        password: "$2a$10$gfQpc2oWirUCvFrXS73rUumSkna8R/J9OQIlYRSITJnVrpOYZs1IS",
        userType: "Admin",
        membership: "Gold"
    });
});

module.exports = sequelize.model('User', User);