//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var passport = require('passport');
var fs = require('fs');
var UserModel = require('../models/user');

exports.show = function (req, res){
    //List all the products
    console.log('Copying tables')
    sequelize.query('SET IDENTITY_INSERT finalProducts ON INSERT INTO finalProducts (finalProductID, finalProductName, finalProductDescription, finalProductPrice, finalProductImage, createdAt, updatedAt) SELECT ProductID, ProductName, ProductDescription, ProductPrice, ProductImage, createdAt, updatedAt FROM products')

    console.log('Dropping Product Table')
    sequelize.query('DELETE FROM products');
    sequelize.query("select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage from products p", {model: Product}).then((products) => { 
        //Calculating product total value
        var totalPrice = 0;
        products.forEach(function(rayson) {
            totalPrice += rayson.ProductPrice;
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
                res.render('done', {
                    title: 'Cheapo - Payment Completed',
                    total: 0,
                    products: products,
                    avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                    username : req.user.username,
                    email: req.user.email,
                    userID: req.user.userID,
                    dateJoined: req.user.joinDate,
                    type: req.user.userType,
                    membership: req.user.membership,
                    req: req,
                    products: products,
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