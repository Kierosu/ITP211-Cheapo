var Review = require('../models/itemReview');
var express = require('express');
var auth = require('./profile');
var router = express.Router();

router.post('/add/:id', auth.isLoggedIn, (req, res) => {
    var reviewData = {
        itemID: req.params.id,
        itemReview: req.body.theItemReview,
        userID: req.user.userID
    }

    Review.findOne({ where: { itemID: reviewData.itemID, userID: reviewData.userID } }).then((dReview) => {
        if (dReview) {
            if (req.user.userID == dReview.userID) {
                dReview.itemReview = req.body.theItemReview;
                dReview.save().then(() => {
                    req.flash('message', 'Review changed successfully');
                    res.redirect('/itemProduct/' + reviewData.itemID);
                })
            }
        } else {
            Review.create(reviewData).then(() => {
                req.flash('message', 'Review added successfully');
                res.redirect('/itemProduct/' + reviewData.itemID);
            }).catch((err) => {
                console.log(err);
                return;
            });
        }
    })
})

module.exports = router;