const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InventoryHistory = sequelize.define('InventoryHistory',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    menu_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('add', 'deduct', 'adjustment'),
      allowNull: false,
     
    },
    quantity_before: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity_changed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity_after: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,        // ← "Order #12 deduction"
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    done_by: {
      type: DataTypes.INTEGER,
      allowNull: false,       
    },
  },
  {
    tableName: 'inventory_history',
    timestamps: true,
    underscored: true,
  }
);

module.exports = InventoryHistory;