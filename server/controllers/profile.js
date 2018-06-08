var passport = require('passport');

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
    console.log("Page is on: login");
};