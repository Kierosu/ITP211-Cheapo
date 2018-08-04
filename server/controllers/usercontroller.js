var User = require('../models/user');
var mydatabase  = require( '../controllers/database');  
var sequelize  = mydatabase.sequelize; 
var msg = require('../models/msg');
 
 
exports.list  = function(req,res){  
    User.findAll({}).then((Users) => {
        msg.findAll({}).then((msgs) => {
            res.render('chatpage', {
                userList : Users,
                messageList : msgs,
                 
            });
        })
    })
     
};
