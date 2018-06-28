//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var finalProducts = require('../models/finalProducts');
var myDatabase = require('../../public/js/database');
var sequelize = myDatabase.sequelize;
var nodemailer = require("nodemailer");

// Password generator
var randomstring = Math.random().toString(36).slice(-8);

//Nodemailer
let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 25,
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

//List Comments
exports.show = function (req, res){
    //List all products and sort by date
    sequelize.query('select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage from products p', { model: Product}).then((products) => {
        // Password generator
        var array = [];
        var randomstring = Math.random().toString(36).slice(-8);
        array.push(randomstring);

        // Genrate Email
        let HelperOptions = {
            from: '"Cheapo Online Shop" <TheCheapoOnline@gmail.com>',
            to: "raysonkira@gmail.com",
            subject: "Cheapo's OTP",
            text: "OTP is: " + randomstring
        };
        transporter.sendMail(HelperOptions, (error, info) =>{
            if (error){
                console.log(error);
            }
            else{
            console.log("The message is sent!");
            console.log(info);
            }
        });

        //Calculating product total value
        var totalPrice = 0;
        var shippingFee = 0;
        products.forEach(function(rayson) {
            totalPrice += rayson.ProductPrice;
        });
        if (totalPrice >50){
            subtotal = totalPrice;
        } else{
            subtotal = totalPrice;
            totalPrice += 5.00;
        }
        res.render('confirmation', {
            title: 'Cheapo - Confirm Your Payment',
            products: products,
            onePassword: array,
            total: totalPrice,
            gravatar: gravatar.url({ s: '80', r: 'x', d: 'retro'}, true),
            urlPath: req.protocol + "://" + req.get('host') + req.url
        })
    }).catch((err)=>{
        return res.status(400).send({
            message: err
        });
    });
};