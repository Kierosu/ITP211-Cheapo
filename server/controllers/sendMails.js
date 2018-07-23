var Auction = require('../models/auction');
var Item = require('../models/item');
var Mail = require('../models/mail');

var now = new Date();
var utcString = now.toISOString().substring(0, 19);
var hour = (now.getHours());
var localDatetime = utcString.substring(0, 11) + (hour < 10 ? "0" + hour : hour) + utcString.substring(13, 19);

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
            } catch (err) {
                console.log(err);
            }
        })
    })
}

module.exports = {
    newAccount:(user)=>{
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
        Auction.findAll({ where: { endDate: { lte: localDatetime } }, raw: true }).then((expAuc) => {
            for (var i = 0; i < expAuc.length; i++) {
                mailExpAuc(expAuc[i].auctionID, expAuc[i].itemAuctionID)
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
                    message: 'Your item,  has been flagged. Please change it. You have 2 more chances',
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
                    title: 'First item warning',
                    message: 'Your item,  has been flagged. Please change it. You have 1 more chances',
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
                    title: 'First item warning',
                    message: 'Your item,  has been suspended',
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
                    message: 'Your item,  has been deleted from being flagged to many times',
                    status: 'notSeen'
                }
                try {
                    Mail.create(warnUser)
                } catch (err) {
                    console.log(err);
                }
            }
        })
    }
};