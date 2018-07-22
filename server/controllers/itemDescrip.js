  //get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var wishList = require('../models/wishList');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var parseDecimalNumber = require('parse-decimal-number');
var passport = require('passport');
var fs = require('fs');
var UserModel = require('../models/user');

// Insert data into shopping cart
exports.insert = function (req, res){
    var products = {
        UserId: req.body.UserId,
        ProductName: req.body.ProductName,
        ProductPrice: parseDecimalNumber(req.body.ProductPrice),
        ProductDescription: req.body.ProductDescription,
        ProductImage: req.body.ProductImage,
        sellerId: req.body.sellerId
    }
    Product.create(products).then((newRecord, created) => {
        if (!newRecord) {
            return res.send (400, {
                message: "error"
            });
        }
        res.status(200).send({ message: "Uploaded Product Details" + newRecord});
    });
};

// Insert data into wish List
exports.add = function (req, res){
    var wishlist = {
        UserId: req.body.UserId,
        ProductName: req.body.ProductName,
        ProductPrice: parseDecimalNumber(req.body.ProductPrice),
        ProductDescription: req.body.ProductDescription,
        ProductImage: req.body.ProductImage,
        sellerId: req.body.sellerId
    }
    wishList.create(wishlist).then((newRecord, created) => {
        if (!newRecord) {
            return res.send (400, {
                message: "error"
            });
        }
        res.status(200).send({ message: "Uploaded Product Details" + newRecord});
    });
};
exports.show = function (req, res){
    //List all the products
    sequelize.query("select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage, p.UserId from products p left outer join Users u on p.UserId = u.userID where p.UserId = " + req.user.userID, {model: Product}).then((products) => { 
    //Calculating product total value
        var totalPrice = 0;
        var shippingFee = 0;
        var stripeTotal = 0;
        var realQuantity = 0;
        products.forEach(function(rayson) {
            totalPrice += rayson.ProductPrice;
            realQuantity += 1;
        });
        if (totalPrice >50){
            subtotal = totalPrice;
            stripeTotal = totalPrice;
        } else{
            subtotal = totalPrice;
            totalPrice += 5.00;
            shippingFee = 5.00;
            stripeTotal = totalPrice;
        }
        var id = req.params.userID;
        UserModel.findById(id).then(function() {
            res.render('itemDescrip', {
                title: 'Cheapo - <Item Name Here>',
                avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                username : req.user.username,
                email: req.user.email,
                userID: req.user.userID,
                dateJoined: req.user.joinDate,
                type: req.user.userType,
                membership: req.user.membership,
                req: req,
                products: products,
                realQuantity: realQuantity,
                total: totalPrice,
                stripeTotal: stripeTotal * 100,
                shippingFee: shippingFee,
                subtotal: subtotal,
                gravatar: gravatar.url({ s: '80', r: 'x', d: 'retro'}, true),
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