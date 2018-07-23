const passport = require('passport');
const fs = require('fs');
const UserModel = require('../models/user');
const myDatabase = require('./database');
const sequelizeInstance = myDatabase.sequelizeInstance;
const generatePassword = require('password-generator');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
// set images file types
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const bcrypt = require('bcrypt');

var secret;
var temp_secret;
const saltRounds = 10;

// Signup 
exports.signup = function (req, res) {
    res.render('Signup', {
        title: "Cheapo - Signup Page",
        message: req.flash('signupMessage')
    });
};
// Signin 
exports.signin = function (req, res) {
    res.render('Login', {
        title: "Cheapo - Login Page",
        message: req.flash('loginMessage')
    });
};
// Profile 
exports.profilepage = function (req, res) {
    var username = req.params.username;
    UserModel.findOne({ where: { username: username } }).then(function (userprofile) {
        res.render('Profile', {
            user: userprofile
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });

};
// Logout 
exports.logout = function (req, res) {
    req.logout();
    req.session.destroy(() => {
        res.redirect('/login');
    })
};

// check if user is logged in
exports.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};
exports.isLoggedInV2 = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/profile');
};
exports.loginCheck = function (req, res, next) {
    if (req.isAuthenticated()) {
        req.logout();
    }
    return next();
};

// Edit profile page
exports.editProfile = (req, res) => {
    var id = req.params.userID;
    UserModel.findById(id).then(function () {
        res.render('EditProfile', {
            title: 'Cheapo - Edit Profile',
            email: req.user.email,
            avatarTemp: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
            avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
            hostPath: req.protocol + "://" + req.get("host"),
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
}

//Upload (but not save) the image
exports.uploadImage = function (req, res) {
    var src;
    var dest;
    var targetPath;
    var tempPath = req.file.path;
    //get the mime type of the file
    var type = req.file.mimetype
    //get file extension
    var extension = req.file.path.split(/[. ]+/).pop();
    //Check support file type
    if (IMAGE_TYPES.indexOf(type) == -1) {
        return res.status(415).send('Supported image formats:  jpeg, jpg, jpe, png.');
    }
    //Set new path to images
    targetPath = './public/img/' + req.file.originalname;
    //using a read stream API to read file
    src = fs.createReadStream(tempPath);
    // using a write stream API to write file
    dest = fs.createWriteStream(targetPath);
    src.pipe(dest);
    //Show error
    src.on('error', function (err) {
        if (err) {
            return res.status(500).send("There is an error uploading your image.");
        }
    });
    res.redirect('/edit/profile')
}

//Save profile
exports.saveChanges = (req, res) => {
    var id = req.user.userID;
    var updateProfile = {
        profilePic: req.body.profilePic,
        email: req.body.email
    }
    UserModel.update(updateProfile, { where: { userID: id } }).then((updatedRecord) => {
        if (!updatedRecord || updatedRecord == 0) {
            return res.status(400).send({ message: "error" });
        }
        res.status(200).send({ message: "Profile has been successfully updated" });
    }).catch((err) => {
        if (err) {
            res.status(400).send("Oops! There is an error updating your profile!");
        }
    })
}

//Forget username page
exports.forgetUsername = (req, res) => {
    res.render('ForgetUsername', {
        title: "Cheapo - Forget username",
    })
}
exports.sendUsername = (req, res) => {
    UserModel.findOne({ where: { email: req.body.email } }).then(function (user) {
        if (user) {
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
                    to: user.email, // list of receivers
                    subject: 'Username Recovery', // Subject line
                    text: "Hi! Your username for Cheapo Eshop linked to " + user.email + " is " + user.username +
                        "Cheers! Cheapo Eshop",
                    html: '<p>Hi!</p>' + "<p>Your username for Cheapo Eshop linked to " + user.email + " is " + user.username + "</p>" +
                        "<p><span style = \"font-weight: bold;\">Cheers!</span><br>Cheapo Eshop</p>"
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                    // Preview only available when sending through an Ethereal account
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                });
            });
            res.status(200).send({ message: "Username sent!" });
        }
        else {
            res.status(400).send("This Email does not have an account!");
        }
    })
}

//Forget password page
exports.forgetPass = (req, res) => {
    res.render('ForgetPass', {
        title: "Cheapo - Forget password"
    })
}

exports.setSendPass = (req, res) => {
    UserModel.findOne({ where: { username: req.body.username } }).then(function (user) {
        if (user.email == req.body.email) {
            var randompass = generatePassword(12, false);
            bcrypt.hash(randompass, saltRounds).then(function (hash) {
                var newpass = {
                    password: hash
                }
                UserModel.update(newpass, { where: { userID: user.userID } }).then(() => {
                    // Generate test SMTP service account from ethereal.email
                    // Only needed if you don't have a real mail account for testing
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
                            to: user.email, // list of receivers
                            subject: 'Password Recovery', // Subject line
                            text: 'Hi ' + user.username + ", your password have been reset. Here is your new " +
                                "password: " + randompass + "Make sure to change your password when you logged in!" +
                                "Cheers! Cheapo Eshop",
                            html: '<p>Hi ' + user.username + ",</p><p>Your password have been reset. Here is your new " +
                                "password: " + randompass + "</p><p>Make sure to change your password when you logged in!</p>" +
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
                })
            })
            res.status(200).send({ message: "New password sent! " + randompass });
        }
        else {
            res.status(400).send("Username and Email does not match!");
        }
    }).catch(() => {
        res.status(400).send("Username not found!");
    })
}

//Change password
exports.changePass = (req, res) => {
    res.render('ChangePass', {
        title: "Change Password"
    })
}

//Save changed password
exports.savePassword = (req, res) => {
    var id = req.user.userID
    var isValidPassword = function (myPassword, hash) {
        return bcrypt.compareSync(myPassword, hash);
    };
    UserModel.findById(id).then((user) => {
        if (!isValidPassword(req.body.currentpass, user.password)) {
            return res.status(400).send("Wrong current password!");
        }
        else {
            bcrypt.hash(req.body.newpass, saltRounds).then(function (hash) {
                var passData = { password: hash };
                UserModel.update(passData, { where: { userID: id } }).then((updatedRecord) => {
                    if (!updatedRecord || updatedRecord == 0) {
                        return res.status(400).send("Error updating password");
                    }
                    res.status(200).send({ message: "Password successfully changed" });
                });
            });
        }
    }).catch((res) => {
        res.status(200).send("An error has occured")
    })
}

//2-Factor Auth Page
exports.TwoFactorAuth = (req, res) => {
    // Get the data URL of the authenticator URL
    secret = speakeasy.generateSecret();
    temp_secret = secret.base32;
    urlpath = "otpauth://totp/" + req.user.username + "?secret=" + temp_secret + "&issuer=Cheapo%20Eshop";
    QRCode.toDataURL(urlpath, function (err, data_url) {
        // Display this data URL to the user in an <img> tag
        res.render('2FA', {
            title: "Two-Factor Authentication",
            qrcode: data_url,
            secretkey: "Something idk",
            Select2FA: req.user.TwoFA
        })
    });
}

exports.saveGoogleAuth = (req, res) => {
    var id = req.user.userID
    var userToken = req.body.token;
    var base32secret = temp_secret;
    var verified = speakeasy.totp.verify({
        secret: base32secret,
        encoding: 'base32',
        token: userToken
    });
    if (verified) {
        var secretData = {
            SecretToken: base32secret,
            TwoFA: req.body.TwoFA,
        };
        UserModel.update(secretData, { where: { userID: id } }).then(() => {
            res.status(200).send({ message: "You have activated Two-Factor Authenticator using Google Authenticator App!" });
        })
    }
    else {
        res.status(400).send("Oops! Wrong verification code.");
    }
}

exports.disableTFA = (req, res) => {
    var id = req.user.userID;
    var userToken = req.body.disableToken;
    var userSecret = req.user.SecretToken;
    var verified = speakeasy.totp.verify({
        secret: userSecret,
        encoding: 'base32',
        token: userToken
    });
    var disableData = {
        TwoFA: req.body.TwoFA,
        SecretToken: null
    }
    var isValidPassword = function (myPassword, hash) {
        return bcrypt.compareSync(myPassword, hash);
    }
    UserModel.findById(id).then((user) => {
        if (isValidPassword(req.body.password, user.password) && verified) {
            UserModel.update(disableData, { where: { userID: id } }).then(() => {
                res.status(200).send({ message: "You have deactivated Two-Factor Authenticator." });
            })
        }
        else {
            res.status(400).send("Oops! Wrong password or verification code!");
        }
    })
}

exports.verifyOTP = function (req, res) {
    var id = req.user.userID;
    var userToken = req.body.otp;
    var userSecret = req.user.SecretToken;
    var verified = speakeasy.totp.verify({
        secret: userSecret,
        encoding: 'base32',
        token: userToken
    });
    if (verified) {
        res.status(200).send({ message: "AUTHORIZED" })
    }
    else {
        res.status(400).send("Wrong verification code!")
    }
}

exports.checkTFA = (req, res) => {
    res.status(200).send({ message: req.user.TwoFA });
}

var Item = require('../models/item');

//Index page
exports.index = (req, res) => {
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
}