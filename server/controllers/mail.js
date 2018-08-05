var { auctionEXP } = require('./sendMails');
var { raysonCart } = require('./otherFunc');
var Flist = require('../models/friendList');
var Mail = require('../models/mail');
var User = require('../models/user');
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
                            hostPath: req.protocol + "://" + req.get("host"),
                            msg: req.flash('message')
                        });
                    })
                })
            })
        })
    })
})

router.get('/delAucMail/:id', auth.isLoggedIn, (req, res) => {
    Mail.destroy({ where: { mailExtraF: req.params.id } }).then(() => {
        req.flash('message', 'Item successfully added to cart');
        res.redirect('/mail');
    })
})

router.post('/social/:id', (req, res) => {
    User.findOne({ where: { userID: req.user.userID } }).then((user) => {
        var socialMailInfo = {
            sender: req.user.userID,
            receiver: req.params.id,
            title: 'New mail from ' + user.username,
            message: req.body.mailInfo,
            status: 'notSeen'
        }
        try {
            Mail.create(socialMailInfo).then(() => {
                req.flash('message', 'Message successfully send');
                res.redirect('/mail');
            })
        } catch (err) {
            console.log(err);
        }
    })
})

router.get('/follow/:id', (req, res) => {
    var fInfo = {
        follower: req.user.userID,
        following: req.params.id
    }
    User.findOne({ where: { userID: fInfo.following } }).then((dUser) => {
        Flist.create(fInfo).then(() => {
            res.redirect('/profile/' + dUser.username)
        })
    })
})

router.get('/unFollow/:id', (req, res) => {
    var fInfo = {
        follower: req.user.userID,
        following: req.params.id
    }
    Flist.destroy({ where: { follower: req.user.userID, following: fInfo.following } }).then(() => {
        User.findOne({ where: { userID: fInfo.following } }).then((dUser) => {
            res.redirect('/profile/' + dUser.username)
        })
    })
})

module.exports = router;