//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
// Import modules
var passport = require('passport');
var fs = require('fs');
var UserModel = require('../models/user');
var rn = require('random-number');
var cc = require('coupon-code');

var checkCoupons = 0



//set iage file types 
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

exports.list = function (req, res) {
    //List all the products
    sequelize.query("select ProductID, sellerId, u.userId, (select username from Users where userId = w.sellerId) As sellerName,ProductName, ProductImage, ProductPrice, ProductDescription from products w join Users u on w.UserId = u.userID  where w.UserId = " + req.user.userID + " order by sellerId", { model: Product }).then((products) => {
        console.log(products);
        //Random number generator
        var options = {
            min: 0, // 1/10 possibility of getting coupons appearing
            max: 10,
            integer: true
        }
        var random = rn(options) // example outputs → -187, 636
        console.log(random)
        if (random == 7) {
            console.log("Congrates you got a coupon!");
            // generate a 3 part code
            var announce = "Congratulations! You got a Promo Code!"
            var coupons = cc.generate();
        }
        else if (random != 7) {
            console.log("Oops Better luck next time!");
            var coupons = "Oops no coupons for you today!"
            var announce = "Oops better luck next time!"

        }
        else {

        }
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
        var id = req.params.userID;
        UserModel.findById(id).then(function () {
            res.render('shoppingCart', {
                title: 'Cheapo - ' + req.user.username + '\'s Shopping Cart',
                avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                username: req.user.username,
                email: req.user.email,
                userID: req.user.userID,
                dateJoined: req.user.joinDate,
                type: req.user.userType,
                membership: req.user.membership,
                req: req,
                realQuantity: realQuantity,
                coupons: coupons,
                announce: announce,
                products: products,
                total: totalPrice,
                stripeTotal: stripeTotal * 100,
                shippingFee: shippingFee,
                subtotal: subtotal,
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

// Destroy product
exports.delete = function (req, res) {
    var record_num = req.params.ProductID;
    console.log("deleting product " + record_num);
    Product.destroy({ where: { ProductID: record_num } }).then((deleteProduct) => {
        if (!deleteProduct) {
            return res.send(400, {
                message: "Error"
            });
        }
        res.status(200).send({ message: "Deleted Product : " + record_num, price: deleteProduct.ProductPrice });
    });
};