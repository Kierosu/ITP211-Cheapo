//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var myDatabase = require('../../public/js/database');
var sequelize = myDatabase.sequelize;
var geoip = require('geoip-lite');

//List Comments
exports.show = function (req, res){
    //List all products and sort by date
    sequelize.query('select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage from products p', { model: Product}).then((products) => {
        
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
        res.render('orderTracking', {
            title: 'Cheapo - Track Your Orders',
            products: products,
            total: totalPrice,
            myCity: myCity,
            myLatitude: myLatitude,
            myLongitude: myLongitude,
            stripeTotal: stripeTotal * 100,
            shippingFee: shippingFee,
            subtotal: subtotal,
            gravatar: gravatar.url({ s: '80', r: 'x', d: 'retro'}, true),
            urlPath: req.protocol + "://" + req.get('host') + req.url
        })
     }).catch((err)=>{
        return res.status(400).send({
            message: err
        });
    });
};