//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var passport = require('passport');
var fs = require('fs');
var UserModel = require('../models/user');

exports.show = function (req, res) {
    //List all the products
    console.log('Copying tables')
    sequelize.query('SET IDENTITY_INSERT finalProducts OFF INSERT INTO finalProducts (finalProductName, finalProductDescription, finalProductPrice, finalProductImage, userID, sellerId, createdAt, updatedAt) SELECT ProductName, ProductDescription, ProductPrice, ProductImage, UserId, sellerId, createdAt, updatedAt FROM products where UserId = ' + req.user.userID)
    console.log('Deleting Product Table')
    sequelize.query("delete from products where UserId = " + req.user.userID);
    sequelize.query("select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage, p.UserId from products p left outer join Users u on p.UserId = u.userID where p.UserId = " + req.user.userID, { model: Product }).then((products) => {
        //Calculating product total value
        var totalPrice = 0;
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
        var id = req.params.userID;
        UserModel.findById(id).then(function () {
            res.render('done', {
                title: 'Cheapo - Payment Completed',
                total: 0,
                products: products,
                avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                username: req.user.username,
                email: req.user.email,
                userID: req.user.userID,
                realQuantity: realQuantity,
                dateJoined: req.user.joinDate,
                type: req.user.userType,
                membership: req.user.membership,
                req: req,
                products: products,
                gravatar: gravatar.url({ s: '80', r: 'x', d: 'retro' }, true),
                hostPath: req.protocol + "://" + req.get("host"),
                urlPath: req.protocol + "://" + req.get('host') + req.url
            });
        }).catch((err) => {
            return res.status(400).send({
                message: err
            });
        });
    });
};

// check if user is logged in
exports.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};
exports.isLoggedInV2 = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/profile');
};