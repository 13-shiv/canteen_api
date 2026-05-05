const { DataTypes, ForeignKeyConstraintError } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User')

const WalletTransaction = sequelize.define('WalletTransaction',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,       
    },
    type: {
      type: DataTypes.ENUM('credit', 'debit', 'refund'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    balance_before: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,       
    },
    balance_after: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,       
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,        
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,        
    done_by: {
      type: DataTypes.INTEGER,
      allowNull: true,        //  admin/supervisor
    },
  },
},
  {
    tableName: 'wallet_transactions',
    timestamps: true,
    underscored: true,
  });

  User.hasMany(WalletTransaction ,{foreignKey : 'user_id', as : 'walletTransaction'})
  WalletTransaction.belongsTo(User, {foreignKey : 'user_id', as : 'customer'})

module.exports = WalletTransaction;