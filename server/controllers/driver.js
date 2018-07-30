//get gravatar icon from email
var gravatar = require('gravatar');
var finalProducts = require('../models/finalProducts');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var UserModel = require('../models/user');
var driver = require('../models/driverCompleted');

exports.remove = function (req,res){
    var userId = req.body.UserId;
    sequelize.query("SET IDENTITY_INSERT driver off insert into driver(comItemName, comItemDescription, comItemPrice, comItemImage, userID, sellerID) select finalProductName, finalProductDescription, finalProductPrice, finalProductImage, userID, sellerId from finalProducts where userID =" + userId)
    sequelize.query("delete from finalProducts where userID = " + userId);
    res.status(200).send({ message: "Deleted Products"});
}
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
                objectName["Name"] = [];
                objectName["Product"] = [];
                objectName["Image"] = [];
                objectName["IndiPrice"] = [];
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
                    objectName["Name"] = [];
                    objectName["Product"] = [];
                    objectName["Image"] = [];
                    objectName["IndiPrice"] = [];
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
    finalProducts.forEach(function(names){
        //loop to add names
        for (var namelooparray in differentAcc){
            if (names.userID == differentAcc[namelooparray]["UserId"]){
                var objectArray = differentAcc[namelooparray]["Name"]
                objectArray.push(names.dataValues.userName);
                break;
            }
        }
    });

    finalProducts.forEach(function(prod){
        //loop to add products
        for (var prodlooparray in differentAcc){
            if (prod.userID == differentAcc[prodlooparray]["UserId"]){
                var objectArray = differentAcc[prodlooparray]["Product"]
                objectArray.push(prod.finalProductName);
                break;
            }
        }
    });

    finalProducts.forEach(function(img){
        //loop to add products
        for (var imglooparray in differentAcc){
            if (img.userID == differentAcc[imglooparray]["UserId"]){
                var objectArray = differentAcc[imglooparray]["Image"]
                objectArray.push(img.finalProductImage);
                break;
            }
        }
    });

    finalProducts.forEach(function(indi){
        //loop to add indiprice
        for (var indilooparray in differentAcc){
            if (indi.userID == differentAcc[indilooparray]["UserId"]){
                var objectArray = differentAcc[indilooparray]["IndiPrice"]
                objectArray.push(indi.finalProductPrice);
                break;
            }
        }
    });

    differentAcc.forEach(function(test){
        console.log("userid: " + test.UserId);
        console.log("money: " + test.Price);
        console.log("Name: " + test.Name);
        console.log("Indi Product Price: " + test.IndiPrice);
        console.log("Images: " + test.Image)
        console.log("Product: " + test.Product);
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
            differentAcc: differentAcc,
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

//completed page
exports.com = function (req, res){
    sequelize.query("select d.comItemID, d.comItemName, d.comItemDescription, d.comItemPrice, d.comItemImage, d.userID, d.sellerId, (select username from Users where userID = d.userID) As userName from driver d inner join Users u on u.userID = d.userID", { model: driver }).then((driverTable) => {
    //add names and prices and items into array
    
    //storing names, amount and items
    var differentAcc = [];
    var existance = false;

    driverTable.forEach(function(driverTableLoop){
            var nameToCheck = driverTableLoop.dataValues.userName;
            console.log("name: " + nameToCheck)
            if (differentAcc.length <= 0)
            {
                var objectName = {};
                console.log("checking from first:" + driverTableLoop.userID);
                objectName["UserId"] = driverTableLoop.userID;
                objectName["Name"] = [];
                objectName["Product"] = [];
                objectName["Image"] = [];
                objectName["IndiPrice"] = [];
                objectName["Price"] = 0;
                differentAcc.push(objectName);
            }
            else
            {
                for(var uAccIndex in differentAcc)
                {
                    if (driverTableLoop.userID == differentAcc[uAccIndex]["UserId"])
                        existance = true;
                }

                if(!existance)
                {
                    var objectName = {};
                    objectName["UserId"] = driverTableLoop.userID;
                    objectName["Name"] = [];
                    objectName["Product"] = [];
                    objectName["Image"] = [];
                    objectName["IndiPrice"] = [];
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
    driverTable.forEach(function(objIndex){
        for(var uAccIndex in differentAcc){
            if (objIndex.userID == differentAcc[uAccIndex]["UserId"]){
                differentAcc[uAccIndex]["Price"] += parseFloat(objIndex.comItemPrice);
                break;
            }
        }
    });
    driverTable.forEach(function(names){
        //loop to add names
        for (var namelooparray in differentAcc){
            if (names.userID == differentAcc[namelooparray]["UserId"]){
                var objectArray = differentAcc[namelooparray]["Name"]
                objectArray.push(names.dataValues.userName);
                break;
            }
        }
    });

    driverTable.forEach(function(prod){
        //loop to add products
        for (var prodlooparray in differentAcc){
            if (prod.userID == differentAcc[prodlooparray]["UserId"]){
                var objectArray = differentAcc[prodlooparray]["Product"]
                objectArray.push(prod.comItemName);
                break;
            }
        }
    });

    driverTable.forEach(function(img){
        //loop to add products
        for (var imglooparray in differentAcc){
            if (img.userID == differentAcc[imglooparray]["UserId"]){
                var objectArray = differentAcc[imglooparray]["Image"]
                objectArray.push(img.comItemImage);
                break;
            }
        }
    });

    driverTable.forEach(function(indi){
        //loop to add indiprice
        for (var indilooparray in differentAcc){
            if (indi.userID == differentAcc[indilooparray]["UserId"]){
                var objectArray = differentAcc[indilooparray]["IndiPrice"]
                objectArray.push(indi.comItemPrice);
                break;
            }
        }
    });

    differentAcc.forEach(function(test){
        console.log("userid: " + test.UserId);
        console.log("money: " + test.Price);
        console.log("Name: " + test.Name);
        console.log("Indi Product Price: " + test.IndiPrice);
        console.log("Product: " + test.Product);
    })
    var id = req.params.userID;
    UserModel.findById(id).then(function() {
        res.render('driverComplete', {
            title: "Cheapo - Driver's Page",
            avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
            username : req.user.username,
            email: req.user.email,
            userID: req.user.userID,
            driverTable: driverTable,
            differentAcc: differentAcc,
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
// check if user is logged in
exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }    
    res.redirect('/login');
};
exports.isLoggedInV2 = function(req,res,next) {
    if (!req.isAuthenticated()){
        return next();    
    }
    res.redirect('/profile');
};