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

//set iage file types 
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

exports.list = function (req, res){
    //List all the products
    sequelize.query("select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage from products p", {model: Product}).then((products) => { 
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
        var id = req.params.userID;
        UserModel.findById(id).then(function() {
            res.render('shoppingCart', {
                title: 'Cheapo - '+ req.user.username + '\'s Shopping Cart',
                avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                username : req.user.username,
                email: req.user.email,
                userID: req.user.userID,
                dateJoined: req.user.joinDate,
                type: req.user.userType,
                membership: req.user.membership,
                req: req,
                products: products,
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

// Destroy product
exports.delete = function (req, res) {
    var record_num = req.params.ProductID;
    console.log("deleting product " + record_num);
    Product.destroy({ where: { ProductID: record_num } }).then((deleteProduct) => {
        if (!deleteProduct){
            return res.send(400, {
                message: "Error"
            });
        }
        res.status(200).send({ message: "Deleted Product : " + record_num});
    })
}