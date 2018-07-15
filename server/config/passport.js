// load passport module
var LocalStrategy = require('passport-local').Strategy;
// load up the user model
var User = require('../models/user');
var bcrypt = require('bcrypt');
const saltRounds = 10;

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
                    else{
                        bcrypt.genSalt(saltRounds, function(err, salt) {
                            bcrypt.hash(req.body.password, salt, function(err, hash) {
                                // Store hash in your password DB.
                                // create the user
                                var userData = {
                                    username: req.body.username,
                                    email: req.body.email,
                                    password: hash
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
                            });
                        });                                                                             
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
        var isValidPassword = function (myPassword,hash) {
            return bcrypt.compareSync(myPassword, hash);
        }
        // process asynchronous
        process.nextTick(function () {
            User.findOne({ where: { username: username } }).then((user) => {
            // check errors and bring the messages
                if (!user){
                    return done(null, false, req.flash('loginMessage', 'Invalid username or password!'));
                }        
                if (!isValidPassword(req.body.password, user.password)){
                    return done(null, false, req.flash('loginMessage', 'Invalid username or password!'));
                }
                    
                // everything ok, get user
                else { 
                    return done(null, user.get());
                }
            }).catch((err) => {
                console.log("Error:", err);
                return done(err, false, req.flash('loginMessage', 'Error!'));
                
            });
        });
    }));


}
