//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var finalProducts = require('../models/finalProducts');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var passport = require('passport');
var fs = require('fs');
var UserModel = require('../models/user');

exports.show = function (req, res){
    sequelize.query("select finalProductID, finalProductName, finalProductDescription, finalProductPrice, finalProductImage, userID, sellerId, ((select username from Users u where u.userID = fp.userID) As userName) from finalProducts fp inner join Users u on u.userID = fp.userID", { model: finalProducts }).then((finalProducts) => {
    var id = req.params.userID;
    UserModel.findById(id).then(function() {
        res.render('driver', {
            title: "Cheapo - Driver's Page",
            avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
            username : req.user.username,
            email: req.user.email,
            userID: req.user.userID,
            finalProducts: finalProducts,
            dateJoined: req.user.joinDate,
            type: req.user.userType,
            membership: req.user.membership,
            req: req,
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

// // check if user is logged in
// exports.isLoggedIn = function(req, res, next) {
//     if (req.isAuthenticated()){
//         return next();
//     }    
//     res.redirect('/login');
// };
// exports.isLoggedInV2 = function(req,res,next) {
//     if (!req.isAuthenticated()){
//         return next();    
//     }
//     res.redirect('/profile');
// };