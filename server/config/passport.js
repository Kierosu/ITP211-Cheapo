var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

var User = require('../models/user');

module.exports = function (passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        User.findOne({ where: { email: email } }).then((user => {
            if (!user) {
                return done(null, false, req.flash('message', 'Email not found!'));
            }

            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, req.flash('message', 'Password Incorrect'));
                    console.log(user.passport + password);
                }
            })
        }))
    }));

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
}