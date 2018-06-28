var User = require('../models/user');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var db = require('../controllers/database');
var sequelize = db.sequelize;

exports.showlogin = function (req, res) {
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
};

exports.login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
}

// Show register page
exports.showregister = function (req, res) {
    // Render index page
    res.render('register', {
        msg: req.flash('registermessage')
    });
};

exports.register = (req, res) => {
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
}

exports.editpage = (req, res) => {
    User.findOne({ where: { userID: req.params.id }}).then((user) => {
        res.render('useredit', {
            user: user
        })
    })
}

exports.edit = (req, res) => {
    User.findOne({ where: { userID: req.params.id } }).then((user => {
        user.username = req.body.username,
        user.email = req.body.email,
        user.membership = req.body.membership;

        user.save().then(suc => {
            req.flash('message', 'User edited successfully'),
            res.redirect('/items')
        })
    }))
}

exports.delete = (req, res) => {
    sequelize.query('DELETE from Users WHERE userID = ' + req.params.id, { model: User }).then((user) => {
        req.flash('message', 'User deleted successfully'),
            res.redirect('/items')
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    })
}

// Logout
exports.userlogout = function (req, res) {
    req.logout();
    req.flash('message', 'You are logged out');
    res.redirect('/');
};