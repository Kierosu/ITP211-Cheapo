//get gravatar icon from email
var gravatar = require('gravatar');
//get comments model
var Product = require('../models/products');
var finalProduct = require('../models/finalProducts');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var geoip = require('geoip-lite');
var UserModel = require('../models/user');
var cardDetails = require('../models/cardDetails');
var io = require('../../app');
var ioCheck = io.ioExports;
var EventEmitter = require('events').EventEmitter;
var eventExample = new EventEmitter;
var where = require('node-where');
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyAG6WZ3rbxvBIZqxm0CGXKI1W996iv92JA', // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
  
};
 
var geocoder = NodeGeocoder(options);

exports.feedback = function (req,res){

    var realTotalPrice = 0
    var allObjects = [];

    
    sequelize.query("select finalProductID, sellerId, u.userId, (select username from Users where userId = pd.sellerId) As sellerName,finalProductName, finalProductImage, finalProductPrice, finalProductDescription from finalProducts pd join Users u on pd.UserID = u.userID  where pd.UserID = " + req.user.userID + " order by sellerId", {model: finalProduct}).then((finalproductsName) => { 
            finalproductsName.forEach(function(test){
                var objectTemplate = {};
                //if (req.user.userID == test.userId){
                    objectTemplate["SellerName"] = test.dataValues.sellerName;
                    objectTemplate["Money"] = test.finalProductPrice;
                    allObjects.push(objectTemplate);
                //}
                    
            })
            var sellerMoney = allObjects;
            for (var index in allObjects)
                console.log("Checking items in allObjects " + allObjects[index]["SellerName"]);
            eventExample.emit('price', sellerMoney);
        //add code to put the total price to the database
        var uniqueAcc = [];
        var accExist = false;

		//Set unique Names
		for (var objIndex in sellerMoney){
			//Check unique arr empty
			if(uniqueAcc.length<=0){
				var objTemplate = {};
				objTemplate ["SellerName"] = sellerMoney[objIndex]["SellerName"];
				objTemplate["Money"] = 0
				uniqueAcc.push(objTemplate);
			}
			//Loop through uniqueAcc for names
			for(var uAccIndex in uniqueAcc){
				//If name exist in uniqueAcc, 
				if(sellerMoney[objIndex]["SellerName"] == uniqueAcc[uAccIndex]["SellerName"])
					accExist = true;
			}
			//If account doesnt exist
			if(!accExist){
				var objTemplate = {};
				objTemplate ["SellerName"] = sellerMoney[objIndex]["SellerName"];
				objTemplate["Money"] = 0
				uniqueAcc.push(objTemplate);
			}
			else{
				accExist = false;
			}
		}

		//Add all sums together
		for(var objIndex in sellerMoney){
			for(var uAccIndex in uniqueAcc){
				if (sellerMoney[objIndex]["SellerName"] == uniqueAcc[uAccIndex]["SellerName"]){
					uniqueAcc[uAccIndex]["Money"] += sellerMoney[objIndex]["Money"];
					break;
				}
			}
        }
        
        //add to database
        for(uAccIndex in uniqueAcc){
            //Check Seller Name:
            var seller = uniqueAcc[uAccIndex]["SellerName"];
            var sellerDollars = parseFloat(uniqueAcc[uAccIndex]["Money"]);
            //Add to database using seq
            sequelize.query("update Users set valueRecieved = " + sellerDollars + " where username = '" + seller + "';");
            console.log("Money Sent!")
		}
        console.log('Deleting Final Products Table')
        sequelize.query("delete from finalProducts where UserId = " + req.user.userID);
        });
        
        res.status(200).send({ message: "Successfully released money of " + realTotalPrice + " to seller!"})
    }
exports.show = function (req, res){
    //List all the products
    var coords = {};
    sequelize.query("select p.ProductID, p.ProductName, p.ProductDescription, p.ProductPrice, p.ProductImage, p.UserId from products p left outer join Users u on p.UserId = u.userID where p.UserId = " + req.user.userID, {model: Product}).then((products) => {     
        //sending money socket io
        ioCheck.on('connection', function (socket) {
            console.log("MoneyLoader connected!");
            eventExample.on('price', function(sellerMoney){
                console.log("Money received");
                //Do something with someData
                console.log(sellerMoney[0]);
                socket.emit('receiveMoney', sellerMoney);
            });
        });

        sequelize.query("select shippingAddress from cardDetails where userID =" + req.user.userID, {model: cardDetails}).then((cardDetails) => {
        //Ip to lon and lat
        var shippingAddress = "";
        cardDetails.forEach(function(i, idx, CardData){
            if (idx === CardData.length - 1)
            {
                var realAdd = i.shippingAddress; //getting last cardid
                shippingAddress = realAdd
                // console.log("Last Shipping Address: " + shippingAddress);
            }
        });
        console.log("Last Shipping Address: " + shippingAddress);
        // where.is(shippingAddress, function(err, result) {
        // if (result) {
        //     console.log('Address: ' + result.get('address'));
        //     console.log('Street: ' + result.get('street'));
        //     console.log('Full Street: ' + result.get('streetAddress'));
        //     console.log('City: ' + result.get('city'));
        //     console.log('Country: ' + result.get('country'));
        //     console.log('Country Code: ' + result.get('countryCode'));
        //     coords.shippingAddressLatitude = result.get('lat');
        //     coords.shippingAddressLongitude = result.get('lng');
        // }
        // });
        geocoder.geocode(shippingAddress)
        .then(function(res) {
            console.log(res);
            res.forEach(function(check){
                console.log("this is the latitude: " + check.latitude)
                coords.shippingAddressLatitude = check.latitude;
                coords.shippingAddressLongitude = check.longitude;

            });
            ioCheck.on('connection', function (socket) {
                console.log("Sending Longitude and Lati")
                socket.emit('sendingCoords', coords);
            });
        })
        .catch(function(err) {
            console.log(err);
        });
    });

        var ip = "183.90.37.120";
        var geo = geoip.lookup(ip);
        geoip.startWatchingDataUpdate();

        console.log(geo);
        var myLatitude = parseFloat(geo.ll[0]);
        var myLongitude = parseFloat(geo.ll[1]);
        var myCity = geo.city;

        //Calculating product total value
        var totalPrice = 0;
        var shippingFee = 0;
        var stripeTotal = 0;
        var realQuantity = 0;

        products.forEach(function(rayson) {
            totalPrice += rayson.ProductPrice;
            realQuantity += 1;
        });
        if (totalPrice >50){
            subtotal = totalPrice;
            stripeTotal = totalPrice;
        } else{
            subtotal = totalPrice;
            totalPrice += 5.00;
            shippingFee = 5.00;
            stripeTotal = totalPrice;
        }
        var id = req.params.userID;
        UserModel.findById(id).then(function() {
            res.render('orderTracking', {
                title: 'Cheapo - Track Your Orders',
                avatar: req.protocol + "://" + req.get("host") + '/img/' + req.user.profilePic,
                username : req.user.username,
                email: req.user.email,
                userID: req.user.userID,
                dateJoined: req.user.joinDate,
                type: req.user.userType,
                membership: req.user.membership,
                req: req,
                myCity: myCity,
                realQuantity: realQuantity,
                myLatitude: myLatitude,
                myLongitude: myLongitude,
                products: products,
                total: totalPrice,
                stripeTotal: stripeTotal * 100,
                shippingFee: shippingFee,
                subtotal: subtotal,
                gravatar: gravatar.url({ s: '80', r: 'x', d: 'retro'}, true),
                hostPath: req.protocol + "://" + req.get("host"),
                urlPath: req.protocol + "://" + req.get('host') + req.url
            });
        }).catch((err) => {
            return res.status(400).send({
                message: err
            });
        });
    });
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