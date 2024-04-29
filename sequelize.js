require('dotenv/config'); // Load environment variables from .env file

const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    dialect: 'postgres',
    port: process.env.PORT,
    host: process.env.DB_HOST,
  }
);

module.exports = sequelize;