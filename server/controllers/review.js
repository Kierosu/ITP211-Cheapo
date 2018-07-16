require('../models/itemReview')
var express = require('express');
var router = express.Router();
var { ensureAuthenticated } = require('../config/auth');
var Review = require('../models/itemReview')

router.post('/add/:id', ensureAuthenticated, (req, res) => {
    var reviewData = {
        itemID: req.params.id,
        itemReview: req.body.details,
        userID: req.user.userID
    }

    Review.findOne({ where: { itemID: reviewData.itemID, userID: reviewData.userID } }).then(dReview => {
        if (dReview) {
            Review.findOne({ where: { userID: req.user.userID } }).then((eReview => {
                eReview.itemReview = req.body.details        
                eReview.save().then(suc => {
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