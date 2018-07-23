// load passport module
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User = require('../models/user');
const nodemailer = require('nodemailer');
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

    var { newAccount } = require('../controllers/sendMails');
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
                                        console.log(newUser.userID);
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
                    req.session.cookie.maxAge = 86400000;
                    return done(null, user.get());
                }
            }).catch((err) => {
                console.log("Error:", err);
                return done(err, false, req.flash('loginMessage', 'Error!'));
                
            });
        });
    }));

    // Use the GoogleStrategy within Passport.
    passport.use(new GoogleStrategy({
        clientID: "1092711652875-p2b7i50cd71lsg2p5u9dj94o8d31ohao.apps.googleusercontent.com",
        clientSecret: "PvfrueeC6wChPerIeEtJKMav",
        callbackURL: "http://localhost:3000/auth/google/callback"
      },
      function(token, refreshToken, profile, done) {
        process.nextTick(function() {
            User.findOne({ where: { username: profile.displayName } }).then(function (user,err) {
                if (err){
                    return done(err);
                }    
                if (user) {
                    // if a user is found, log them in
                    return done(null, user);
                }
                else{
                    var email = profile.emails[0].value;
                    var name = email.substring(0, email.lastIndexOf("@"));
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        bcrypt.hash(name, salt, function(err, hash) {
                            var userData = {
                                username: profile.displayName,
                                email: profile.emails[0].value,
                                password: hash
                            };
                            User.create(userData).then((newUser, created) => {
                                if (!newUser) {
                                    return done(null, false);
                                }
                                if (newUser) {
                                    nodemailer.createTestAccount(() => {
                                        // create reusable transporter object using the default SMTP transport
                                        let transporter = nodemailer.createTransport({
                                            service: "gmail",
                                            port: 25,
                                            secure: false,
                                            auth: {
                                                user: "TheCheapoOnline@gmail.com",
                                                pass: "cheapo123"
                                            },
                                            tls: {
                                                rejectUnauthorized: false
                                            }
                                        });
                    
                                        // setup email data with unicode symbols
                                        let mailOptions = {
                                            from: '"Cheapo Eshop" <TheCheapoOnline@gmail.com>', // sender address
                                            to: newUser.email, // list of receivers
                                            subject: 'New Account created using this email', // Subject line
                                            text: 'Hi ' +  newUser.username + ", Welcome to Cheapo Eshop! We hope you enjoy "+
                                            "your time shopping at our website! Here is your password: " + name + "Please change your password when you logged in as it is the same as your email name." +
                                            "Cheers! Cheapo Eshop",
                                            html: '<p>Hi ' +  newUser.username + ",</p><p>Welcome to Cheapo Eshop! We hope you enjoy "+
                                            "your time shopping at our website! Here is your password: " + name + "</p><p>Please change your password when you logged in as it is the same as your email name.</p>" +
                                            "<p><span style = \"font-weight: bold;\">Cheers!</span><br>Cheapo Eshop</p>"
                                        };
                    
                                        // send mail with defined transport object
                                        transporter.sendMail(mailOptions, (error, info) => {
                                            if (error) {
                                                return console.log(error);
                                            }
                                            console.log('Message sent: %s', info.messageId);
                                            // Preview only available when sending through an Ethereal account
                                            console.log((info));
                    
                                        });
                                    });
                                    return done(null, newUser);
                                }
                            });
                        })
                    })
                }
                
                console.log(name);
            });     
        });
    }
    ));
}
