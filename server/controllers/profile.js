var passport = require('passport');
var fs = require('fs');
var UserModel = require('../models/user');
var myDatabase = require('./database');
var sequelizeInstance = myDatabase.sequelizeInstance;
var generatePassword = require('password-generator');
var nodemailer = require('nodemailer');
// set images file types
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

// Signup 
exports.signup = function(req, res) {
    res.render('Signup', {
        title: "Cheapo - SignUp Page",
        message: req.flash('signupMessage'), 
        req: req
    });
};
// Signin 
exports.signin = function(req, res) {
    res.render('Login', {
        title: "Cheapo - Login Page",
        message: req.flash('loginMessage'),
        req: req
    });
};
// Profile 
exports.profilepage = function(req, res) {
    var id = req.params.userID;
    UserModel.findById(id).then(function(){
        res.render('Profile', { 
        title: 'Cheapo - ' + req.user.username + '\'s Profile',
        avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
        username : req.user.username,
        email: req.user.email,
        userID: req.user.userID,
        dateJoined: req.user.joinDate,
        type: req.user.userType,
        membership: req.user.membership,
        req: req
    });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
    
};
// Logout 
exports.logout = function (req, res) {
    req.logout();
    req.session.destroy(()=>{
        res.redirect('/login');
    })   
};

// check if user is logged in
exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }    
    res.redirect('/login');
};
exports.isLoggedInV2 = function(req,res,next) {
    if (!req.isAuthenticated()){
        return next();    
    }
    res.redirect('/profile');
};

// Edit profile page
exports.editProfile = (req, res)=>{
    var id = req.params.userID;
    UserModel.findById(id).then(function(){
        res.render('EditProfilePic', { 
        title: 'Cheapo - Edit Profile Picture',
        avatarTemp: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
        avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
        username : req.user.username,
        hostPath: req.protocol + "://" + req.get("host"),
        req: req
    });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
}

//Upload (but not save) the image
exports.uploadImage = function (req, res){
    var src;
    var dest;
    var targetPath;
    var tempPath = req.file.path;
    console.log(req.file);
    //get the mime type of the file
    var type = req.file.mimetype
    console.log(req.file.mimetype);
    //get file extension
    var extension = req.file.path.split(/[. ]+/).pop();
    //Check support file type
    if (IMAGE_TYPES.indexOf(type) == -1){
        return res.status(415).send('Supported image formats:  jpeg, jpg, jpe, png.');
    }
    //Set new path to images
    targetPath = './public/img/' + req.file.originalname;
    //using a read stream API to read file
    src = fs.createReadStream(tempPath);
    // using a write stream API to write file
    dest = fs.createWriteStream(targetPath);
    src.pipe(dest);
    //Show error
    src.on('error', function(err){
        if(err){
            return res.status(500).send({
                message: error
            });
        }
    });
    res.redirect('/edit/profilepicture')
}

//Save profile
exports.saveChanges = (req,res)=>{
    var id = req.user.userID;
    var updateProfile = {
        profilePic: req.body.profilePic
    }
    UserModel.update(updateProfile, { where: { userID: id } }).then((updatedRecord)=>{
        if (!updatedRecord || updatedRecord == 0){
            return res.status(400).send({ message: "error"});
        }
        res.status(200).send({message: "Updated profile picture for user: "+ id});
    })
}

//Forget password page
exports.forgetPass = (req,res)=>{
    res.render('ForgetPass', {
        title: "Cheapo - Forget password",
        req: req
    })
}

exports.checkUserEmail = (req,res)=>{
    UserModel.findOne({where: {username: req.body.username} }).then(function(user){
        if(user.email == req.body.email){
            var randompass = generatePassword(12, false);
            var newpass = {
                password: randompass
            }
            UserModel.update(newpass, { where: { userID: user.userID } }).then(()=>{
                // Generate test SMTP service account from ethereal.email
                // Only needed if you don't have a real mail account for testing
                nodemailer.createTestAccount((err, account) => {
                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.ethereal.email',
                        port: 3000,
                        secure: false, // true for 465, false for other ports
                        auth: {
                            user: account.user, // generated ethereal user
                            pass: account.pass // generated ethereal password
                        }
                    });

                    // setup email data with unicode symbols
                    let mailOptions = {
                        from: '"Cheapo Eshop" <foo@example.com>', // sender address
                        to: 'bar@example.com, baz@example.com', // list of receivers
                        subject: 'Password Recovery', // Subject line
                        text: 'Hello world?', // plain text body
                        html: '<b>Hello world?</b>' // html body
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: %s', info.messageId);
                        // Preview only available when sending through an Ethereal account
                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                    });
                });
            })
            res.status(200).send({message: "New password sent! " + randompass});       
        }
        else if(user.email != req.body.email){
            UserModel.findOne({where: {email: req.body.email} }).then(function(user2){
                if(user2){
                    res.status(400).send( "Username and Email does not match!" );      
                }
                else{
                    res.status(400).send( "This Email does not have an account!" ); 
                }
            });
        }
    }).catch(()=>{
        UserModel.findOne({where: {email: req.body.email} }).then(function(user2){
            if(user2){
                res.status(400).send("Username and Email does not match!" );      
            }
            else{
                res.status(400).send("Username not found!"); 
            }
        });
    })    
}

//Test
exports.test = function(req,res){
    if(req.user){
        res.render('template',{
            title: "Just A Test",
            avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
            username : req.user.username,
            req: req
            })        
    }else{
        res.render('template',{
            title: "Just A Test",
            req: req
        })
    }
    
}