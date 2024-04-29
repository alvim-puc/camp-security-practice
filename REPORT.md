Para começar:

- Editei o modelo User para gerar um hashcode para a senha usando a biblioteca bcrypt, assim a senha que o usuário insere não é divulgada em outras partes do codigo.

antes:
```js
const Sequelize = require('sequelize');
const sequelize = require('../sequelize');
const bcrypt = require('bcrypt');

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
});

module.exports = User;
```
depois:
```js
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
```
- Também mudei algumas configurações do sequelize para testar meu db criado no `elephantsql`

antes:
```js
// sequelize.js
require('dotenv/config'); // Load environment variables from .env file

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  dialect: 'postgres',
  port: 5432
});

module.exports = sequelize;
```
depois:
```js
// sequelize.js
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
```
- Por fim, em `index.js`, fiz algumas alterações básicas de segurança como comparar a senha fornecida com o hashcode e não com a senha original do usuario e também não fornecer dados importantes/sensíveis como id e senha de usuarios

antes: 
```js
// index.js
const express = require('express');
const bodyParser = require('body-parser');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Endpoint de login (vulnerável a SQL Injection)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username, password } });
  if (user) {
    res.json({ message: 'Login successful', user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Endpoint de listagem de usuários (expondo dados sensíveis)
app.get('/users', async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'username', 'password'] });
  res.json(users);
});

// Endpoint de detalhe do usuário logado (expondo senha)
app.get('/profile', async (req, res) => {
  const { username } = req.query;
  const user = await User.findOne({ where: { username: username ?? null } });
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```
depois:
```js
// index.js
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username, password } });
  if (bcrypt.compare(password, user.password)) {
    res.json({ message: 'Login successful', username });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/users', async (req, res) => {
  const users = await User.findAll({ attributes: ['username'] });
  res.json(users);
});

app.get('/profile', async (req, res) => {
  const { username } = req.query;
  const user = await User.findOne({ where: { username: username ?? null } });
  if (user) {
    res.json(user.username);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```
