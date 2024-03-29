//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var passport = require('passport');
var fs = require('fs');
var UserModel = require('../models/user');
var Product = require('../models/products');
var finalProducts = require('../models/finalProducts');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var nodemailer = require("nodemailer");

// Password generator
var randomstring = Math.random().toString(36).slice(-8);

//Nodemailer
let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 25,
    secure: false,
    auth: {
        user: "TheCheapoOnline@gmail.com",
        pass: "cheapo123"
    },
    tls: {
        rejectUnauthorized: false
    }
});
// SET IDENTITY_INSERT finalProducts ON
// Copy data from products to finalProducts
exports.show = function (req, res) {
    //List all the products
    sequelize.query("select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage, p.UserId from products p left outer join Users u on p.UserId = u.userID where p.UserId = " + req.user.userID, { model: Product }).then((products) => {
        // Password generator
        var array = [];
        var randomstring = Math.random().toString(36).slice(-8);
        array.push(randomstring);

        // Genrate Email
        
        sequelize.query("select email from Users where UserID =" + req.user.userID, {model: UserModel}).then((test) => { 
            var myEmail = ""
            test.forEach(function(findingEmail){
                console.log(findingEmail.dataValues.email);
                myEmail = findingEmail.dataValues.email;
            });
            console.log(myEmail);
            let HelperOptions = {
            from: '"Cheapo Online Shop" <TheCheapoOnline@gmail.com>',
            to: myEmail,
            subject: "Cheapo's OTP",
            text: "OTP is: " + randomstring
        };
        transporter.sendMail(HelperOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log("The message is sent!");
                console.log(info);
            }
        });
        });
        //Calculating product total value
        var realQuantity = 0;
        var totalPrice = 0;
        var shippingFee = 0;
        var stripeTotal = 0;
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
        if (subtotal != 0) {
            var id = req.params.userID;
            UserModel.findById(id).then(function () {
                res.render('confirmation', {
                    title: 'Cheapo - Confirmation',
                    avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                    username: req.user.username,
                    email: req.user.email,
                    userID: req.user.userID,
                    dateJoined: req.user.joinDate,
                    type: req.user.userType,
                    membership: req.user.membership,
                    req: req,
                    products: products,
                    total: totalPrice,
                    realQuantity: realQuantity,
                    onePassword: array,
                    stripeTotal: stripeTotal * 100,
                    shippingFee: shippingFee,
                    subtotal: subtotal,
                    hostPath: req.protocol + "://" + req.get("host"),
                    urlPath: req.protocol + "://" + req.get('host') + req.url
                });
            }).catch((err) => {
                return res.status(400).send({
                    message: err
                });
            });
        }
        else {
            res.redirect("/shopping-cart");
        }
    });
};

// check if user is logged in
exports.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};
exports.isLoggedInV2 = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/profile');
};