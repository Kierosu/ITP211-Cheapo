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

function warnings(warns) {
    if (warns == "") {
        return '1/3';
    } else if (warns == '1/3') {
        return '2/3';
    } else if (warns == '2/3') {
        return '3/3'
    } else {
        return '3/3'
    }
}

function susp(id) {
    Items.findOne({ where: { itemID: id } }).then((item => {
        item.status = 'Deactivated';
        item.save();
    }))
}

function deleteInR(id) {
    sequelize.query('DELETE from Reports WHERE itemID = ' + id + 'DELETE from Reviews WHERE itemID = ' + id + 'DELETE from Items WHERE itemID = ' + id, { model: Items })
}

router.get('/warn/:iid/:rid', ensureAuthenticated, (req, res) => {
    Items.findOne({ where: { itemID: req.params.iid } }).then((item => {
        if (item.warnings == 'Final') {
            deleteInR(req.params.iid);
            req.flash('message', 'Item removed successfully');
            res.redirect('/items');
        } else {
            item.warnings = warnings(item.warnings)
            if (item.warnings == '3/3') {
                susp(req.params.iid);
            }
            item.save().then(sec => {
                req.flash('message', 'Warn successfully'),
                    res.redirect('/items')
            }).catch((err) => {
                return res.status(400).send({
                    message: err
                });
            })
        }
    }))
    reports.destroy({ where: { reportID: req.params.rid } })
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