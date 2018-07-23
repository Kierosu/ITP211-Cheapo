var Review = require('../models/itemReview');
var express = require('express');
var auth = require('./profile');
var router = express.Router();

router.post('/add/:id', auth.isLoggedIn, (req, res) => {
    var reviewData = {
        itemID: req.params.id,
        itemReview: req.body.details,
        userID: req.user.userID
    }

    Review.findOne({ where: { itemID: reviewData.itemID, userID: reviewData.userID } }).then((dReview) => {
        if (dReview) {
            Review.findOne({ where: { itemID: reviewData.itemID, userID: req.user.userID } }).then((eReview => {
                eReview.itemReview = req.body.details;
                eReview.save().then(() => {
                    req.flash('msg', 'Review changed successfully');
                    res.redirect('/items/list/' + reviewData.itemID);
                })
            }))
        } else {
            Review.create(reviewData).then(() => {
                req.flash('msg', 'Review add successfully');
                res.redirect('/items/list/' + reviewData.itemID);
            }).catch((err) => {
                console.log(err);
                return;
            });
        }
    })
})

module.exports = router;