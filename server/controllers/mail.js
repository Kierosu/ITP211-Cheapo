var { auctionEXP } = require('./sendMails');
var { raysonCart } = require('./otherFunc');
var Product = require('../models/products');
var Flist = require('../models/friendList');
var Mail = require('../models/mail');
var User = require('../models/user');
var database = require('./database');
var sequelize = database.sequelize;
var express = require('express');
var auth = require('./profile');
var router = express.Router();

router.get('/', auth.isLoggedIn, auctionEXP, (req, res) => {
    raysonCart(req.user).then((obj) => {
        Mail.findAll({ where: { receiver: req.user.userID } }).then((mail) => {
            User.findAll({}).then((user) => {
                Flist.findAll({ where: { follower: req.user.userID } }).then((following) => {
                    Flist.findAll({ where: { following: req.user.userID } }).then((follower) => {
                        res.render("mail", {
                            following: following,
                            follower: follower,
                            mail: mail,
                            user: user,
                            products: obj.products,
                            total: obj.total,
                            shippingFee: obj.shippingFee,
                            subtotal: obj.subtotal,
                            realQuantity: obj.realQuantity,
                            msg: req.flash('message')
                        });
                    })
                })
            })
        })
    })
})

router.post('/deleteMail', auth.isLoggedIn, (req, res) => {
    Mail.destroy({ where: { mailID: req.body.mailID } }).then(() => {
        Mail.findAll({ where: { receiver: req.user.userID } }).then((mail) => {
            User.findAll({}).then((user) => {
                res.render('test', {
                    mail: mail,
                    user: user
                });
            })
        })
    })
})

router.post('/social/:id', (req, res) => {
    var socialMailInfo = {
        sender: req.user.userID,
        receiver: req.params.id,
        title: 'New mail!',
        message: req.body.mailInfo,
        status: 'notSeen'
    }
    try {
        Mail.create(socialMailInfo).then(() => {
            req.flash('message', 'Item successfully added');
            res.redirect('/mail');
        })
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;