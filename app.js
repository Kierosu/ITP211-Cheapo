var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var passport = require('passport');
var express = require('express');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
exports.ioC = io;

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
var auctions = require('./server/controllers/auctions');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express session middleware
app.use(session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true
    // cookie: {secure: true}
}))

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.msg = req.flash('msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    res.locals.items = req.items || null;
    next();
});

// Routes
app.use('/', users)
app.use('/items', items)
app.use('/reviews', reviews)
app.use('/reports', reports)
app.use('/auctions', auctions)

app.get('/test', (req, res) => {
    res.render("auctionItem");
})


// io.on('connection', function (socket) {
//     console.log('sss connected');
//     socket.on('testA', (data) => {
//         io.emit('replayFromServer', { msg: data });
//     })
// });

app.use((req, res, next) => {
    res.status(404).render('pagenotfound', { title: "Sorry, page not found" });
    next();
})

howMany = [];
var testAC = io.of('/testAC');
testAC.on('connection', function (socket) {
    howMany.push(socket);
    console.log('Connected: %s sockets connected', howMany.length);

    socket.on('disconnect', (data) => {
        howMany.splice(howMany.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', howMany.length);
    })

    socket.on('testA', (data) => {
        console.log(data);
        testAC.emit('replayFromServer', { msg: data });
    })
});

server.listen(process.env.PORT || 4300);