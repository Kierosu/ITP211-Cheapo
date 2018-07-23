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
        name: "Blue Shoe",
        detail: "It's only a blue shoe",
        price: "19.90",
        itemPic: "dBlueShoe.jpg",
        userID: 6,
        status: 'Auction'
    });
    Item.upsert({
        itemID: 2,
        name: "Pink Shoe",
        detail: "It's only a Pink shoe",
        price: "19.90",
        itemPic: "dPinkShoe.jpg",
        userID: 7,
        status: 'Auction'
    });
    Item.upsert({
        itemID: 3,
        name: "Purple Shoe",
        detail: "It's only a Purple shoe",
        price: "19.90",
        itemPic: "dPurpleShoe.jpg",
        userID: 8
    });
    Item.upsert({
        itemID: 4,
        name: "Red Shoe",
        detail: "It's only a red shoe",
        price: "19.90",
        itemPic: "dRedShoe.jpg",
        userID: 9
    });
    Item.upsert({
        itemID: 5,
        name: "A poster",
        detail: "It's only a poster",
        price: "19.90",
        itemPic: "idk.jpg",
        userID: 10
    });
});

module.exports = sequelize.model('Item', Item);