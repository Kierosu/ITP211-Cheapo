var msg = require('../models/msg');
var Items = require('../models/item');
var database = require('./database');
var sequelize = database.sequelize;
var express = require('express');
var auth = require('./profile');
var router = express.Router(); 
 
router.post('/', auth.isLoggedIn, (req, res) => {  
    var msgData = {
        msgID: req.params.msgID,
        msgData: req.params.msgData,
        sentby: req.user.userID,  
        sentto: req.user.sentto
    }
    msg.create(msgData).then(() => {
        req.flash('msg', 'Message sent.');
        res.redirect('/');
    }).catch((err) => {
        console.log(err);
        return;
    });
})
 
module.exports = router;
