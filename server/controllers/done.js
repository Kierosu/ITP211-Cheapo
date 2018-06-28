//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var myDatabase = require('../../public/js/database');
var sequelize = myDatabase.sequelize;

//List Comments
exports.show = function (req, res){
    //List all products and sort by date
    console.log('Copying tables')
    sequelize.query('SET IDENTITY_INSERT finalProducts ON INSERT INTO finalProducts (finalProductID, finalProductName, finalProductDescription, finalProductPrice, finalProductImage, createdAt, updatedAt) SELECT ProductID, ProductName, ProductDescription, ProductPrice, ProductImage, createdAt, updatedAt FROM products')

    console.log('Dropping Product Table')
    sequelize.query('DELETE FROM products');
    sequelize.query('select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage from products p', { model: Product}).then((products) => {


        res.render('done', {
            title: 'Cheapo - Payment Completed',
            total: 0,
            products: products,
            gravatar: gravatar.url({ s: '80', r: 'x', d: 'retro'}, true),
            urlPath: req.protocol + "://" + req.get('host') + req.url,
            req: req
        })
    }).catch((err)=>{
        return res.status(400).send({
            message: err
        });
    });
};