var { ensureAuthenticated } = require('../config/auth');
var reports = require('../models/reports');
var database = require('./database');
var sequelize = database.sequelize;
var express = require('express');
var router = express.Router();
var Items = require('../models/items');

router.post('/add/:id', ensureAuthenticated, (req, res) => {
    var reportD = req.body.reasons + ':' + req.body.details
    var reportData = {
        itemID: req.params.id,
        reportDetails: reportD,
        userID: req.user.userID
    }
    reports.create(reportData).then(() => {
        req.flash('msg', 'Report is successful');
        res.redirect('/items/list/' + reportData.itemID);
    }).catch((err) => {
        console.log(err);
        return;
    });
})

var dwarnings = ({
    
})

router.get('/warn/:id', ensureAuthenticated, (req, res) => {    
    Items.findOne({ where: { itemID: req.params.id } }).then((item => {
        item.warnings = 'orange'
        item.save().then(sec => {
            req.flash('message', 'Warn successfully'),
                res.redirect('/items')
        }).catch((err) => {
            return res.status(400).send({
                message: err
            });
        })
    }))
})

router.get('/test', ensureAuthenticated, (req, res) => {
    req.flash('msg', 'Item edited successfully');
})

router.get('/delete/:id', ensureAuthenticated, (req, res) => {
    sequelize.query('DELETE from Reports WHERE reportID = ' + req.params.id, { model: reports }).then(() => {
        req.flash('msg', 'Report deleted successfully'),
            res.redirect('/items')
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    })
})

module.exports = router;