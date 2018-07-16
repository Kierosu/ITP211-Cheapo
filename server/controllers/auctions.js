
var express = require('express');
var router = express.Router();
var Auction = require('../models/auction');
var Item = require('../models/items');

router.get('/', (req, res) => {
    Item.findAll({}).then((item) => {
        Auction.findAll({}).then((auction) => {
            res.render('auctions', {
                item: item,
                auction: auction,
                msg: req.flash('message')
            });
        })
    })
})

// var abc = io.of('/chatTest');
// abc.on('connection', function (socket) {
//     console.log('YYY');
//     socket.on('testB', (data) => {
//         console.log(data);
//     })
// });

// var chatTest = io.of('/aokay');
// chatTest.on('connection', function (socket) {
//     console.log('wow');
//     socket.on('testA', (data) => {
//         console.log(data);
//         chatTest.emit('replayFromServer', { msg: data });
//     })
// });




module.exports = router;