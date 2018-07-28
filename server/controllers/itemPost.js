// Import modules
var fs = require('fs');
var mime = require('mime');
// set image file types
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// get itemPost model
var itemPostModel = require('../models/itemPost');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var UserModel = require('../models/user');

exports.list = function(req, res) {
    
    sequelize.query('select id, itemPic, title, price, brand, prodDesc, ownerName, sellerID from itemPosts', {model: itemPostModel}).then((itemPost) => {
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

exports.show = function(req, res) {
    
    sequelize.query('select id, itemPic, title, price, brand, prodDesc, ownerName, sellerID from itemPosts', {model: itemPostModel}).then((itemPost) => {
            res.render('userItems', {
                title: 'Images Gallery',
                itemPost: itemPost,
                urlPath: req.protocol + "://" + req.get("host") + req.url,
            });

            }).catch ((err) => {
        return res.status(400).send({
            message: err
        });        
    }); 
};

// Add new item record to database
exports.create = function (req, res) {
    console.log("creating items")
    var src;
    var dest;
    var targetPath;
    var targetName;
    var tempPath = req.file.path;
    console.log(req.file);
    // get the mime type of the file
    var type = (req.file.mimetype);
    // get file extension
    var extension = req.file.path.split(/[. ]+/).pop();
    // check support file types
    if (IMAGE_TYPES.indexOf(type) == -1) {
        return res.status(415).send('Supported image formats: jpeg, jpg, jpe, png.');
    }
    // Set new path to images
    targetPath = './public/images/' + req.file.originalname;
    // using read stream API to read file
    src = fs.createReadStream(tempPath);
    // using a write stream API to write file
    dest = fs.createWriteStream(targetPath);
    src.pipe(dest);

// Save file process
src.on('end', function () {
    // create a new instance of the Images model with request body
    var itemPostData = {
        itemPic: req.file.originalname,
        title: req.body.title,
        price: req.body.price,
        brand: req.body.brand,
        prodDesc: req.body.prodDesc,
        ownerName: req.body.ownerName,
        sellerID: req.user.userID
    }

    // Save to database
    itemPostModel.create(itemPostData).then((newItem, created) => {
        if (!newItem) {
            return res.send(400, {
                message: "error"
            });
        }
        res.redirect('notificate');
        })
    });
};

// delete item from database
exports.delete = function (req, res) {
    var item_num = req.params.item_id;
    console.log("deleting items" + item_num);
    itemPostModel.destroy ({ where: {id: item_num}}).then((deletedItem) => {
        if (!deletedItem) {
            return res.send(400, {
                message: "error"
            });
        }
        res.status(200).send({message: "Deleted Items: " + item_num});
    })
}

exports.showitem = function(req, res) {
    var idCheck = req.params.imageId   
    console.log("Viewing " + idCheck);
    itemPostModel.findOne({ where: {id: idCheck}}).then(productDetails => {
        var id = req.params.userID;
        UserModel.findById(id).then(function() {
            res.render("itemProduct", {
                ownerName: productDetails.ownerName,
                productImage: productDetails.itemPic,
                productTitle: productDetails.title,
                productPrice: productDetails.price,
                productBrand: productDetails.brand,
                productDesc: productDetails.prodDesc,
                avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                username : req.user.username,
                email: req.user.email,
                userID: req.user.userID,
                sellerID: productDetails.sellerID,
                dateJoined: req.user.joinDate,
                type: req.user.userType,
                membership: req.user.membership,
                req: req,
                hostPath: req.protocol + "://" + req.get("host"),
            });
        }).catch((err) => {
            return res.status(400).send({
                message: err
            });
        });
    });
};

// List one specific student record from database
exports.editProduct = function (req, res) {
    var record_num = req.params.id;
    itemPostModel.findById(record_num).then(function (itemRecord) {
        res.render('editProduct', {
            title: "Practical 5 Database Node JS - Edit Student Record",
            item: itemRecord,
            hostPath: req.protocol + "://" + req.get("host")
        });
    }).catch ((err) => {
        return res.status(400).send({
            message: err
        });
});
};

// Update student record in database
exports.update = function (req, res) {
    var record_num = req.params.id;
    var updateData = {
        title : req.body.title,
        price: req.body.price,
        brand: req.body.brand,
        prodDesc: req.body.prodDesc
    }
    itemPostModel.update(updateData, { where: { id: record_num } }).then((updatedProducts) => {
        if (!updatedProducts || updatedProducts == 0) {
            return res.send(400, {
                message: "error"
            });
        }
        res.status(200).send({ message: "Updated student record: " + record_num });
    })
}

    // // remove from temp folder
    // fs.unlink(tempPath, function (err) {
    //     if (err) {
    //         return res.status(500).send('Something bad happened here');
    //     }
    //     // Redirect to gallery's page
    //     res.redirect('itemPosted');
    // });
