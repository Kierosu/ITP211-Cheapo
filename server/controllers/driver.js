//get gravatar icon from email
var gravatar = require('gravatar');
var finalProducts = require('../models/finalProducts');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var UserModel = require('../models/user');

exports.show = function (req, res){
    sequelize.query("select fp.finalProductID, fp.finalProductName, fp.finalProductDescription, fp.finalProductPrice, fp.finalProductImage, fp.userID, fp.sellerId, (select username from Users where userID = fp.userID) As userName from finalProducts fp inner join Users u on u.userID = fp.userID", { model: finalProducts }).then((finalProducts) => {
    //add names and prices and items into array
    
    //storing names, amount and items
    var differentAcc = [];
    var existance = false;

    finalProducts.forEach(function(finalProductsLoop){
            var nameToCheck = finalProductsLoop.dataValues.userName;
            console.log("name: " + nameToCheck)
            if (differentAcc.length <= 0)
            {
                var objectName = {};
                console.log("checking from first:" + finalProductsLoop.userID);
                objectName["UserId"] = finalProductsLoop.userID;
                objectName["Name"] = "";
                objectName["Product"] = [];
                objectName["Price"] = 0;
                differentAcc.push(objectName);
            }
            else
            {
                for(var uAccIndex in differentAcc)
                {
                    if (finalProductsLoop.userID == differentAcc[uAccIndex]["UserId"])
                        existance = true;
                }

                if(!existance)
                {
                    var objectName = {};
                    objectName["UserId"] = finalProductsLoop.userID;
                    objectName["Name"] = "";
                    objectName["Product"] = [];
                    objectName["Price"] = 0;
                    differentAcc.push(objectName);
                }
                else
                {
                    existance = false;
                }
            }
    });
    // adding price together
    finalProducts.forEach(function(objIndex){
        for(var uAccIndex in differentAcc){
            if (objIndex.userID == differentAcc[uAccIndex]["UserId"]){
                differentAcc[uAccIndex]["Price"] += objIndex.finalProductPrice;
                break;
            }
        }
    });
    finalProducts.forEach(function(finalProductsLoop){
        //loop to add names and products
    });

    differentAcc.forEach(function(test){
        console.log("userid: " + test.UserId)
        console.log("money: " + test.Price)
    })
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