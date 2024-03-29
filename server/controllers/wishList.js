//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var wishList = require('../models/wishList');
var Product = require('../models/products');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var passport = require('passport');
var UserModel = require('../models/user');

//Destroy wish list items
// Destroy product
exports.delete = function (req, res) {
    var record_num = req.params.ProductID;
    console.log("deleting product " + record_num);
    wishList.destroy({ where: { ProductID: record_num } }).then((deleteProduct) => {
        if (!deleteProduct) {
            return res.send(400, {
                message: "Error"
            });
        }
        res.status(200).send({ message: "Deleted Product : " + record_num });
    })
}

// Insert data into wish List
exports.addItems = function (req, res) {
    console.log("wishlist add working! with values")
    sequelize.query("select ProductID, sellerId, w.UserId, (select username from Users where userId = w.sellerId) As sellerName,ProductName, ProductImage, ProductPrice, ProductDescription from wishList w join Users u on w.UserId = u.userID  where w.UserId = " + req.user.userID + " order by sellerId", { model: wishList }).then((wishList) => {
        var record_num = req.params.ProductID;
        wishList.forEach(function(wishlist){
            if (wishlist.ProductID == record_num)
            {
                var addShop = {
                    UserId: wishlist.UserId,
                    ProductName: wishlist.ProductName,
                    ProductDescription: wishlist.ProductDescription,
                    ProductPrice: parseFloat(wishlist.ProductPrice),
                    sellerId: wishlist.sellerId,
                    ProductImage: wishlist.ProductImage
                }
                console.log(addShop);
                Product.create(addShop).then((newRecord, created) => {
                    if (!newRecord) {
                        return res.send(400, {
                            message: "error"
                        });
                    }
                    res.status(200).send({ message: "Uploaded To Shopping Cart" + newRecord });
                });
            }
            else
            {
                console.log("upload error!")
            }
        })
    });
};

exports.show = function (req, res) {
    //List all the products
    sequelize.query("select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage, p.UserId from products p left outer join Users u on p.UserId = u.userID where p.UserId = " + req.user.userID, { model: Product }).then((products) => {
        sequelize.query("select ProductID, sellerId, u.userId, (select username from Users where userId = w.sellerId) As sellerName,ProductName, ProductImage, ProductPrice, ProductDescription from wishList w join Users u on w.UserId = u.userID  where w.UserId = " + req.user.userID + " order by sellerId", { model: wishList }).then((wishList) => {
            console.log(wishList);
            wishList.forEach(function (wishlist) {
                console.log(wishlist.dataValues.sellerName)
            });
            console.log("testt" + wishList);
            for (var i = 0; i < wishList.length; i++)
            {
                console.log("wishwish" + wishList[i].ProductID) 
            }
            //Calculating product total value
            var totalPrice = 0;
            var shippingFee = 0;
            var stripeTotal = 0;
            var realQuantity = 0;
            products.forEach(function (rayson) {
                totalPrice += rayson.ProductPrice;
                realQuantity += 1
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
            var id = req.params.userID;
            UserModel.findById(id).then(function () {
                res.render('wishList', {
                    title: 'Cheapo - ' + req.user.username + '\'s Wish List',
                    avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                    username: req.user.username,
                    email: req.user.email,
                    userID: req.user.userID,
                    dateJoined: req.user.joinDate,
                    type: req.user.userType,
                    membership: req.user.membership,
                    req: req,
                    realQuantity: realQuantity,
                    products: products,
                    total: totalPrice,
                    query: "",
                    wishlist: wishList,
                    stripeTotal: stripeTotal * 100,
                    shippingFee: shippingFee,
                    subtotal: subtotal,
                    gravatar: gravatar.url({ s: '80', r: 'x', d: 'retro' }, true),
                    hostPath: req.protocol + "://" + req.get("host"),
                    urlPath: req.protocol + "://" + req.get('host') + req.url
                });
            }).catch((err) => {
                return res.status(400).send({
                    message: err
                });
            });
        });
    });
};