//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var passport = require('passport');
var fs = require('fs');
var UserModel = require('../models/user');
var Product = require('../models/products');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var url = require('url');
const http = require('http');
var io = require('../../app');
var ioCheck = io.ioExports;
var EventEmitter = require('events').EventEmitter;
var eventExample = new EventEmitter;

// Answer from bank 
exports.answer = function (req, res) {
        res.send("Received the request!");
        console.log(req.body.data.status)
        console.log(req.body.data.userId)
        console.log(userIIDD) // needed to fix as req.user.userID is undefined. need to lead pending before sending data from bank
        if (req.body.data.status == "accept" && userIIDD == req.body.data.userId)
        {
            console.log("accepted the data")
            var text = "Bank Verified Please Wait...";
            eventExample.emit('text', text);
            //To trigger an event listener you must emit:
            var someData = "/done";
            eventExample.emit('anEvent', someData);
        }
        else if (req.body.data.status == "reject" && userIIDD == req.body.data.userId)
        {
            console.log("rejected the data")
            var text = "Bank Rejected Payment! Redirecting back to checkout page...";
            eventExample.emit('text', text);
            var someData = "/checkout";
            eventExample.emit('anEvent', someData);
        }
}

exports.show = function (req, res){
    //List all the products
    sequelize.query("select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage, p.UserId from products p left outer join Users u on p.UserId = u.userID where p.UserId = " + req.user.userID, {model: Product}).then((products) => {   
    //Calculating product total value
        ioCheck.on('connection', function (socket) {
            console.log("really connected!");
            eventExample.on('anEvent', function(someData){
                console.log("working");
                //Do something with someData
                console.log(someData);
                socket.emit('redirect', someData);
            });
        });

        ioCheck.on('connection', function (socket) {
            eventExample.on('text', function(text){
                console.log("text working");
                //Do something with someData
                console.log(text);
                socket.emit('status', text);
            });
        });
        var totalPrice = 0;
        var shippingFee = 0;
        var stripeTotal = 0;
        var realQuantity = 0;

        products.forEach(function(rayson) {
            totalPrice += rayson.ProductPrice;
            realQuantity += 1;
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
        if (subtotal != 0 )
        {
            console.log(req.flash('info'));
            var id = req.params.userID;
            console.log(req.user.userID)
            global.userIIDD = req.user.userID;
            UserModel.findById(id).then(function() {
                res.render('pending', {
                    title: 'Cheapo - Pending Request',
                    avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                    username : req.user.username,
                    email: req.user.email,
                    userID: req.user.userID,
                    dateJoined: req.user.joinDate,
                    type: req.user.userType,
                    membership: req.user.membership,
                    req: req,
                    realQuantity: realQuantity,
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
        }
        else
        {
            res.redirect("/shopping-cart");
        }
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