//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var CardDetails = require('../models/cardDetails');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;


//Insert Card Data Into database
exports.insert = function (req, res) {

    var cardDetails = {
        cardName: req.body.cardName,
        cardNumber: req.body.cardNumber,
        expiryDate: req.body.expiryDate,
        verification: req.body.verification,
        shippingAddress: req.body.shippingAddress,
        blockUnit: req.body.blockUnit
    }
    CardDetails.create(cardDetails).then((newRecord, created) => {
        if (!newRecord) {
            return res.send (400, {
                message: "error"
            });
        }
        res.status(200).send({ message: "Uploaded Card Details" + newRecord });
    })
}
//List Comments
exports.show = function (req, res){
    //List all products and sort by date
    sequelize.query('select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage from products p', { model: Product}).then((products) => {
        
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
            res.render('checkOut', {
                title: 'Cheapo - Checkout',
                products: products,
                total: totalPrice,
                stripeTotal: stripeTotal * 100,
                shippingFee: shippingFee,
                subtotal: subtotal,
                gravatar: gravatar.url({ s: '80', r: 'x', d: 'retro'}, true),
                hostPath: req.protocol + "://" + req.get("host"),
                urlPath: req.protocol + "://" + req.get('host') + req.url,
                req: req
        })
        } else {
            console.log('Cart Empty!')
            // req.flash('info', 'Welcome');
            res.redirect('/shopping-cart');
        }
     }).catch((err)=>{
        return res.status(400).send({
            message: err
        });
    });
};