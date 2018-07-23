//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var finalProduct = require('../models/finalProducts');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var geoip = require('geoip-lite');
var passport = require('passport');
var fs = require('fs');
var UserModel = require('../models/user');
var io = require('../../app');
var ioCheck = io.ioExports;
var EventEmitter = require('events').EventEmitter;
var eventExample = new EventEmitter;





exports.feedback = function (req,res){

    var realTotalPrice = 0
    var allObjects = [];

    
    sequelize.query("select finalProductID, sellerId, u.userId, (select username from Users where userId = pd.sellerId) As sellerName,finalProductName, finalProductImage, finalProductPrice, finalProductDescription from finalProducts pd join Users u on pd.UserID = u.userID  where pd.UserID = " + req.user.userID + " order by sellerId", {model: finalProduct}).then((finalproductsName) => { 
            finalproductsName.forEach(function(test){
                var objectTemplate = {};
                //if (req.user.userID == test.userId){
                    objectTemplate["SellerName"] = test.dataValues.sellerName;
                    objectTemplate["Money"] = test.finalProductPrice;
                    allObjects.push(objectTemplate);
                //}
                    
            })
            var sellerMoney = allObjects;
            for (var index in allObjects)
                console.log("Checking items in allObjects " + allObjects[index]["SellerName"]);
            eventExample.emit('price', sellerMoney);
        });
        
        //add code to put the total price to the database


        res.status(200).send({ message: "Successfully released money of " + realTotalPrice + " to seller!"})
    }
exports.show = function (req, res){
    //List all the products
    sequelize.query("select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage, p.UserId from products p left outer join Users u on p.UserId = u.userID where p.UserId = " + req.user.userID, {model: Product}).then((products) => {     
        //sending money socket io
        ioCheck.on('connection', function (socket) {
            console.log("MoneyLoader connected!");
            eventExample.on('price', function(sellerMoney){
                console.log("Money received");
                //Do something with someData
                console.log(sellerMoney[0]);
                socket.emit('receiveMoney', sellerMoney);
            });
        });
        
        //Ip to lon and lat
        var ip = "183.90.37.120";
        var geo = geoip.lookup(ip);
        geoip.startWatchingDataUpdate();

        console.log(geo);
        var myLatitude = parseFloat(geo.ll[0]);
        var myLongitude = parseFloat(geo.ll[1]);
        var myCity = geo.city;

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
            res.render('orderTracking', {
                title: 'Cheapo - Track Your Orders',
                avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                username : req.user.username,
                email: req.user.email,
                userID: req.user.userID,
                dateJoined: req.user.joinDate,
                type: req.user.userType,
                membership: req.user.membership,
                req: req,
                myCity: myCity,
                myLatitude: myLatitude,
                myLongitude: myLongitude,
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