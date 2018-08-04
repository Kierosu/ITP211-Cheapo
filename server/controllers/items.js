var Review = require('../models/itemReview');
var ItemPost = require('../models/itemPost');
var { auctionEXP } = require('./sendMails');
var { raysonCart } = require('./otherFunc');
var Auction = require('../models/auction');
var Report = require('../models/report');
var Item = require('../models/item');
var database = require('./database');
var User = require('../models/user');
var sequelize = database.sequelize;
var bcrypt = require('bcryptjs');
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
                        raysonCart(req.user).then((obj) => {
                            res.render('mainItem', {
                                item: item,
                                report: report,
                                users: user,
                                auction: auction,
                                products: obj.products,
                                total: obj.totalPrice,
                                shippingFee: obj.shippingFee,
                                subtotal: obj.subtotal,
                                realQuantity: obj.realQuantity,
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
                raysonCart(req.user).then((obj) => {
                    res.render('mainItem', {
                        item: item,
                        auction: auction,
                        products: obj.products,
                        total: obj.totalPrice,
                        shippingFee: obj.shippingFee,
                        subtotal: obj.subtotal,
                        realQuantity: obj.realQuantity,
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
    raysonCart(req.user).then((obj) => {
        res.render('itemsell', {
            products: obj.products,
            total: obj.totalPrice,
            shippingFee: obj.shippingFee,
            subtotal: obj.subtotal,
            realQuantity: obj.realQuantity
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
        raysonCart(req.user).then((obj) => {
            if (req.user.userType === 'Admin') {
                res.render('itemEdit', {
                    item: item,
                    products: obj.products,
                    total: obj.total,
                    shippingFee: obj.shippingFee,
                    subtotal: obj.subtotal,
                    realQuantity: obj.realQuantity
                })
            } else {
                if (item.userID == req.user.userID) {
                    res.render('itemEdit', {
                        item: item,
                        products: obj.products,
                        total: obj.total,
                        shippingFee: obj.shippingFee,
                        subtotal: obj.subtotal,
                        realQuantity: obj.realQuantity
                    })
                } else {
                    res.redirect('/items');
                }
            }
        })
    }))
})

// Item edited
router.post('/edit/:id', auth.isLoggedIn, (req, res) => {
    Item.findOne({ where: { itemID: req.params.id } }).then((item => {
        if (req.user.userType === 'Admin') {
            item.name = req.body.name,
                item.detail = req.body.detail,
                item.price = req.body.price;
            item.save().then(() => {
                req.flash('message', 'Item edited successfully'),
                    res.redirect('/items')
            })
        } else {
            if (item.userID == req.user.userID) {
                item.name = req.body.name,
                    item.detail = req.body.detail,
                    item.price = req.body.price;
                item.save().then(() => {
                    req.flash('message', 'Item edited successfully'),
                        res.redirect('/items')
                })
            } else {
                res.redirect('/items');
            }
        }
    }))
})

// Item deleted
router.get('/delete/:id', auth.isLoggedIn, (req, res) => {
    Item.findOne({ where: { itemID: req.params.id } }).then((item) => {
        if (req.user.userType === 'Admin') {
            fs.unlinkSync('C:\\Users\\Matthew\\Documents\\GitHub\\ITP211-Cheapo\\public\\itemImg\\' + item.itemPic);
            sequelize.query('DELETE from Reports WHERE itemID = ' + req.params.id + 'DELETE from Reviews WHERE itemID = ' + req.params.id + 'DELETE from Items WHERE itemID = ' + req.params.id, { model: Item }).then((deleteItem) => {
                req.flash('message', 'Item deleted successfully'),
                    res.redirect('/items')
            }).catch((err) => {
                return res.status(400).send({
                    message: err
                });
            })
        } else {
            if (item.userID == req.user.userID) {
                fs.unlinkSync('C:\\Users\\Matthew\\Desktop\\Merge\\public\\itemImg\\' + item.itemPic);
                sequelize.query('DELETE from Reports WHERE itemID = ' + req.params.id + 'DELETE from Reviews WHERE itemID = ' + req.params.id + 'DELETE from Items WHERE itemID = ' + req.params.id, { model: Item }).then((deleteItem) => {
                    req.flash('message', 'Item deleted successfully'),
                        res.redirect('/items')
                }).catch((err) => {
                    return res.status(400).send({
                        message: err
                    });
                })
            } else {
                res.redirect('/items');
            }
        }
    })
})

// Reactivate item
router.get('/reactivate/:id', auth.isLoggedIn, (req, res) => {
    ItemPost.findOne({ where: { id: req.params.id } }).then((item => {
        item.warnings = 'Final';
        item.status = 'Active';
        item.save();
        res.redirect('/userItems')
    }))
})

// Auction item page
router.get('/auction/:id', auth.isLoggedIn, (req, res) => {
    ItemPost.findOne({ where: { id: req.params.id } }).then((item => {
        raysonCart(req.user).then((obj) => {
            if (req.user.userType === 'Admin') {
                res.render('setAuction', {
                    item: item,
                    products: obj.products,
                    total: obj.total,
                    shippingFee: obj.shippingFee,
                    subtotal: obj.subtotal,
                    realQuantity: obj.realQuantity,
                    msg: req.flash('message')
                })
            } else {
                if (item.sellerID == req.user.userID) {
                    res.render('setAuction', {
                        item: item,
                        products: obj.products,
                        total: obj.total,
                        shippingFee: obj.shippingFee,
                        subtotal: obj.subtotal,
                        realQuantity: obj.realQuantity,
                        msg: req.flash('message')
                    })
                } else {
                    res.redirect('/userItems')
                }
            }
        })
    }))
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
router.post('/auction/:id', auth.isLoggedIn, (req, res) => {
    var auctionDetails = {
        itemAuctionID: req.params.id,
        basePrice: req.body.startPrice,
        highestPrice: req.body.startPrice,
        endDate: req.body.endDate
    }
    Auction.findOne({ where: { itemAuctionID: req.params.id } }).then((findAcu) => {
        if (findAcu) {
            req.flash('message', 'Your item already exist in the auction');
            res.redirect('/userItems')
        }

        if (!findAcu) {
            if (checkExp(auctionDetails.endDate) == null) {
                Auction.create(auctionDetails).then(() => {
                    ItemPost.findOne({ where: { id: req.params.id } }).then((item => {
                        item.status = 'Auction';
                        item.save().then(() => {
                            newAuction(req.user.userID, item.id);
                            req.flash('message', 'Item Auction successfully');
                            res.redirect('/userItems')
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
router.get('/canAuction/:id', auth.isLoggedIn, (req, res) => {
    Auction.findOne({ where: { itemAuctionID: req.params.id } }).then((selectedAuction) => {
        if (selectedAuction.buyerID != null) {
            selectedAuction.endDate = '2017-07-00T07:00:00';
            selectedAuction.save().then(() => {
                ifAucExp(selectedAuction.auctionID, selectedAuction.buyerID, selectedAuction.highestPrice);
                req.flash('message', 'Auction deleted successfully'),
                    res.redirect('/userItems')
            })
        } else {
            sequelize.query('DELETE from Auctions WHERE itemAuctionID = ' + req.params.id, { model: Auction }).then(() => {
                ItemPost.findOne({ where: { id: req.params.id } }).then((item => {
                    item.status = 'Active';
                    item.save().then(() => {
                        req.flash('message', 'Auction deleted successfully'),
                            res.redirect('/userItems')
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

router.get('/userAdd', auth.isLoggedIn, (req, res) => {
    raysonCart(req.user).then((obj) => {
        if (req.user.userType === 'Admin') {
            res.render('addUser', {
                products: obj.products,
                total: obj.total,
                shippingFee: obj.shippingFee,
                subtotal: obj.subtotal,
                realQuantity: obj.realQuantity,
                msg: req.flash('message')
            })
        } else {
            res.redirect('/items')
        }
    })
})

router.post('/addUser', auth.isLoggedIn, (req, res) => {
    var userInfo = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        userType: req.body.uType
    }
    if (req.user.userType === 'Admin') {
        if (userInfo.password == req.body.cfmPassword) {
            User.findOne({ where: { email: userInfo.email } }).then((user) => {
                if (user) {
                    req.flash('message', 'Email is already registered')
                    res.redirect('/items/userAdd');
                } else {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(userInfo.password, salt, (err, hash) => {
                            if (err) throw err;
                            userInfo.password = hash;
                            User.create(userInfo)
                                .then(() => {
                                    req.flash('message', 'Account registered successfully');
                                    res.redirect('/userItems');
                                }).catch((err) => {
                                    console.log(err);
                                    return;
                                });
                        })
                    })
                }
            })
        } else {
            req.flash('message', 'Password does not match')
            res.redirect('/items/userAdd');
        }
    } else {
        res.redirect('/items')
    }
})

router.get('/editUser/:id', auth.isLoggedIn, (req, res) => {
    raysonCart(req.user).then((obj) => {
        if (req.user.userType === 'Admin') {
            User.findOne({ where: { userID: req.params.id } }).then((user) => {
                res.render('editUser', {
                    user: user,
                    products: obj.products,
                    total: obj.total,
                    shippingFee: obj.shippingFee,
                    subtotal: obj.subtotal,
                    realQuantity: obj.realQuantity,
                    msg: req.flash('message')
                })
            })
        } else {
            res.redirect('/userItems');
        }
    })
})

router.post('/editUser/:id', auth.isLoggedIn, (req, res) => {
    if (req.user.userType === 'Admin') {
        User.findOne({ where: { userID: req.params.id } }).then((user) => {
            if (req.body.password == '' & req.body.passwordCMF == '') {
                user.username = req.body.username;
                user.email = req.body.email;
                user.save().then(() => {
                    req.flash('message', 'User edited successfully');
                    res.redirect('/userItems');
                })
            } else {
                if (req.body.password != req.body.passwordCMF) {
                    req.flash('message', 'Passwords does not match'),
                        res.redirect('/items/editUser/' + req.params.id);
                    console.log(req.body.password + ' ' + req.body.passwordCMF)
                } else {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                            if (err) throw err;
                            user.username = req.body.username;
                            user.email = req.body.email;
                            user.password = hash;
                            user.save().then(() => {
                                req.flash('message', 'User edited successfully');
                                res.redirect('/userItems');
                            }).catch((err) => {
                                console.log(err);
                                return;
                            });
                        })
                    })
                    console.log(req.body.password + ' ' + req.body.passwordCMF)
                }
            }
        })
    } else {
        res.redirect('/userItems')
    }
})

router.get('/deleteUser/:id', auth.isLoggedIn, (req, res) => {
    if (req.user.userType === 'Admin') {
        User.destroy({ where: { userID: req.params.id } })
        req.flash('message', 'User removed successfully');
        res.redirect('/userItems')
    } else {
        res.redirect('/userItems')
    }
})

module.exports = router;