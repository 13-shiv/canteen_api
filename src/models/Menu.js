const DataTypes = require('sequelize');
const {sequelize} =require('../config/db');

const Menus = sequelize.define('menus',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    description :{
        type:DataTypes.STRING,
        allowNull:true,
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        defaultValue : true,

    }
},{
    tableName:'menus',
    timestamps: true,
    underscored: true,
}
);
// ── TABLE 2: SUBMENUS ────────────────────────
const SubMenus = sequelize.define('subMenus',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    menu_id:{
        type:DataTypes.INTEGER,
        allowNull:false,

    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
     is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
 },{
    tableName:'subMenus',
    timestamps: true,
    underscored: true,

 });  


 // ── TABLE 3: MENU ITEMS ──────────────────────
const MenuItems = sequelize.define('menu_items',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    submenu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    quantity:{
      type:DataTypes.INTEGER,
      allowNull : false,
      defaultValue : 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
     image:{
      type:DataTypes.STRING,
      allowNull:false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_vegetarian: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'menu_items',
    timestamps: true,
    underscored: true,
  }
);

// Associations
//menus - submenus
Menus.hasMany(SubMenus,{foreignKey :'menu_id', as:'submenus'})
SubMenus.belongsTo(Menus ,{foreignKey : 'menu_id' , as : 'menu'});

//submenus - menu items

SubMenus.hasMany(MenuItems,{foreignKey:'submenu_id',as:'items'})
MenuItems.belongsTo(SubMenus,{foreignKey: 'submenu_id', as: 'submenu'})

module.exports={ Menus, SubMenus, MenuItems };

    
