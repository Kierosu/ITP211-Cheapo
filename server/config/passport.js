// load passport module
var LocalStrategy = require('passport-local').Strategy;
// load up the user model
var User = require('../models/user');

module.exports = function (passport) {
    // serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.userID);
    });
    // deserialize the user
    passport.deserializeUser(function (userID, done) {
        User.findById(userID).then(function (user) {
            if (user) {
                done(null, user.get());
            } else {
                done(user.errors, null);
            }
        });
    });

   // Signup local strategy
   passport.use('local-signup', new LocalStrategy({
        // change default username and password, to username and password
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, username, password, done) {
        // asynchronous
        process.nextTick(function () {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ where: { username: username } }).then((user) => {
                    // check Username
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'This username is already taken.'));
                    }
                    else
                    {
                        User.findOne({ where: { password: password } }).then((password) => {
                            if (password) {
                                return done(null, false, req.flash('signupMessage', 'This password is already taken.'));
                            }
                            else {
                                // create the user
                                var userData = {
                                    username: req.body.username,
                                    email: req.body.email,
                                    password: req.body.password
                                }
        
                                // save data
                                User.create(userData).then((newUser, created) => {
                                    if (!newUser) {
                                        return done(null, false);
                                    }
                                    if (newUser) {
                                        return done(null, newUser);
                                    }
                                })
                            }
                        })
                    }
                    
                }).catch((err) => {
                    console.log("Error:", err);
                    return done(err, false, req.flash('signupMessage', 'Error!'))
                });
            } else {
                return done(null, req.user);
            }
        });
    }));


    // using local strategy
    passport.use('local-login', new LocalStrategy({
        // change default username and password, to email and password
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, username, password, done) {
        var isValidPassword = function (userpass, password) {
            return userpass === password;
        }
        // process asynchronous
        process.nextTick(function () {
            User.findOne({ where: { username: username } }).then((user) => {
            // check errors and bring the mess  ages
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'Username not found!'));
                if (!isValidPassword(user.password, password))
                    return done(null, false, req.flash('loginMessage', 'Wrong password!'));
                // everything ok, get user
                else {
                    return done(null, user.get());
                }
            }).catch((err) => {
                console.log("Error:", err);
                return done(err, false, req.flash('loginMessage', 'Error!'))
            });
        });
    }));
}
