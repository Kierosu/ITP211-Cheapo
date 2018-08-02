// models/itemPost.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const itemPost = sequelize.define('itemPost', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    itemPic: {
        type: Sequelize.STRING,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price :{
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    brand: {
        type: Sequelize.STRING,
        allowNull: true
    },
    prodDesc: {
        type: Sequelize.STRING,
        allowNull: true
    }, 
    ownerName: {
        type:Sequelize.STRING,
        allowNull: true
    },
    sellerID: {
        type: Sequelize.INTEGER        
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'Active'
    },
    warnings: {
        type: Sequelize.STRING,
        defaultValue: ''
    }
});

// force: true will drop the table if it already exists
itemPost.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("Item Posting table synced");
    itemPost.upsert({
        id: 1,
        title: "Blue Bag",
        prodDesc: "Well made leather blue bag",
        price: "19.90",
        itemPic: "dBlueBag.jpg",
        sellerID: 7,
        status: 'Auction'
    });
    itemPost.upsert({
        id: 2,
        title: "Black Bag",
        prodDesc: "It's a branded shiny black bag",
        price: "32.90",
        itemPic: "dBlackBag.jpg",
        sellerID: 8,
        status: 'Auction'
    });
    itemPost.upsert({
        id: 3,
        title: "Yello Leather Sack",
        prodDesc: "It's a yellow leather sack",
        price: "20.90",
        itemPic: "dYellowBag.jpg",
        sellerID: 9,
        status: 'Auction'
    });
    itemPost.upsert({
        id: 4,
        title: "Leather Belt",
        prodDesc: "Branded yellow leather belt",
        price: "13.90",
        itemPic: "dLeatherBelt.jpg",
        sellerID: 10,
        status: 'Auction'
    });
    itemPost.upsert({
        id: 5,
        title: "Netgear Router",
        prodDesc: "Used Netgear Router, 1 month old",
        price: "17.90",
        itemPic: "dRouter.jpg",
        sellerID: 7
    });
    itemPost.upsert({
        id: 6,
        title: "Logitech Mouse",
        prodDesc: "Logitech Mouse model 17AR-xTreme",
        price: "35.90",
        itemPic: "dMouse.png",
        sellerID: 8
    });
    itemPost.upsert({
        id: 7,
        title: "Beats Headset",
        prodDesc: "Wireless Rose gold beats headset",
        price: "180.00",
        itemPic: "dGoldHeadset.png",
        sellerID: 9
    });
    itemPost.upsert({
        id: 8,
        title: "RAD Earphones",
        prodDesc: "Bran new RAD 2017 Earphones",
        price: "11.90",
        itemPic: "dWhiteEarphone.jpg",
        sellerID: 10
    });
    itemPost.upsert({
        id: 9,
        title: "Gold Watch",
        prodDesc: "Gold Watch signed by Dello Moo",
        price: "54.90",
        itemPic: "dGoldWatch.jpg",
        sellerID: 10
    });
    itemPost.upsert({
        id: 10,
        title: "Black Wallet",
        prodDesc: "New Black LV wallet",
        price: "31.90",
        itemPic: "dBlackWallet.jpg",
        sellerID: 10
    });
    itemPost.upsert({
        id: 11,
        title: "UGG Boots",
        prodDesc: "UGG Spring edition Boots",
        price: "101.90",
        itemPic: "dBlackBoots.jpg",
        sellerID: 10
    });
});

module.exports = sequelize.model('itemPost', itemPost);