
// Import modules
var fs = require('fs');
var mime = require('mime');
// set image file types
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

var itemPostModel = require('../models/itemPost');

var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

exports.list = function(req, res) {
    
    sequelize.query('select id, itemPic, title, price, brand, prodDesc from itemPosts', {model: itemPostModel}).then((itemPost) => {
            res.render('itemPosted', {
                title: 'Images Gallery',
                itemPost: itemPost,
                req: req,
                urlPath: req.protocol + "://" + req.get("host") + req.url,
            });

            }).catch ((err) => {
        return res.status(400).send({
            message: err
        });        
    }); 
};

