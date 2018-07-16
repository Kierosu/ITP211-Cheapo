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
        allowNull: false,
        references: {
            model: 'Items',
            key: 'itemID'
        }
    }
    ,
    userID:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'userID'
        }
    }
});

Reviews.sync({force: false, logging: console.log}).then(()=>{
    console.log("Item table synced");
    Reviews.upsert({
        itemReviewID: 1,
        itemReview: "Looks nice",
        itemID: 1,
        userID: 6
    });
    Reviews.upsert({
        itemReviewID: 2,
        itemReview: "Smells nice",
        itemID: 2,
        userID: 7
    });
    Reviews.upsert({
        itemReviewID: 3,
        itemReview: "Taste nice",
        itemID: 3,
        userID: 8
    });
    Reviews.upsert({
        itemReviewID: 4,
        itemReview: "Feels nice",
        itemID: 4,
        userID: 9
    });
    Reviews.upsert({
        itemReviewID: 5,
        itemReview: "Nice",
        itemID: 5,
        userID: 10
    });
});


module.exports = sequelize.model('Reviews', Reviews);