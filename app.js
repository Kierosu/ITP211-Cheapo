var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

//Import multer
var multer = require('multer');
var upload = multer({dest: './public/uploads/', limits: {fileSize: 1000000, files:1} });

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
    successRedirect: '/',
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

//edit profile info
app.get('/edit' + '/profilepicture', auth.isLoggedIn, auth.editProfile);
app.post('/uploadImage', upload.single('image'), auth.uploadImage);
app.post('/updatePicture', auth.saveChanges);

//forget password
app.get('/forgetpass', auth.isLoggedInV2, auth.forgetPass);
app.post('/forgetpass', auth.checkUserEmail)

app.get('/', auth.test)

app.listen(3000);