var ItemPost = require('../models/itemPost');
var { auctionEXP } = require('./sendMails');
var { raysonCart } = require('./otherFunc');
var Auction = require('../models/auction');
var express = require('express');
var auth = require('./profile');
var router = express.Router();

// Show auction page
router.get('/', auctionEXP, (req, res) => {
    if (req.user) {
        ItemPost.findAll({}).then((itemPost) => {
            Auction.findAll({}).then((auction) => {
                raysonCart(req.user).then((obj) => {
                    res.render('auctions', {
                        itemPost: itemPost,
                        auction: auction,
                        products: obj.products,
                        total: obj.total,
                        shippingFee: obj.shippingFee,
                        subtotal: obj.subtotal,
                        realQuantity: obj.realQuantity,
                        msg: req.flash('message')
                    });
                })
            })
        })
    } else {
        ItemPost.findAll({}).then((itemPost) => {
            Auction.findAll({}).then((auction) => {
                res.render('auctions', {
                    itemPost: itemPost,
                    auction: auction,
                    msg: req.flash('message')
                });
            })
        })
    }
})

// Show auction item
router.get('/:aucId/:itemId', (req, res) => {
    if (isNaN(req.params.aucId)) {
        req.flash('message', 'Auction does not exist');
        res.redirect('/auctions');
    } else {
        if (req.user) {
            Auction.findOne({ where: { auctionID: req.params.aucId, itemAuctionID: req.params.itemId } }).then((auctionExist) => {
                raysonCart(req.user).then((obj) => {
                    if (auctionExist) {
                        Auction.findOne({ where: { auctionID: req.params.aucId } }).then((auction) => {
                            ItemPost.findOne({ where: { id: req.params.itemId } }).then((itemPost) => {
                                res.render('auctionItem', {
                                    item: itemPost,
                                    auction: auction,
                                    products: obj.products,
                                    total: obj.total,
                                    shippingFee: obj.shippingFee,
                                    subtotal: obj.subtotal,
                                    realQuantity: obj.realQuantity,
                                    msg: req.flash('message')
                                });
                            })
                        })
                    }
                    if (!auctionExist) {
                        req.flash('message', 'Auction does not exist');
                        res.redirect('/auctions');
                    }
                })
            })
        } else {
            Auction.findOne({ where: { auctionID: req.params.aucId, itemAuctionID: req.params.itemId } }).then((auctionExist) => {
                if (auctionExist) {
                    Auction.findOne({ where: { auctionID: req.params.aucId } }).then((auction) => {
                        ItemPost.findOne({ where: { id: req.params.itemId } }).then((itemPost) => {
                            res.render('auctionItem', {
                                item: itemPost,
                                auction: auction,
                                msg: req.flash('message')
                            });
                        })
                    })
                }
                if (!auctionExist) {
                    req.flash('message', 'Auction does not exist');
                    res.redirect('/auctions');
                }
            })
        }
    }
})

// Bid auction
router.post('/:aucId/:itemId', auth.isLoggedIn, (req, res) => {
    Auction.findOne({ where: { auctionID: req.params.aucId } }).then((auction) => {
        ItemPost.findOne({ where: { id: req.params.itemId } }).then((itemPost) => {
            if (itemPost.sellerID == req.user.userID) {
                req.flash('message', 'Unable to bid your own items');
                res.redirect('/auctions/' + req.params.aucId + '/' + req.params.id);
            } else {
                if (req.body.aucInput < auction.highestPrice) {
                    req.flash('message', 'Please bid higher than the current bid: $' + auction.highestPrice);
                    res.redirect('/auctions/' + req.params.aucId + '/' + req.params.itemId);
                }
                if (req.body.aucInput > auction.highestPrice) {
                    auction.highestPrice = req.body.aucInput;
                    auction.buyerID = req.user.userID;
                    auction.save().then(() => {
                        req.flash('message', 'Item bid successfully');
                        res.redirect('/auctions/' + req.params.aucId + '/' + req.params.itemId);
                    })
                }
            }
        })
    })
})

module.exports = router;