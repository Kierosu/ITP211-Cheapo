//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var myDatabase = require('../../public/js/database');
var sequelize = myDatabase.sequelize;
// Import modules
var fs = require('fs');
var mime = require('mime');

//set iage file types 
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

// var Images = require('../models/')

//List Comments
exports.list = function (req, res){
    //List all products and sort by date
    sequelize.query('select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice , p.ProductImage from products p', { model: Product}).then((products) => {
        
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
            shippingFee = 5.00;
        }
        res.render('shoppingCart.ejs', {
            title: 'Cheapo - Shopping-Cart',
            products: products,
            total: totalPrice,
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

// Destroy product
exports.delete = function (req, res) {
    var record_num = req.params.ProductID;
    console.log("deleting product " + record_num);
    Product.destroy({ where: { ProductID: record_num } }).then((deleteProduct) => {
        if (!deleteProduct){
            return res.send(400, {
                message: "Error"
            });
        }
        res.status(200).send({ message: "Deleted Product : " + record_num});
    })
}