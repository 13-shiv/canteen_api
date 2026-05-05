const {DataTypes} = require('sequelize')
const {sequelize} =require('../config/db');
const User = require('../models/User')
const { MenuItems } = require('../models/Menu')

const Orders = sequelize.define( 'orders', {
    id :{
        type:DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement :true,

    },
    user_id : {
    type : DataTypes.INTEGER,
    allowNull : false,

    },
     total:
    {
        type:DataTypes.DECIMAL(10,2),
        allowNull : false,
        defaultValue :0 ,
    },
    status :
    {
        type : DataTypes.ENUM(
            'pending',
            'confirmed',
            'preparing',
            'ready',
            'delivered',
            'cancelled',
        ),
        defaultValue : 'pending'
        
    },

      payment_status: {
      type: DataTypes.ENUM('unpaid', 'paid'),
      defaultValue: 'unpaid',
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
},
    {
        tableName: 'orders',
        timestamps : true,
        underscored : true,
    },
)

// ORder Items
const OrderItems = sequelize.define( 'order_items' , {
    id :{
        type : DataTypes.INTEGER,
        primaryKey : true,
       autoIncrement : true,
    },

    order_id : {
        type:DataTypes.INTEGER,
        allowNull : false,
    },
    menu_item_id:{
        type: DataTypes.INTEGER,
        allowNull :false,

    },
    quantity : {
        type:DataTypes.INTEGER,
        allowNull : false,
    },
    price :{
        type : DataTypes.DECIMAL(10 , 2),
        allowNull : false
    },
    total_price : 
    {
        type : DataTypes.DECIMAL(10 , 2),
        allowNull : false,
    },
},
{
    tableName : 'order_items',
    timestamps : true,
    underscored : true,
})

// Relations : user-order
User.hasMany(Orders,{foreignKey : 'user_id',  as : 'users'});
Orders.belongsTo(User, {foreignKey : 'user_id' , as : 'customer'});

//order- order_items
Orders.hasMany(OrderItems, {foreignKey : 'order_id' , as : 'items'});
OrderItems.belongsTo(Orders, {foreignKey : 'order_id' });

MenuItems.hasMany(OrderItems,  {foreignKey : 'menu_item_id' });
OrderItems.belongsTo(MenuItems, {foreignKey : 'menu_item_id' , as: 'menuItem' });

module.exports ={Orders , OrderItems}





