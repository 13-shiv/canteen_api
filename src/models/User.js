 const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type : DataTypes.STRING,
        allowNull:false,

    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
       
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    role:{
        type:DataTypes.ENUM('admin','counter','supervisor','kitchen_master','customer'),
        defaultValue:'customer',
    },
    employee_id:{
        type:DataTypes.STRING(20),  // only for staff members
        allowNull : true,
        unique : true,

    },
    wallet_balance :
    {
        type:DataTypes.DECIMAL(10,2),
        defaultValue: 0.00, 
    },
  
},
    {
        tableName:'users',
        hooks:{
            beforeCreate: async (user)=>{
                if(user.password){
        
                    user.password = await bcrypt.hash(user.password,12);
                }
            }
        }


    });


// Password check karne ka function
User.prototype.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}
module.exports = User;