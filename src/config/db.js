require('dotenv').config({path: '../../.env'});
const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(process.env.MYSQL_URL, {
  dialect: 'mysql',
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected!');
    await sequelize.sync({ force: false });
    console.log('✅ Tables ready!');
  } catch (error) {
    console.error('❌ DB Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };