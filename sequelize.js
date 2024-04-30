require('dotenv/config'); 
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.url);

module.exports = sequelize;