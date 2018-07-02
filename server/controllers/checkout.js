//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var passport = require('passport');
var fs = require('fs');
var UserModel = require('../models/user');
var Product = require('../models/products');
var CardDetails = require('../models/cardDetails');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var payform = require('payform'); 


//Insert Card Data Into database
exports.insert = function (req, res) {
    var cardNoValidation = payform.validateCardNumber(req.body.cardNumber);
    var date = req.body.expiryDate;
    var month = date[0] + date[1];
    var year = date[3] + date[4];
    var cardValidateExpiry = payform.validateCardExpiry(month, year);
    var cvcValidation = payform.validateCardCVC(req.body.verification);
    if (cardNoValidation == true && cardValidateExpiry == true && cvcValidation == true)
    {
        var cardDetails = {
            cardName: req.body.cardName,
            userID: req.body.userID,
            cardNumber: req.body.cardNumber,
            expiryDate: req.body.expiryDate,
            verification: req.body.verification,
            shippingAddress: req.body.shippingAddress,
            cardType: payform.parseCardType(req.body.cardNumber),
            blockUnit: req.body.blockUnit
        }
        console.log(cardDetails);
        CardDetails.create(cardDetails).then((newRecord, created) => {
            if (!newRecord) {
                return res.send (400, {
                    message: "error"
                });
            }
            res.status(200).send({ message: "Uploaded Card Details" + newRecord });
        })
    }
    else if (cardNoValidation == false)
    {
        console.log("Wrong card number");
        res.redirect('/checkout');
        // res.status(200).send( { message: 'Wrong Card Number!' } );
    }
    else if (cardValidateExpiry == false)
    {
        console.log("Wrong Expiry Date Entered!")
        res.redirect('/checkout');
        // res.status(200).send( { message: 'Wrong Expiry Date Entered!' } );
    }
    else if (cvcValidation == false)
    {
        console.log("Wrong CVC entered!")
        res.redirect('/checkout');
        // res.status(200).send( { message: 'Wrong CVC entered' } );
    }
}
exports.show = function (req, res){
    //List all the products
    sequelize.query("select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage, p.UserId from products p left outer join Users u on p.UserId = u.userID where p.UserId = " + req.user.userID, {model: Product}).then((products) => {   
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
        if (subtotal != 0 )
        {
            console.log(req.flash('info'));
            var id = req.params.userID;
            UserModel.findById(id).then(function() {
                res.render('checkOut', {
                    title: 'Cheapo - ' + req.user.username + '\'s Profile',
                    avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                    username : req.user.username,
                    email: req.user.email,
                    userID: req.user.userID,
                    dateJoined: req.user.joinDate,
                    type: req.user.userType,
                    membership: req.user.membership,
                    req: req,
                    message: req.flash('info'),
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