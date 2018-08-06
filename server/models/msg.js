var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Msg = sequelize.define('Msg', {
    msgID:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    msg:{
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    }, 
    sentby:{
        type: Sequelize.STRING,
        allowNull: false
    },
    sentto:{
        type: Sequelize.STRING,
        dallowNull: false
    }
});

Msg.sync({force: true, logging: console.log}).then(()=>{
    console.log("Msg table synced");
    Msg.upsert({
         msgID : 1 ,
         msg : "message works!" ,
         sentby:  "zuko" ,
         sentto: "Toh",
    }); 
     Msg.upsert({
        msgID : 2 ,
        msg : "hey toph!!" ,
        sentby:  "zuko" ,
        sentto: "toph",
    }); 
    Msg.upsert({
        msgID : 3 ,
        msg : "whts up zuko!!" ,
        sentby:  "toph" ,
        sentto: "zuko",
    }); 
});

module.exports = sequelize.model('Msg', Msg);
