var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var auth = require('./server/controllers/profile');

// Modules to store session
var myDatabase = require("./server/controllers/database");
var expressSession = require("express-session");
var SessionStore = require('express-session-sequelize')(expressSession.Store);
var sequelizeSessionStore = new SessionStore({
    db: myDatabase.sequelize
});
// Import Passport and Warning flash modules
var passport = require("passport");
var flash = require("connect-flash");

var app = express();

// ejs template path
app.set("views", path.join(__dirname, "server/views/pages"));
// view engine setup
app.set("view engine", "ejs");


// Passport configuration
require("./server/config/passport")(passport);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Setup public directory
app.use(express.static(path.join(__dirname, "public")));

// required for passport
// secret for session
app.use(expressSession({
    secret: "sometextgohere",
    store: sequelizeSessionStore,
    resave: false,
    saveUninitialized: false,
}));

// Init passport authentication
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());
// flash messages
app.use(flash());

// Logout Page
app.get('/logout', auth.logout);

app.get('/login', auth.isLoggedInV2, auth.signin);
app.post('/login',passport.authenticate('local-login', {
    //Success go to Profile Page / Fail go to login page
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
})
);

app.get('/signup', auth.isLoggedInV2, auth.signup);
app.post('/signup', passport.authenticate('local-signup', {
    //Success go to Login Page / Fail go to Signup page
    successRedirect: '/logout',
    failureRedirect: '/signup',
    failureFlash: true
}));

app.get('/profile', auth.isLoggedIn, auth.profilepage);



app.listen(3000);