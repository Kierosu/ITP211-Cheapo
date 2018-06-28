var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var express = require('express');
var app = express();
var path = require("path");
var serverPort = 3000;
var httpServer = require('http').Server(app);
var stripe = require('stripe')('sk_test_PdG9Jw0lx0FPCqhtlT123siy');
var bodyparser = require('body-parser');
var multer = require('multer');


//Database
var myDatabase = require('./public/js/database')
var expressSession = require('express-session');
var SessionStore = require('express-session-sequelize')(expressSession.Store);
var sequelizeSessionStore = new SessionStore({
    db: myDatabase.sequelize,
});

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


//Rayson's code

// secret for session
app.use(expressSession({
    secret: 'sometextgohere',
    store: sequelizeSessionStore,
    resave: false,
    saveUninitialized: false,
}));

// Set Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads',
    filesname: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//import shoppingCart controllers
var products = require('./server/controllers/shoppingCart');

//import shoppingCart controllers
var checkout = require('./server/controllers/checkout');

//import confirmation controllers
var confirmation = require('./server/controllers/confirmation');

//import Item Description controllers
var itemDes = require('./server/controllers/itemDescrip');

//import done 
var done = require('./server/controllers/done');

//import wishlist
var wishList = require('./server/controllers/wishList');

//import order tracking
var orderTracking = require('./server/controllers/orderTracking');

// Ejs directory
app.set("views", path.resolve(__dirname, "server/views/pages"));
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

// set the view engine to ejs
app.set('view engine', 'ejs');

// Shopping Cart
app.get('/shopping-cart', products.list);
app.delete('/shopping-cart/:ProductID', products.delete);

// Checkout 
app.get('/checkout', checkout.show);
app.post("/checkout/userIdHere", checkout.insert)
  
app.post('/charge', function(req,res){
    //Stripe 
    let amount = req.body.chargeAmount;

    stripe.customers.create({
        email: req.body.nameCard + "@gmail.com", 
        card: "tok_visa"
    })
    .then(customer =>
        stripe.charges.create({
        amount,
        description: "Purchases from Cheapo",
        currency: "sgd",
        customer: customer.id
        }))
    .then(charge => res.send(charge))
    .catch(err => {
        console.log("Error:", err);
        res.status(500).send({error: "Purchase Failed"});
    });
    res.redirect("/done")
});


//Confirmations
app.get('/confirmation', confirmation.show );

//Items descrip
app.get('/item', itemDes.show);
app.post("/item/macbook",itemDes.insert);
app.post("/add",itemDes.add);

//Done
app.get('/done', done.show);

//Wish List
app.get('/wishlist', wishList.show)
app.delete('/wishlist/:ProductID', wishList.delete);

//Order Tracking
app.get('/order-tracking', orderTracking.show)


app.get('/', auth.test)

app.listen(3000);