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

Msg.sync({force: false, logging: console.log}).then(()=>{
    console.log("Msg table synced");
    Msg.upsert({
         
    });
});

module.exports = sequelize.model('Msg', Msg);
