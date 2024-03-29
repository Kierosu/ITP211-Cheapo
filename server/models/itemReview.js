var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Reviews = sequelize.define('Reviews', {
    itemReviewID:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    itemReview:{
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    itemID:{
        type: Sequelize.INTEGER,
        allowNull: false
    }
    ,
    userID:{
        type: Sequelize.INTEGER
    }
});

Reviews.sync({force: true, logging: console.log}).then(()=>{
    console.log("Item table synced");
    Reviews.upsert({
        itemReviewID: 1,
        itemReview: "Looks nice",
        itemID: 5,
        userID: 7
    });
    Reviews.upsert({
        itemReviewID: 2,
        itemReview: "Smooth and fluent clicking motion",
        itemID: 6,
        userID: 8
    });
    Reviews.upsert({
        itemReviewID: 3,
        itemReview: "Amazing sound quality",
        itemID: 7,
        userID: 9
    });
    Reviews.upsert({
        itemReviewID: 4,
        itemReview: "Comfortable design, value for money!",
        itemID: 8,
        userID: 10
    });
});


module.exports = sequelize.model('Reviews', Reviews);