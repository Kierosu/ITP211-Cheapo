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
const http = require('http');
const url = require('url');

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

        sequelize.query("select CardID from cardDetails cd left outer join Users u on cd.UserId = u.userID where cd.UserId = " + req.user.userID, {model: CardDetails}).then((card) => {   
            card.forEach(function(i, idx, CardData){
                if (idx === CardData.length - 1)
                {
                    var finalInt = parseInt(idx) + 1 //getting last cardid index
                    var realCard = (i.CardID) + 1; //getting last cardid
                    global.realCard = realCard
                }
            });
            var cardDetailsVer2 = {
                cardName: req.body.cardName,
                userID: req.body.userID,
                cardId: realCard,
                cardNumber: req.body.cardNumber,
                expiryDate: req.body.expiryDate,
                verification: req.body.verification,
                shippingAddress: req.body.shippingAddress,
                cardType: payform.parseCardType(req.body.cardNumber),
                blockUnit: req.body.blockUnit
            }
            
            console.log(cardDetailsVer2);

            var postData = JSON.stringify({ user: cardDetailsVer2 });
    
            const options = {
                hostname: 'localhost',
                port: 3001,
                path: '/bank',
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'accept': 'application/json'
                }
            };
    
            const httpreq = http.request(options, (res) => {
                res.setEncoding('utf8');
                res.on('data', (chuck) => {
                    console.log(`BODY: ${chuck}`);
                });
                res.on('end', () => {
                    console.log('No more data in response.');
                });
            });
    
            httpreq.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            })
    
            //write data to request body
            httpreq.write(postData);
            httpreq.end();
        });
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
        var realQuantity = 0;
        
        products.forEach(function(rayson) {
            totalPrice += rayson.ProductPrice;
            realQuantity += 1
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
                    realQuantity: realQuantity,
                    message: req.flash('info'),
                    products: products,
                    total: totalPrice,
                    query: "",
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