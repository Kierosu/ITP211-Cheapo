var Mail = require('../models/mail');
var User = require('../models/user');
var express = require('express');
var auth = require('./profile');
var router = express.Router();

router.get('/', auth.isLoggedIn, (req, res) => {
    Mail.findAll({ where: { receiver: req.user.userID } }).then((mail) => {
        User.findAll({}).then((user) => {
            res.render("mail", {
                mail: mail,
                user: user,
                msg: req.flash('message')
            });
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

module.exports = router;