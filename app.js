const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const multer = require('multer');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
exports.ioExports = io;

const upload = multer({dest: './public/uploads/', limits: {fileSize: 1000000, files:1} });

const auth = require('./server/controllers/profile');

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

app.get('/login', auth.loginCheck, auth.signin);
app.post('/login',passport.authenticate('local-login', {
    failureRedirect: '/',
    failureFlash: true
}), function(req,res){
    res.status(200).send({message: req.user.TwoFA}); 
}
);

app.post('/verifyOTP', auth.verifyOTP)

app.get('/signup', auth.isLoggedInV2, auth.signup);
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/logout',
    failureRedirect: '/signup',
    failureFlash: true
}));

app.post('/checkTFA', auth.checkTFA);

app.get('/profile', auth.isLoggedIn, auth.profilepage);

//edit profile info
app.get('/edit' + '/profile', auth.isLoggedIn, auth.editProfile);
app.post('/uploadImage', upload.single('image'), auth.uploadImage);
app.post('/updateProfile', auth.saveChanges);

//forget username/password
app.get('/forgetpass', auth.isLoggedInV2, auth.forgetPass);
app.post('/forgetpass', auth.setSendPass);
app.get('/forgetusername', auth.isLoggedInV2, auth.forgetUsername);
app.post('/forgetusername', auth.sendUsername);

//Change pass
app.get('/changePassword', auth.isLoggedIn, auth.changePass);
app.post('/changePassword',auth.isLoggedIn, auth.savePassword);

//2-Factor Auth
app.get('/2FA', auth.isLoggedIn, auth.TwoFactorAuth);
app.post('/googleauth', auth.isLoggedIn, auth.saveGoogleAuth);
app.post('/disableTFA', auth.isLoggedIn, auth.disableTFA);


//Rayson's code

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

//import pending
var pending = require('./server/controllers/pending');


// Shopping Cart
app.get('/shopping-cart', products.list);
app.delete('/shopping-cart/:ProductID', products.delete);

// Checkout 
app.get('/checkout', auth.isLoggedIn, checkout.show);
app.post("/checkout/:userID", checkout.insert);

//Pending Page
app.get('/pending', auth.isLoggedIn, pending.show)
app.post("/pendingBankAnswer", pending.answer);

//Confirmations
app.get('/confirmation', auth.isLoggedIn, confirmation.show);

//Items descrip
app.get('/item', auth.isLoggedIn, itemDes.show);
app.post("/item/macbook", auth.isLoggedIn, itemDes.insert);
app.post("/add", auth.isLoggedIn, itemDes.add);

//Done
app.get('/done', auth.isLoggedIn, done.show);


//Wish List
app.get('/wishlist', auth.isLoggedIn, wishList.show)
app.delete('/wishlist/:ProductID', auth.isLoggedIn, wishList.delete);

//Order Tracking
app.get('/order-tracking', auth.isLoggedIn, orderTracking.show)

// io.on('connection',function(socket){
//         // socket.on('send', function(redirectData){
//         //     var destination = redirectData;
//         //     global.destination = destination
//         // });
//         // socket.emit('redirect', destination);
//         console.log("Connected!")
//     });

app.get('/', auth.test)

server.listen(3000);
