require('../models/items');
var Item = require('../models/items');
var express = require('express');
var router = express.Router();
var { ensureAuthenticated } = require('../config/auth');
var database = require('./database');
var sequelize = database.sequelize;
var multer = require('multer');
var path = require('path');
var Review = require('../models/itemReview');
var User = require('../models/user');
var Report = require('../models/reports');

// Staticfolder
router.use(express.static(path.join(__dirname, 'public')));

// Item page
router.get('/', ensureAuthenticated, (req, res) => {
    if (req.user.userType === 'Admin') {
        Item.findAll({}).then((item) => {
            Report.findAll({}).then((report) => {
                User.findAll({ where: { userType: 'Member' }}).then((user) => {
                    res.render('mainItem', {
                        item: item,
                        report: report,
                        users: user,
                        msg: req.flash('message')
                    })
                })
            })
        })
    } else {
        sequelize.query('select * from Items where userID = ' + req.user.userID, { model: Item }).then((item) => {
            res.render('mainItem', {
                item: item,
                msg: req.flash('message')
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            });
        })
    }
})

// Edit item page
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Item.findOne({ where: { itemID: req.params.id } }).then((item => {
        res.render('itemEdit', {
            item: item
        })
    }))
})

// Item edited
router.post('/edit/:id', ensureAuthenticated, (req, res) => {
    Item.findOne({ where: { itemID: req.params.id } }).then((item => {
        item.name = req.body.name,
            item.detail = req.body.detail,
            item.price = req.body.price;

        item.save().then(suc => {
            req.flash('message', 'Item edited successfully'),
                res.redirect('/items')
        })
    }))
})

// Item deleted
router.get('/delete/:id', ensureAuthenticated, (req, res) => {
    sequelize.query('DELETE from Items WHERE itemID = ' + req.params.id, { model: Item }).then((item) => {
        req.flash('message', 'Item deleted successfully'),
            res.redirect('/items')
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    })
    console.log(req.params.id)
})

// Add item page
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('itemsell')
})


// Set storage engine
var storage = multer.diskStorage({
    destination: './public/imghere/',
    filename: (req, file, cb) => {
        cb(null, req.user.email + '-' + Date.now() + path.extname(file.originalname));
    }
})

// Init upload
var upload = multer({
    storage: storage,
    limits: { fileSize: 150000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('myImage');

// Check file type
function checkFileType(file, cb) {
    // Allow ext
    var filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    var mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only')
    }
}

// Add item
router.post('/add', ensureAuthenticated, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('itemSell', {
                message: err
            })
        } else {
            var itemData = {
                name: req.body.itemName,
                detail: req.body.itemDetails,
                price: req.body.itemPrice,
                userID: req.user.userID,
                itemPic: req.file.filename
            }
            Item.create(itemData)
                .then(() => {
                    req.flash('message', 'Item successfuly added');
                    res.redirect('/items')
                    console.log(itemData)
                }).catch((err) => {
                    console.log(err);
                    return;
                });
        }
    })
})



router.get('/list/:id', (req, res) => {
    // sequelize.query('SELECT * FROM Items WHERE itemID = ' + req.params.id, { model: Item }).then((item) => {
    //     res.render('productpage', {
    //         item: item
    //     })
    //     console.log(item.name)
    // })

    Item.findOne({ where: { itemID: req.params.id } }).then((item => {
        Review.findAll({ where: { itemID: req.params.id } }).then((review => {
            res.render('productpage', {
                item: item,
                review: review
            })
        }))
    }))
})

module.exports = router;