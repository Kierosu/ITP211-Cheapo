var { auctionEXP } = require('./sendMails');
var Product = require('../models/products');
var Mail = require('../models/mail');
var User = require('../models/user');
var database = require('./database');
var sequelize = database.sequelize;
var express = require('express');
var auth = require('./profile');
var router = express.Router();

router.get('/', auth.isLoggedIn, auctionEXP, (req, res) => {
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
        Mail.findAll({ where: { receiver: req.user.userID } }).then((mail) => {
            User.findAll({}).then((user) => {
                res.render("mail", {
                    mail: mail,
                    user: user,
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
})

router.post('/deleteMail', auth.isLoggedIn, (req, res) => {
    Mail.destroy({ where: { mailID: req.body.mailID } }).then(() => {
        Mail.findAll({ where: { receiver: req.user.userID } }).then((mail) => {
            User.findAll({}).then((user) => {
                res.render('test', {
                    mail: mail,
                    user: user
                });
            })
        })
    })
})

module.exports = router;