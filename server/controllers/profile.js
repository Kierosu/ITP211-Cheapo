var passport = require('passport');
var UserModel = require('../models/user');
var myDatabase = require('./database');
var sequelizeInstance = myDatabase.sequelizeInstance;


// Signup GET
exports.signup = function(req, res) {
    res.render('Signup', {
        title: "Cheapo - SignUp Page",
        message: req.flash('signupMessage')
    });
    console.log("Page is on: signup");
};
// Signin GET
exports.signin = function(req, res) {
    res.render('Login', {
        title: "Cheapo - Login Page",
        message: req.flash('loginMessage')
    });
};
// Profile GET
exports.profilepage = function(req, res) {
    var id = req.params.userID;
    UserModel.findById(id).then(function(){
        res.render('profile', { 
        title: 'Cheapo - Profile Page',
        avatar: req.protocol + "://" + req.get("host") + '/images/' + req.user.profilePic,
        username : req.user.username,
        email: req.user.email,
        userID: req.user.userID,
        dateJoined: req.user.joinDate,
        type: req.user.userType,
        membership: req.user.membership,
    });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
    
};
// Logout function
exports.logout = function (req, res) {
    req.logout();
    req.session.destroy(()=>{
        res.redirect('/login');
    })   
};

// check if user is logged in
exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};
exports.isLoggedInV2 = function(req,res,next) {
    if (!req.isAuthenticated())
        return next(); 
    res.redirect('/profile');
};