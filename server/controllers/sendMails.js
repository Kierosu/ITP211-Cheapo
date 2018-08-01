var Product = require('../models/products');
var Auction = require('../models/auction');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var Item = require('../models/item');
var Mail = require('../models/mail');
var User = require('../models/user');

function timeNow() {
    var now = new Date();
    var utcString = now.toISOString().substring(0, 19);
    var hour = (now.getHours());
    var localDatetime = utcString.substring(0, 11) + (hour < 10 ? "0" + hour : hour) + utcString.substring(13, 19);
    return localDatetime;
}

function mailExpAuc(auctionID, itemID) {
    Auction.destroy({ where: { auctionID: auctionID } }).then(() => {
        Item.findOne({ where: { itemID: itemID } }).then((item) => {
            var alertExpAuction = {
                sender: 1,
                receiver: item.userID,
                title: 'Auction expired',
                message: 'Auction ' + item.name + ' has expired',
                status: 'notSeen'
            }
            try {
                item.status = 'Active';
                item.save();
                Mail.create(alertExpAuction);
                console.log('An act has expired')
            } catch (err) {
                console.log(err);
            }
        })
    })
}

function mailSoldAuc(aucID, buyerID, price) {
    Auction.findOne({ where: { auctionID: aucID } }).then((auction) => {
        Item.findOne({ where: { itemID: auction.itemAuctionID } }).then((item) => {
            User.findOne({ where: { userID: buyerID } }).then((user) => {
                var soldAucSeller = {
                    sender: 1,
                    receiver: item.userID,
                    title: 'Auction expired',
                    message: 'Auction, ' + item.name + ' has ended being bought from buyer, ' + user.username + ' at $' + price,
                    status: 'notSeen'
                }
                var soldAucBuyer = {
                    sender: 1,
                    receiver: buyerID,
                    title: 'Auction Won',
                    message: 'You have won Auction, ' + item.name + ' . Please click the following link to pay $' + price + ' to complete the auction. <br><a style="color:green;" href="#">Click ME</a>',
                    status: 'notSeen'
                }
                try {
                    Mail.create(soldAucSeller);
                    Mail.create(soldAucBuyer);
                    auction.destroy();
                    item.destroy();
                } catch (err) {
                    console.log(err);
                }
            })
        })
    })
}

module.exports = {
    newAccount: (user) => {
        var newUser = {
            sender: 1,
            receiver: user,
            title: 'Welcome',
            message: 'Welcome to Cheapo, where we home cheapos',
            status: 'notSeen'
        }
        try {
            Mail.create(newUser)
        } catch (err) {
            console.log(err);
        }
    },
    newItem: (user, item) => {
        var newItemMail = {
            sender: 1,
            receiver: user,
            title: 'New item posted',
            message: 'You have posted a new item: ' + item,
            status: 'notSeen'
        }
        try {
            Mail.create(newItemMail)
        } catch (err) {
            console.log(err);
        }
    },
    newAuction: (user, auctionName) => {
        var newAuc = {
            sender: 1,
            receiver: user,
            title: 'New auction posted',
            message: 'You have posted a new auction: ' + auctionName,
            status: 'notSeen'
        }
        try {
            Mail.create(newAuc)
        } catch (err) {
            console.log(err);
        }
    },
    auctionEXP: (req, res, next) => {
        Auction.findAll({ where: { endDate: { lte: timeNow() } }, raw: true }).then((expAuc) => {
            for (var i = 0; i < expAuc.length; i++) {
                if (expAuc[i].buyerID == null) {
                    mailExpAuc(expAuc[i].auctionID, expAuc[i].itemAuctionID);
                } else {
                    mailSoldAuc(expAuc[i].auctionID, expAuc[i].buyerID, expAuc[i].highestPrice);
                }
            }
        })
        return next();
    },
    itemWarnings: (itemId, action) => {
        Item.findOne({ where: { itemID: itemId } }).then((item) => {
            if (action == '1/3') {
                var warnUser = {
                    sender: 1,
                    receiver: item.userID,
                    title: 'First item warning',
                    message: 'Your item, ' + item.name + ' has been flagged. Please change it. You have 2 more chances',
                    status: 'notSeen'
                }
                try {
                    Mail.create(warnUser)
                } catch (err) {
                    console.log(err);
                }
            }

            if (action == '2/3') {
                var warnUser = {
                    sender: 1,
                    receiver: item.userID,
                    title: 'Second item warning',
                    message: 'Your item, ' + item.name + ' has been flagged. Please change it. You have 1 more chances',
                    status: 'notSeen'
                }
                try {
                    Mail.create(warnUser)
                } catch (err) {
                    console.log(err);
                }
            }

            if (action == 'sus') {
                var warnUser = {
                    sender: 1,
                    receiver: item.userID,
                    title: 'Third item warning',
                    message: 'Your item, ' + item.name + ' has been suspended',
                    status: 'notSeen'
                }
                try {
                    Mail.create(warnUser)
                } catch (err) {
                    console.log(err);
                }
            }

            if (action == 'deleteItem') {
                var warnUser = {
                    sender: 1,
                    receiver: item.userID,
                    title: 'First item warning',
                    message: 'Your item, ' + item.name + ' has been deleted from being flagged to many times',
                    status: 'notSeen'
                }
                try {
                    Mail.create(warnUser)
                } catch (err) {
                    console.log(err);
                }
            }
        })
    },
    ifAucExp: (aucID, aucBuyer, aucPrice) => {
        mailSoldAuc(aucID, aucBuyer, aucPrice);
    }
};