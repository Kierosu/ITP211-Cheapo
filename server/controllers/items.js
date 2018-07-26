var Review = require('../models/itemReview');
var { auctionEXP } = require('./sendMails');
var Product = require('../models/products');
var Auction = require('../models/auction');
var Report = require('../models/report');
var Item = require('../models/item');
var database = require('./database');
var User = require('../models/user');
var sequelize = database.sequelize;
var express = require('express');
var auth = require('./profile');
var multer = require('multer');
var router = express.Router();
var path = require('path');
var fs = require('fs');

// Item page
router.get('/', auth.isLoggedIn, auctionEXP, (req, res) => {
    if (req.user.userType === 'Admin') {
        Item.findAll({}).then((item) => {
            Report.findAll({}).then((report) => {
                User.findAll({ where: { userType: 'Member' } }).then((user) => {
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
                            res.render('mainItem', {
                                item: item,
                                report: report,
                                users: user,
                                auction: auction,
                                products: products,
                                total: totalPrice,
                                shippingFee: shippingFee,
                                subtotal: subtotal,
                                realQuantity: realQuantity,
                                msg: req.flash('message')
                            })
                        })
                    })
                })
            })
        })
    } else {
        sequelize.query('select * from Items where userID = ' + req.user.userID, { model: Item }).then((item) => {
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
                    res.render('mainItem', {
                        item: item,
                        auction: auction,
                        products: products,
                        total: totalPrice,
                        shippingFee: shippingFee,
                        subtotal: subtotal,
                        realQuantity: realQuantity,
                        msg: req.flash('message')
                    })
                })
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            });
        })
    }
})

// Add item page
router.get('/add', auth.isLoggedIn, (req, res) => {
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
        res.render('itemsell', {
            products: products,
            total: totalPrice,
            shippingFee: shippingFee,
            subtotal: subtotal,
            realQuantity: realQuantity,
        })
    })
})

// Set storage engine
var storage = multer.diskStorage({
    destination: './public/itemImg/',
    filename: (req, file, cb) => {
        cb(null, req.user.email + '-' + Date.now() + path.extname(file.originalname));
    }
})

// Init upload
var upload = multer({
    storage: storage,
    limits: { fileSize: 150000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('myImage');

// Check file type
function checkFileType(file, cb) {
    // Allow ext
    var filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    var mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only')
    }
}

var { newItem } = require('./sendMails');
// Add item
router.post('/add', auth.isLoggedIn, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('itemSell', {
                message: err
            })
        } else {
            var itemData = {
                name: req.body.itemName,
                detail: req.body.itemDetails,
                price: req.body.itemPrice,
                userID: req.user.userID,
                itemPic: req.file.filename
            }
            Item.create(itemData)
                .then(() => {
                    req.flash('message', 'Item successfully added');
                    res.redirect('/items');
                    newItem(req.user.userID, itemData.name);
                }).catch((err) => {
                    console.log(err);
                    return;
                });
        }
    })
})

// Edit item page
router.get('/edit/:id', auth.isLoggedIn, (req, res) => {
    Item.findOne({ where: { itemID: req.params.id } }).then((item => {
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
            res.render('itemEdit', {
                item: item,
                products: products,
                total: totalPrice,
                shippingFee: shippingFee,
                subtotal: subtotal,
                realQuantity: realQuantity,
            })
        })
    }))
})

// Item edited
router.post('/edit/:id', auth.isLoggedIn, (req, res) => {
    Item.findOne({ where: { itemID: req.params.id } }).then((item => {
        item.name = req.body.name,
            item.detail = req.body.detail,
            item.price = req.body.price;

        item.save().then(() => {
            req.flash('message', 'Item edited successfully'),
                res.redirect('/items')
        })
    }))
})

// Item deleted
router.get('/delete/:id', auth.isLoggedIn, (req, res) => {
    Item.findOne({ where: { itemID: req.params.id } }).then((item) => {
        fs.unlinkSync('C:\\Users\\Matthew\\Desktop\\Merge\\public\\itemImg\\' + item.itemPic);
        sequelize.query('DELETE from Reports WHERE itemID = ' + req.params.id + 'DELETE from Reviews WHERE itemID = ' + req.params.id + 'DELETE from Items WHERE itemID = ' + req.params.id, { model: Item }).then((deleteItem) => {
            req.flash('message', 'Item deleted successfully'),
                res.redirect('/items')
        }).catch((err) => {
            return res.status(400).send({
                message: err
            });
        })
    })
})

// Reactivate item
router.get('/reactivate/:id', auth.isLoggedIn, (req, res) => {
    Item.findOne({ where: { itemID: req.params.id } }).then((item => {
        item.warnings = 'Final';
        item.status = 'Active';
        item.save();
        res.redirect('/items')
    }))
})

// Item details
router.get('/list/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        req.flash('message', 'Item does not exist');
        res.redirect('/')
    } else {
        if (req.user) {
            Item.findOne({ where: { itemID: req.params.id } }).then((item) => {
                if (item) {
                    Review.findAll({ where: { itemID: req.params.id } }).then((review => {
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
                            res.render('productpage', {
                                item: item,
                                review: review,
                                products: products,
                                total: totalPrice,
                                shippingFee: shippingFee,
                                subtotal: subtotal,
                                realQuantity: realQuantity,
                            })
                        })
                    }))
                }
                if (!item) {
                    req.flash('message', 'Item does not exist');
                    res.redirect('/')
                }
            })
        } else {
            Item.findOne({ where: { itemID: req.params.id } }).then((item) => {
                if (item) {
                    Review.findAll({ where: { itemID: req.params.id } }).then((review => {
                        res.render('productpage', {
                            item: item,
                            review: review
                        })
                    }))
                }
                if (!item) {
                    req.flash('message', 'Item does not exist');
                    res.redirect('/')
                }
            })
        }
    }
})

// Auction item page
router.get('/auction/:id', (req, res) => {
    if (req.user) {
        Item.findOne({ where: { itemID: req.params.id } }).then((item => {
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
                res.render('setAuction', {
                    item: item,
                    products: products,
                    total: totalPrice,
                    shippingFee: shippingFee,
                    subtotal: subtotal,
                    realQuantity: realQuantity,
                    msg: req.flash('message')
                })
            })
        }))
    } else {
        Item.findOne({ where: { itemID: req.params.id } }).then((item => {
            res.render('setAuction', {
                item: item,
                msg: req.flash('message')
            })
        }))
    }
})

// Check if auction is past present date
function checkExp(dDate) {
    var now = new Date();
    var utcString = now.toISOString().substring(0, 19);
    var hour = (now.getHours());
    var localDatetime = utcString.substring(0, 11) + (hour < 10 ? "0" + hour : hour) + utcString.substring(13, 19);
    if (dDate > localDatetime) {
        return null;
    } else {
        return !null;
    }
}

// Set auction
var { newAuction } = require('./sendMails');
router.post('/auction/:id', (req, res) => {
    var auctionDetails = {
        itemAuctionID: req.params.id,
        basePrice: req.body.startPrice,
        highestPrice: req.body.startPrice,
        endDate: req.body.endDate
    }
    Auction.findOne({ where: { itemAuctionID: req.params.id } }).then((findAcu) => {
        if (findAcu) {
            req.flash('message', 'Your item already exist in the auction');
            res.redirect('/auctions')
        }

        if (!findAcu) {
            if (checkExp(auctionDetails.endDate) == null) {
                Auction.create(auctionDetails).then(() => {
                    Item.findOne({ where: { itemID: req.params.id } }).then((item => {
                        item.status = 'Auction';
                        item.save().then(() => {
                            newAuction(req.user.userID, item.name);
                            req.flash('message', 'Item Auction successfully');
                            res.redirect('/items')
                        })
                    }))
                }).catch((err) => {
                    console.log(err);
                    return;
                });
            } else {
                req.flash('message', 'Cannot auction past current date');
                res.redirect('/items/auction/' + auctionDetails.itemAuctionID)
            }
        }
    })
})

// Delete auction
var { ifAucExp } = require('./sendMails');
router.get('/canAuction/:id', (req, res) => {
    Auction.findOne({ where: { itemAuctionID: req.params.id } }).then((selectedAuction) => {
        if (selectedAuction.buyerID != null) {
            selectedAuction.endDate = '2017-07-00T07:00:00';
            selectedAuction.save().then(() => {
                ifAucExp(selectedAuction.auctionID, selectedAuction.buyerID, selectedAuction.highestPrice);
                req.flash('message', 'Auction deleted successfully'),
                    res.redirect('/items')
            })
        } else {
            sequelize.query('DELETE from Auctions WHERE itemAuctionID = ' + req.params.id, { model: Auction }).then(() => {
                Item.findOne({ where: { itemID: req.params.id } }).then((item => {
                    item.status = 'Active';
                    item.save().then(() => {
                        req.flash('message', 'Auction deleted successfully'),
                            res.redirect('/items')
                    })
                }))
            }).catch((err) => {
                return res.status(400).send({
                    message: err
                });
            })
        }
    })
})

module.exports = router;