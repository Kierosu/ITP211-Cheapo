var express = require('express');
var router = express.Router();
var { ensureAuthenticated } = require('../config/auth');
var Item = require('../models/items');
var db = require('../controllers/database');
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var sequelize = db.sequelize;
var ioApp = require('../../app')
var ioD = ioApp.ioC;

router.get('/wow', (req, res) => {
    res.render('auctions')
})

howMany = [];
var test = 'wba';
var testADC = ioD.of('/' + test);
testADC.on('connection', function (socket) {
    howMany.push(socket);
    console.log('Connected: %s sockets connected', howMany.length);

    socket.on('disconnect', (data) => {
        howMany.splice(howMany.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', howMany.length);
    })

    socket.on('testA', (data) => {
        console.log(data);
        testADC.emit('replayFromServer', { msg: data });
    })
});

router.get('/', (req,res)=>{
    if (req.user) {
        Item.findAll({}).then((item) => {
            res.render('index', {
                item: item,
                email: req.user.email,
                msg: req.flash('message')
            });
        })
    } else {
        Item.findAll({}).then((item) => {
            res.render('index', {
                item: item,
                msg: req.flash('message')
            });
        })
    }
})

router.get('/login', (req, res) => {
    if (req.user) {
        res.render('login', {
            name: req.body.name,
            msg: req.flash('message')
        });
    } else {
        res.render('login', {
            msg: req.flash('message')
        });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

// Show register page
router.get('/register', (req, res) => {
    // Render index page
    res.render('register', {
        msg: req.flash('registermessage')
    });
});

router.post('/register', (req, res) => {
    if (req.body.password != req.body.password2) {
        req.flash('message', 'Passwords does not match');
        res.render('register', {
            msg: req.flash('message')
        })
    } else {
        User.findOne({ where: { email: req.body.email } }).then(user => {
            if (user) {
                req.flash('message', 'Email is already registered');
                res.render('register', {
                    msg: req.flash('message')
                })
            } else {
                var userData = {
                    username: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                }
                console.log(userData);
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(userData.password, salt, (err, hash) => {
                        if (err) throw err;
                        userData.password = hash;
                        User.create(userData)
                            .then(() => {
                                req.flash('message', 'Account registered successfully');
                                res.render('register', {
                                    msg: req.flash('message')
                                })
                                console.log(userData)
                            }).catch((err) => {
                                console.log(err);
                                return;
                            });
                    })
                })
            }
        })
    }
});

router.get('/user/edit/:id', ensureAuthenticated, (req, res) => {
    User.findOne({ where: { userID: req.params.id } }).then((user) => {
        res.render('useredit', {
            user: user
        })
    })
});

router.post('/user/edit/:id', ensureAuthenticated, (req, res) => {
    User.findOne({ where: { userID: req.params.id } }).then((user => {
        user.username = req.body.username,
            user.email = req.body.email,
            user.membership = req.body.membership;

        user.save().then(suc => {
            req.flash('message', 'User edited successfully'),
                res.redirect('/items')
        })
    }))
});

router.get('/user/delete/:id', ensureAuthenticated, (req, res) => {
    sequelize.query('DELETE from Users WHERE userID = ' + req.params.id, { model: User }).then((user) => {
        req.flash('message', 'User deleted successfully'),
            res.redirect('/items')
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    })
});

// Logout
router.get('/logout', ensureAuthenticated, (req, res) => {
    req.logout();
    req.flash('message', 'You are logged out');
    res.redirect('/');
});

module.exports = router;