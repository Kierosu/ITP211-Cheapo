var express = require('express');
var path = require("path");
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
// ejs template path
app.set('views', path.join(__dirname, 'server/views/pages'));
// view engine setup
app.set('view engine', 'ejs');


app.get('/login', (req, res)=>{
    res.render('Login', {
        title: "Cheapo Login Page"
    });
    console.log("App is running...");
});

app.listen(3000);