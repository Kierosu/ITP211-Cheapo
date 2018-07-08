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

exports.show = function (req, res){
    //List all the products
    sequelize.query("select w.ProductId, sellerId, w.ProductImage, w.ProductPrice, w.ProductDescription from wishList w left outer join Users u on w.UserId = u.userID  where w.UserId = " + req.user.userID + "group by w.sellerId, u.userId", {model: wishList}).then((wishList) => { 
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