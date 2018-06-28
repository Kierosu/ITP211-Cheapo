//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var wishList = require('../models/wishList');
var myDatabase = require('../../public/js/database');
var sequelize = myDatabase.sequelize;
var parseDecimalNumber = require('parse-decimal-number');
var fs = require('fs');
var mime = require('mime');
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

//Image upload

// Insert data into shopping cart
exports.insert = function (req, res){
    var products = {
        ProductName: req.body.ProductName,
        ProductPrice: parseDecimalNumber(req.body.ProductPrice),
        ProductDescription: req.body.ProductDescription,
        ProductImage: req.body.ProductImage
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
        ProductName: req.body.macbookName,
        ProductPrice: parseDecimalNumber(req.body.macbookPrice2),
        ProductDescription: "",
    }
    wishList.create(wishlist).then((newRecord, created) => {
        if (!newRecord) {
            return res.send (400, {
                message: "error"
            });
        }
        res.redirect("/wishlist")
    });
};

//List Comments
exports.show = function (req, res){
    //List all products and sort by date
    sequelize.query('select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage from products p', { model: Product}).then((products) => {
        
        //Calculating product total value
        var totalPrice = 0;
        var shippingFee = 0;
        var stripeTotal = 0;
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
        res.render('itemDescrip', {
            title: 'Cheapo - Item Name',
            products: products,
            total: totalPrice,
            stripeTotal: stripeTotal * 100,
            shippingFee: shippingFee,
            subtotal: subtotal,
            gravatar: gravatar.url({ s: '80', r: 'x', d: 'retro'}, true),
            urlPath: req.protocol + "://" + req.get('host') + req.url,
            hostPath: req.protocol + "://" + req.get("host")
        })
    }).catch((err)=>{
        return res.status(400).send({
            message: err
        });
    });
};