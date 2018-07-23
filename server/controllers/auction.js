var { auctionEXP } = require('./sendMails');
var Auction = require('../models/auction');
var Item = require('../models/item');
var auth = require('./profile');
var express = require('express');
var router = express.Router();

// Show auction page
router.get('/', auctionEXP, (req, res) => {
    Item.findAll({}).then((item) => {
        Auction.findAll({}).then((auction) => {
            res.render('auctions', {
                item: item,
                auction: auction,
                msg: req.flash('message')
            });
        })
    })
})

// Show auction item
router.get('/:aucId/:itemId', (req, res) => {
    Auction.findOne({ where: { auctionID: req.params.aucId } }).then((auction) => {
        Item.findOne({ where: { itemID: req.params.itemId } }).then((item) => {
            res.render('auctionItem', {
                item: item,
                auction: auction,
                msg: req.flash('message')
            });
        })
    })
})

// Bid auction
router.post('/:aucId/:itemId', auth.isLoggedIn, (req, res) => {
    Auction.findOne({ where: { auctionID: req.params.aucId } }).then((auction) => {
        Item.findOne({ where: { itemID: req.params.itemId } }).then((item) => {
            if (item.userID == req.user.userID) {
                req.flash('message', 'Unable to bid your own items');
                res.render('auctionItem', {
                    item: item,
                    auction: auction,
                    msg: req.flash('message')
                });
            } else {
                if (req.body.aucInput < auction.highestPrice) {
                    req.flash('message', 'Please bid higher than the current bid: $' + auction.highestPrice);
                    res.render('auctionItem', {
                        item: item,
                        auction: auction,
                        msg: req.flash('message')
                    });
                }
                if (req.body.aucInput > auction.highestPrice) {
                    auction.highestPrice = req.body.aucInput;
                    auction.buyerID = req.user.userID;
                    auction.save().then(() => {
                        req.flash('message', 'Item bid successfully');
                        res.render('auctionItem', {
                            item: item,
                            auction: auction,
                            msg: req.flash('message')
                        });
                    })
                }
            }
        })
    })
})

module.exports = router;