var User = require('../models/user');
var mydatabase  = require( '../controllers/database');  
var sequelize  = mydatabase.sequelize; 
var msg = require('../models/msg'); 
var block = require('../models/block');
 
 
exports.list  = function(req,res){  
    User.findAll({}).then((Users) => {
        msg.findAll({}).then((msgs) => { 
            block.findAll({}).then((blocks) => {
                res.render('chatpage', {
                    userList : Users,
                    messageList : msgs,
                    blockList : blocks, 
                    urlPath: req.protocol + "://" + req.get("host") + req.url
                }); 
            }).catch((err) =>{ 
                return res.status(400).send({ 
                    message : err
                });
            });
        })
    })
     
}; 

exports.create = function(req,res) { 
    console.log("blocking user") 
    var blockData  = { 
        blockedby : req.user.username, 
        blockeduser : req.body.blockuser, 
         
    }    
    
    block.create(blockData).then((newBlock, created) =>{ 
        if (!newBlock){ 
            return res.send(400, { 
                message: "error"
            })
        } 
         
        res.redirect('/chat')
    })
} 

exports.delete = function(req,res){ 
    var block_num = req.params.block_id; 
    console.log("removing block on user" + block_num) 
    block.destroy({where: {BlockID: block_num} }).then((deletedBlock)  => { 
        if (!deletedBlock){ 
            return res.send(400, { 
                message: "error"
            });
        }  
        res.status(200).send({message: "Removed block :" + block_num}); 
        res.redirect('/chat')
    })
} 
exports.messagelist = function(req,res){  
    User.findAll({}).then((Users) => {
        msg.findAll({}).then((msgs) => { 
            block.findAll({}).then((blocks) => {
                res.render('popup', {
                    userList : Users,
                    messageList : msgs,
                    blockList : blocks, 
                    urlPath: req.protocol + "://" + req.get("host") + req.url
                }); 
            }).catch((err) =>{ 
                return res.status(400).send({ 
                    message : err
                });
            });
        })
    })
     
}; 
exports.createmsg = function (req, res) {
    var chatData = {
        username: req.body.username,
        message: req.body.message,
        sentby: req.body.username,
        sentto: req.body.sentto,
    }

    msg.create(chatData).then((newMessage) => {
        if (!newMessage) {
            sendStatus(500);
        }
    })
}; 
