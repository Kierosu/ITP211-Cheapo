var { ensureAuthenticated } = require('./server/config/auth');
var db = require('./server/controllers/database');
var cookieParser = require('cookie-parser');
var Item = require('./server/models/items');
var session = require('express-session');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var passport = require('passport');
var express = require('express');
var multer = require('multer')
var sequelize = db.sequelize;
var path = require('path');
var app = express();

// Staticfolder
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'server/views/pages/'));
app.set('view engine', 'ejs');

// Passport Config
require('./server/config/passport')(passport);

// Import controllers

var reviews = require('./server/controllers/review');
var reports = require('./server/controllers/report');
var users = require('./server/controllers/users');
var items = require('./server/controllers/items');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
    //cookie: {secure: true}
}))

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variables
app.use(function (req, res, next) {
    res.locals.msg = req.flash('msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    res.locals.error = req.flash('error');
    res.locals.items = req.items || null;
    next();
});

// Routes
app.get('/', (req, res) => {
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
})

app.get('/login', users.showlogin);
app.post('/login', users.login);
app.get('/register', users.showregister);
app.post('/register', users.register);
app.get('/logout', ensureAuthenticated, users.userlogout);
app.get('/user/edit/:id', ensureAuthenticated, users.editpage);
app.post('/user/edit/:id', ensureAuthenticated, users.edit);
app.get('/user/delete/:id', ensureAuthenticated, users.delete);

app.use('/items', items)
app.use('/reviews', reviews)
app.use('/reports', reports)

app.get('/test', (req, res) => {
    res.render('test', {
        a: 1
    })
})

app.listen(4300);