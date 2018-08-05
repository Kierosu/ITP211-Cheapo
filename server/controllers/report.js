var ItemPost = require('../models/itemPost');
var reports = require('../models/report');
var database = require('./database');
var sequelize = database.sequelize;
var express = require('express');
var auth = require('./profile');
var router = express.Router();

router.post('/add/:id', auth.isLoggedIn, (req, res) => {
    ItemPost.findOne({ where: { id: req.params.id } }).then((dItem) => {
        var reportData = {
            itemID: req.params.id,
            reportDetails: req.body.itemReport,
            userID: req.user.userID
        }
        if (dItem.sellerID == req.user.userID) {
            req.flash('message', 'Unable to report your own item');
            res.redirect('/itemProduct/' + reportData.itemID);
        } else {            
            reports.create(reportData).then(() => {
                req.flash('message', 'Report is made');
                res.redirect('/itemProduct/' + reportData.itemID);
            }).catch((err) => {
                console.log(err);
                return;
            });
        }
    })
})

var { itemWarnings } = require('./sendMails');

function warnings(warns, itemId) {
    var firstWarning = '1/3';
    var secondWarning = '2/3';
    var thirdWarning = '3/3';
    if (warns == "") {
        itemWarnings(itemId, firstWarning);
        return firstWarning;
    } else if (warns == firstWarning) {
        itemWarnings(itemId, secondWarning);
        return secondWarning;
    } else if (warns == secondWarning) {
        return thirdWarning;
    } else {
        return thirdWarning;
    }
}

function susp(id) {
    ItemPost.findOne({ where: { id: id } }).then((item => {
        item.status = 'Deactivated';
        item.warnings = '';
        item.save();
    }))
}

function deleteInR(id) {
    sequelize.query('DELETE from Reports WHERE itemID = ' + id + 'DELETE from Reviews WHERE itemID = ' + id + 'DELETE from itemPosts WHERE id = ' + id, { model: ItemPost })
}

router.get('/warn/:iid/:rid', auth.isLoggedIn, (req, res) => {
    ItemPost.findOne({ where: { id: req.params.iid } }).then((item => {
        if (item.warnings == 'Final') {
            itemWarnings(item.id, 'deleteItem');
            deleteInR(req.params.iid);
            req.flash('message', 'Item removed successfully');
            res.redirect('/userItems');
        } else {
            item.warnings = warnings(item.warnings, item.id)
            if (item.warnings == '3/3') {
                itemWarnings(item.id, 'sus');
                susp(req.params.iid);
            }
            item.save().then(() => {
                req.flash('message', 'Warn successfully'),
                    res.redirect('/userItems')
            }).catch((err) => {
                return res.status(400).send({
                    message: err
                });
            })
        }
    }))
    reports.destroy({ where: { reportID: req.params.rid } })
})

router.get('/delete/:id', auth.isLoggedIn, (req, res) => {
    sequelize.query('DELETE from Reports WHERE reportID = ' + req.params.id, { model: reports }).then(() => {
        req.flash('message', 'Report ignored'),
            res.redirect('/userItems')
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    })
})

module.exports = router;