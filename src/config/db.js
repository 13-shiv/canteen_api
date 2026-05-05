const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  'canteen_db',
  'root',
  '1234',
  {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    await sequelize.sync({ force : false });   // alter : true  in db again n again index is created and db storage is full
    console.log('Tables ready!');
  } catch (error) {
    console.error('❌ DB Error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };