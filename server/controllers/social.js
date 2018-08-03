var { auctionEXP } = require('./sendMails');
var { raysonCart } = require('./otherFunc');
var Product = require('../models/products');
var Mail = require('../models/mail');
var User = require('../models/user');
var database = require('./database');
var sequelize = database.sequelize;
var express = require('express');
var auth = require('./profile');
var router = express.Router();

router.get('/', auth.isLoggedIn, (req, res) => {
    raysonCart(req.user).then((obj) => {
        res.render('social', {
            products: obj.products,
            total: obj.totalPrice,
            shippingFee: obj.shippingFee,
            subtotal: obj.subtotal,
            realQuantity: obj.realQuantity,
        })
    })
})

module.exports = router;