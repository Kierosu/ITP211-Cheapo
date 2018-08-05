var ItemPost = require('../models/itemPost');
var FList = require('../models/friendList');
var Auction = require('../models/auction');
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
        ItemPost.findOne({ where: { id: itemID } }).then((item) => {
            var alertExpAuction = {
                sender: 1,
                receiver: item.sellID,
                title: 'Auction expired',
                message: 'Auction ' + item.name + ' has expired',
                status: ''
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

function mailSoldAuc(aucID, buyerID, price) {
    Auction.findOne({ where: { auctionID: aucID } }).then((auction) => {
        ItemPost.findOne({ where: { id: auction.itemAuctionID } }).then((item) => {
            User.findOne({ where: { userID: buyerID } }).then((user) => {
                var delIdent = aucID + buyerID + item.id + user.username;
                var soldAucSeller = {
                    sender: 1,
                    receiver: item.sellerID,
                    title: 'Auction expired',
                    message: 'Auction, ' + item.title + ' has ended being bought from buyer ' + user.username + ' at $' + price,
                    status: ''
                }
                var soldAucBuyer = {
                    sender: 1,
                    receiver: buyerID,
                    title: 'Auction Won',
                    message: 'You have won Auction, ' + item.title + ' at $' + price + '. You should <a id="sM" onclick="addToCartFromMail(' + buyerID + ',' + item.sellerID + ',' + price + ')" data-title="' + item.title + '" data-iPic="' + item.itemPic + '" style="color:green;" href="#">ADD</a> to cart to claim it.',
                    status: '<p id="hM" data-desc="' + item.prodDesc + '" data-delIdent="' + delIdent + '" class="hiddenMailInfo"></p>',
                    mailExtraF: delIdent
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

function alterOthers(userID, followerID, itemID) {
    User.findOne({ where: { userID: userID } }).then((dUser) => {
        ItemPost.findOne({ where: { id: itemID } }).then((dItem) => {
            var msgFollowers = {
                sender: userID,
                receiver: followerID,
                title: dUser.username + ' has posted a new item',
                message: dUser.username + ' has posted a new item, <a style="color:blue;" href="/itemProduct/' + dItem.id + '">' + dItem.title + '</a>.<br> Thank you for following me!',
                status: ''
            }
            try {
                Mail.create(msgFollowers)
            } catch (err) {
                console.log(err);
            }
        })
    })
}

function alterAucOthers(userID, followerID, itemID) {
    User.findOne({ where: { userID: userID } }).then((dUser) => {
        ItemPost.findOne({ where: { id: itemID } }).then((dItem) => {
            Auction.findOne({ where: { itemAuctionID: itemID } }).then((dauction) => {
                var msgFollowers = {
                    sender: userID,
                    receiver: followerID,
                    title: dUser.username + ' has posted a new Auction',
                    message: dUser.username + ' has posted a new Auction, <a style="color:blue;" href="/auctions/' + dauction.auctionID + '/' + dauction.itemAuctionID + '">' + dItem.title + '</a>.<br> Thank you for following me!',
                    status: ''
                }
                try {
                    Mail.create(msgFollowers)
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
            status: ''
        }
        try {
            Mail.create(newUser)
        } catch (err) {
            console.log(err);
        }
    },
    mailNewItem: (user, itemID) => {
        ItemPost.findOne({ where: { id: itemID } }).then((dItem) => {
            var newItemMail = {
                sender: 1,
                receiver: user,
                title: 'New item posted',
                message: 'You have posted a new item: ' + dItem.title + ' at $' + dItem.price,
                status: ''
            }

            FList.findAll({ where: { following: user }, raw: true }).then((notifyOthers) => {
                for (var i = 0; i < notifyOthers.length; i++) {
                    alterOthers(user, notifyOthers[i].follower, itemID);
                }
            })

            try {
                Mail.create(newItemMail)
            } catch (err) {
                console.log(err);
            }
        })
    },
    newAuction: (user, aucItemID) => {
        ItemPost.findOne({ where: { id: aucItemID } }).then((dItem) => {
            var newAuc = {
                sender: 1,
                receiver: user,
                title: 'New auction posted',
                message: 'You have posted a new auction: ' + dItem.title,
                status: ''
            }

            FList.findAll({ where: { following: user }, raw: true }).then((notifyOthers) => {
                for (var i = 0; i < notifyOthers.length; i++) {
                    alterAucOthers(user, notifyOthers[i].follower, aucItemID);
                }
            })

            try {
                Mail.create(newAuc)
            } catch (err) {
                console.log(err);
            }
        })
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
        ItemPost.findOne({ where: { id: itemId } }).then((item) => {
            if (action == '1/3') {
                var warnUser = {
                    sender: 1,
                    receiver: item.sellerID,
                    title: 'First item warning',
                    message: 'Your item, ' + item.title + ' has been flagged. Please change it. You have 2 more chances',
                    status: ''
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
                    receiver: item.sellerID,
                    title: 'Second item warning',
                    message: 'Your item, ' + item.title + ' has been flagged. Please change it. You have 1 more chances',
                    status: ''
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
                    receiver: item.sellerID,
                    title: 'Third item warning',
                    message: 'Your item, ' + item.title + ' has been suspended',
                    status: ''
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
                    receiver: item.sellerID,
                    title: 'Item Removal',
                    message: 'Your item has been deleted from being flagged to many times',
                    status: ''
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