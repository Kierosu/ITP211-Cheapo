var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Auction = sequelize.define('Auction', {
    auctionID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    itemAuctionID: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    basePrice: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        trim: true
    },
    highestPrice: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    buyerID: {
        type: Sequelize.STRING
    },
    endDate: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.NOW
    }
});

Auction.sync({ force: false, logging: console.log }).then(() => {
    console.log("Auction table synced");
    Auction.upsert({
        auctionID: 1,
        itemAuctionID: 1,
        basePrice: 12.50,
        highestPrice: 17.15,
        buyerID: 7, 
        endDate: '2018-07-15T23:30:00'
    });
    Auction.upsert({
        auctionID: 2,
        itemAuctionID: 2,
        basePrice: 12.50,
        highestPrice: 17.15,
        buyerID: 8, 
        endDate: '2018-07-15T23:30:00'
    });
});

module.exports = sequelize.model('Auction', Auction);