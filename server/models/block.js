var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Block = sequelize.define('Block', {
    BlockID:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    
    blockedby:{
        type: Sequelize.STRING,
        allowNull: false
    },
    blockeduser:{
        type: Sequelize.STRING,
        dallowNull: false
    }
});

Block.sync({force: true, logging: console.log}).then(()=>{
    console.log("Block table synced");
    Block.upsert({
         BlockID : 1 ,
         msg : "message works!" ,
         blockedby:  "zuko" ,
         blockeduser: "appa",
    });
});

module.exports = sequelize.model('Block', Block);
