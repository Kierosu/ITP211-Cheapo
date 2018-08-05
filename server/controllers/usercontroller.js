var User = require('../models/user');
var mydatabase = require('../controllers/database');
var sequelize = mydatabase.sequelize;
var msg = require('../models/msg');
var block = require('../models/block');


exports.list = function (req, res) {
    User.findAll({}).then((Users) => {
        msg.findAll({}).then((msgs) => {
            block.findAll({}).then((blocks) => {
                res.render('chatpage', {
                    userList: Users,
                    messageList: msgs,
                    blockList: blocks,
                });
            })
        })
    })
};
