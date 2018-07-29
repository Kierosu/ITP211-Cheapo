const Product = require('../models/products');
const myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

module.exports = {
    raysonCart: (user) => {
        var cart = "a";
        var totalPrice = 0;
        var shippingFee = 0;
        var stripeTotal = 0;
        var realQuantity = 0;
        var obj;
        return sequelize.query("select ProductID, sellerId, u.userId, (select username from Users where userId = w.sellerId) As sellerName,ProductName, ProductImage, ProductPrice, ProductDescription from products w join Users u on w.UserId = u.userID  where w.UserId = " + user.userID + " order by sellerId", { model: Product }).then((products) => {
            //Calculating product total value
            products.forEach(function (rayson) {
                totalPrice += rayson.ProductPrice;
                realQuantity += 1;
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
            obj = {
                products: products,
                total: totalPrice,
                shippingFee: shippingFee,
                subtotal: subtotal,
                realQuantity: realQuantity,
            }
            return(obj)
        });
    }
}