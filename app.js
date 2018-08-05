const express = require("express");
var { auctionEXP } = require('./server/controllers/sendMails');
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const multer = require('multer');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server); 
var Msg = require('./server/models/msg'); 
var user = require("./server/controllers/usercontroller")
var connectedUsers = {};
var dict = [];
exports.ioExports = io;

const upload = multer({ dest: './public/uploads/', limits: { fileSize: 1000000, files: 1 } });

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

// Global variables
app.use((req, res, next) => {
    res.locals.msg = req.flash('msg');
    res.locals.error = req.flash('error');
    res.locals.loginuser = req.user || null;
    res.locals.items = req.items || null;
    next();
});

// Matthew's codes
var auctions = require('./server/controllers/auction');
var reviews = require('./server/controllers/review');
var reports = require('./server/controllers/report');
var items = require('./server/controllers/items');
var mail = require('./server/controllers/mail');

app.use('/items', items);
app.use('/reviews', reviews);
app.use('/reports', reports);
app.use('/auctions', auctions);
app.use('/mail', mail);

//Eugene's code
// Logout Page
app.get('/logout', auth.logout);

app.get('/login', auth.loginCheck, auth.signin);
app.post('/login', passport.authenticate('local-login', {
    failureRedirect: '/',
    failureFlash: true
}), function (req, res) {
    res.status(200).send({ message: req.user.TwoFA });
}
);

app.post('/verifyOTP', auth.verifyOTP);
app.post('/noLoginVerifyOTP', auth.noLoginVerifyOTP);

app.get('/signup', auth.isLoggedInV2, auth.signup);
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));

app.post('/checkTFA', auth.checkTFA);
app.post('/noLogincheckTFA', auth.noLogincheckTFA);

app.get('/profile/:username', auth.isLoggedIn, auth.profilepage);

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
app.post('/changePassword', auth.isLoggedIn, auth.savePassword);

//2-Factor Auth
app.get('/2FA', auth.isLoggedIn, auth.TwoFactorAuth);
app.post('/googleauth', auth.isLoggedIn, auth.saveGoogleAuth);
app.post('/disableTFA', auth.isLoggedIn, auth.disableTFA);

//Google Sign In
app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        var day = 86400000;
        req.session.cookie.expires = new Date(Date.now() + day);
        req.session.cookie.maxAge = day;
        res.redirect('/');
    });

//Rayson's code

// Set Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads',
    filesname: function (req, file, cb) {
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

//import driver page
var driver = require('./server/controllers/driver');

//import done 
var done = require('./server/controllers/done');

//import wishlist
var wishList = require('./server/controllers/wishList');

//import order tracking
var orderTracking = require('./server/controllers/orderTracking');

//import pending
var pending = require('./server/controllers/pending');

// Shopping Cart
app.get('/shopping-cart', auth.isLoggedIn, products.list);
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

//Driver 
app.get('/driver-incomplete', driver.show);
app.get('/driver-complete', driver.com)
app.post('/remove', driver.remove);

//Wish List
app.get('/wishlist', auth.isLoggedIn, wishList.show)
app.delete('/wishlist/:ProductID', auth.isLoggedIn, wishList.delete);
app.post('/wishlist-Add/:ProductID', auth.isLoggedIn, wishList.addItems);

//Order Tracking
app.get('/order-tracking', auth.isLoggedIn, orderTracking.show)
app.post('/feedback', auth.isLoggedIn, orderTracking.feedback)

app.get('/', auth.index);  
// shafie's code, will change later, so i comment for now. 
 
 
 
app.get('/chat', user.list) 
 
io.sockets.on('connection', function(socket)  { 
    
     //auto get username when button clicked 
    socket.on('new_message', function(data)   {
        // feedback.html('');
        // message.val(''); 
        io.sockets.emit('messagenew', {msg: data})
        
    })
    socket.on('chat', (data) => {
        socket.username = data.username
    }) 
    connectedUsers[socket.username] = socket;
    console.log('New user connected. Username: ' + socket.username + 'SocketID: ' + socket.id);  
     
     // remove user info when disconnect to prevent duplicates
    socket.on('disconnect', function()  { 
         
        delete connectedUsers[socket.id];
     });
});
 
app.post('/chat', function (req, res)  { 
    var chatData  = { 
        username : req.body.username, 
        message : req.body.message, 
        sentby : req.body.username, 
        sentto : req.body.sentto, 
    }    
    
    Msg.create(chatData).then((newMessage) =>{ 
        if (!newMessage){ 
            sendStatus(500);
        } 
        io.to(connectedUsers[username]).emit('message', req.body) 
        io.to(connectedUsers[sentto]).emit('message', req.body) 
        res.sendStatus(200)
    })
});
// Teh Yang's code

// Import Item Posting controller
var itemPost = require('./server/controllers/itemPost');
var index = require('./server/controllers/index');

// Creating Items
app.get('/sellDetails', auth.isLoggedIn, itemPost.postItem);
app.post('/posting', upload.single('image'), itemPost.create);

// Show Created Items
app.get('/itemPosted', itemPost.list);
app.get('/itemProduct/:imageId', auth.isLoggedIn, itemPost.showitem);

// Item Edit and Delete
app.get('/editProduct/:id', auth.isLoggedIn, itemPost.editProduct);
app.post('/edit/:id', auth.isLoggedIn, upload.single('image'), itemPost.update);

// Test Specified User Items
app.get('/userItems', auth.isLoggedIn, auctionEXP, itemPost.show);
app.delete('/itemPosted/:item_id', itemPost.delete);

// Search
app.get('/search', itemPost.list);
app.post('/search', itemPost.list);

app.use((req, res, next) => {
    res.status(404).redirect('/');
    next();
})

server.listen(3000);
