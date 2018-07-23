//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var wishList = require('../models/wishList');
var Product = require('../models/products');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var passport = require('passport');
var fs = require('fs');
var UserModel = require('../models/user');
var parseDecimalNumber = require('parse-decimal-number');

//Destroy wish list items
// Destroy product
exports.delete = function (req, res) {
    var record_num = req.params.ProductID;
    console.log("deleting product " + record_num);
    wishList.destroy({ where: { ProductID: record_num } }).then((deleteProduct) => {
        if (!deleteProduct){
            return res.send(400, {
                message: "Error"
            });
        }
        res.status(200).send({ message: "Deleted Product : " + record_num});
    })
}

// Insert data into wish List
exports.addItems = function (req, res){
    console.log("wishlist add working! with values")
    var addShop = {
        UserId: req.body.UserId,
        ProductName: req.body.ProductName,
        ProductDescription: req.body.ProductDescription,
        ProductPrice: parseFloat(req.body.ProductPrice),
        sellerId: req.body.sellerId,
        ProductImage: req.body.ProductImage
    }
    console.log(addShop);
    Product.create(addShop).then((newRecord, created) => {
        if (!newRecord) {
            return res.send (400, {
                message: "error"
            });
        }
        res.status(200).send({ message: "Uploaded To Shopping Cart" + newRecord});
    });
};

exports.show = function (req, res){
    //List all the products
    sequelize.query("select ProductID, sellerId, u.userId, (select username from Users where userId = w.sellerId) As sellerName,ProductName, ProductImage, ProductPrice, ProductDescription from wishList w join Users u on w.UserId = u.userID  where w.UserId = " + req.user.userID + " order by sellerId", {model: wishList}).then((wishList) => { 
        console.log(wishList);
        wishList.forEach(function(wishlist){
            console.log(wishlist.dataValues.sellerName)
        });
        var id = req.params.userID;
        UserModel.findById(id).then(function() {
            res.render('wishList', {
                title: 'Cheapo - '+ req.user.username + '\'s Wish List',
                avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                username : req.user.username,
                email: req.user.email,
                userID: req.user.userID,
                dateJoined: req.user.joinDate,
                type: req.user.userType,
                membership: req.user.membership,
                req: req,
                wishlist: wishList,
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