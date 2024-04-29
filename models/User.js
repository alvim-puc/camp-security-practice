// models/User.js
const Sequelize = require('sequelize');
const sequelize = require('../sequelize');
const bcrypt = require('bcrypt');

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
}, {
  hooks: {
    beforeCreate: async (user) => {
      const hashpwd = await bcrypt.hash(user.password, await bcrypt.genSalt(10));
      user.password = hashpwd;
    }
  }
});

module.exports = User;
