var Product = require('../models/products');
var { auctionEXP } = require('./sendMails');
var Auction = require('../models/auction');
var database = require('./database');
var Item = require('../models/item');
var sequelize = database.sequelize;
var express = require('express');
var auth = require('./profile');
var router = express.Router();

// Show auction page
router.get('/', auctionEXP, (req, res) => {
    if (req.user) {
        Item.findAll({}).then((item) => {
            Auction.findAll({}).then((auction) => {
                sequelize.query("select ProductID, sellerId, u.userId, (select username from Users where userId = w.sellerId) As sellerName,ProductName, ProductImage, ProductPrice, ProductDescription from products w join Users u on w.UserId = u.userID  where w.UserId = " + req.user.userID + " order by sellerId", { model: Product }).then((products) => {
                    //Calculating product total value
                    var totalPrice = 0;
                    var shippingFee = 0;
                    var stripeTotal = 0;
                    var realQuantity = 0;

                    products.forEach(function (rayson) {
                        totalPrice += rayson.ProductPrice;
                        realQuantity += 1;
                    });
                    if (totalPrice > 50) {
                        subtotal = totalPrice;
                        stripeTotal = totalPrice;
                    } else {
                        subtotal = totalPrice;
                        totalPrice += 5.00;
                        shippingFee = 5.00;
                        stripeTotal = totalPrice;
                    }
                    res.render('auctions', {
                        item: item,
                        auction: auction,
                        products: products,
                        total: totalPrice,
                        shippingFee: shippingFee,
                        subtotal: subtotal,
                        realQuantity: realQuantity,
                        msg: req.flash('message')
                    });
                })
            })
        })
    } else {
        Item.findAll({}).then((item) => {
            Auction.findAll({}).then((auction) => {
                res.render('auctions', {
                    item: item,
                    auction: auction,
                    msg: req.flash('message')
                });
            })
        })
    }
})

// Show auction item
router.get('/:aucId/:itemId', (req, res) => {
    if (req.user) {
        Auction.findOne({ where: { auctionID: req.params.aucId, itemAuctionID: req.params.itemId } }).then((auctionExist) => {
            sequelize.query("select ProductID, sellerId, u.userId, (select username from Users where userId = w.sellerId) As sellerName,ProductName, ProductImage, ProductPrice, ProductDescription from products w join Users u on w.UserId = u.userID  where w.UserId = " + req.user.userID + " order by sellerId", { model: Product }).then((products) => {
                //Calculating product total value
                var totalPrice = 0;
                var shippingFee = 0;
                var stripeTotal = 0;
                var realQuantity = 0;

                products.forEach(function (rayson) {
                    totalPrice += rayson.ProductPrice;
                    realQuantity += 1;
                });
                if (totalPrice > 50) {
                    subtotal = totalPrice;
                    stripeTotal = totalPrice;
                } else {
                    subtotal = totalPrice;
                    totalPrice += 5.00;
                    shippingFee = 5.00;
                    stripeTotal = totalPrice;
                }
                if (auctionExist) {
                    Auction.findOne({ where: { auctionID: req.params.aucId } }).then((auction) => {
                        Item.findOne({ where: { itemID: req.params.itemId } }).then((item) => {
                            res.render('auctionItem', {
                                item: item,
                                auction: auction,
                                products: products,
                                total: totalPrice,
                                shippingFee: shippingFee,
                                subtotal: subtotal,
                                realQuantity: realQuantity,
                                msg: req.flash('message')
                            });
                        })
                    })
                }
                if (!auctionExist) {
                    Item.findAll({}).then((item) => {
                        Auction.findAll({}).then((auction) => {
                            req.flash('message', 'Auction does not exist');
                            res.render('auctions', {
                                item: item,
                                auction: auction,
                                products: products,
                                total: totalPrice,
                                shippingFee: shippingFee,
                                subtotal: subtotal,
                                realQuantity: realQuantity,
                                msg: req.flash('message')
                            });
                        })
                    })
                }
            })
        })
    } else {
        Auction.findOne({ where: { auctionID: req.params.aucId, itemAuctionID: req.params.itemId } }).then((auctionExist) => {
            if (auctionExist) {
                Auction.findOne({ where: { auctionID: req.params.aucId } }).then((auction) => {
                    Item.findOne({ where: { itemID: req.params.itemId } }).then((item) => {
                        res.render('auctionItem', {
                            item: item,
                            auction: auction,
                            msg: req.flash('message')
                        });
                    })
                })
            }
            if (!auctionExist) {
                Item.findAll({}).then((item) => {
                    Auction.findAll({}).then((auction) => {
                        req.flash('message', 'Auction does not exist');
                        res.render('auctions', {
                            item: item,
                            auction: auction,
                            msg: req.flash('message')
                        });
                    })
                })
            }
        })
    }
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