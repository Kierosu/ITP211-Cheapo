var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Item = sequelize.define('Item', {
    itemID:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name:{
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    detail: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    price:{
        type:Sequelize.DOUBLE,
        allowNull: false
    },
    itemPic: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'Active'
    },
    warnings: {
        type: Sequelize.STRING,
        defaultValue: ''
    },
    userID:{
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Item.sync({force: false, logging: console.log}).then(()=>{
    console.log("Item table synced");
    Item.upsert({
        itemID: 1,
        name: "Blue Bag",
        detail: "Well made leather blue bag",
        price: "19.90",
        itemPic: "dBlueBag.jpg",
        userID: 7,
        status: 'Auction'
    });
    Item.upsert({
        itemID: 2,
        name: "Black Bag",
        detail: "It's a branded shiny black bag",
        price: "32.90",
        itemPic: "dBlackBag.jpg",
        userID: 8,
        status: 'Auction'
    });
    Item.upsert({
        itemID: 3,
        name: "Yello Leather Sack",
        detail: "It's a yellow leather sack",
        price: "20.90",
        itemPic: "dYellowBag.jpg",
        userID: 9,
        status: 'Auction'
    });
    Item.upsert({
        itemID: 4,
        name: "Leather Belt",
        detail: "Branded yellow leather belt",
        price: "13.90",
        itemPic: "dLeatherBelt.jpg",
        userID: 10,
        status: 'Auction'
    });
    Item.upsert({
        itemID: 5,
        name: "Netgear Router",
        detail: "Used Netgear Router, 1 month old",
        price: "17.90",
        itemPic: "dRouter.jpg",
        userID: 7
    });
    Item.upsert({
        itemID: 6,
        name: "Logitech Mouse",
        detail: "Logitech Mouse model 17AR-xTreme",
        price: "35.90",
        itemPic: "dMouse.png",
        userID: 8
    });
    Item.upsert({
        itemID: 7,
        name: "Beats Headset",
        detail: "Wireless Rose gold beats headset",
        price: "180.00",
        itemPic: "dGoldHeadset.png",
        userID: 9
    });
    Item.upsert({
        itemID: 8,
        name: "RAD Earphones",
        detail: "Bran new RAD 2017 Earphones",
        price: "11.90",
        itemPic: "dWhiteEarphone.jpg",
        userID: 10
    });
    Item.upsert({
        itemID: 9,
        name: "Gold Watch",
        detail: "Gold Watch signed by Dello Moo",
        price: "54.90",
        itemPic: "dGoldWatch.jpg",
        userID: 10
    });
    Item.upsert({
        itemID: 10,
        name: "Black Wallet",
        detail: "New Black LV wallet",
        price: "31.90",
        itemPic: "dBlackWallet.jpg",
        userID: 10
    });
    Item.upsert({
        itemID: 11,
        name: "UGG Boots",
        detail: "UGG Spring edition Boots",
        price: "101.90",
        itemPic: "dBlackBoots.jpg",
        userID: 10
    });
});

module.exports = sequelize.model('Item', Item);