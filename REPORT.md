Para começar:

- Mudei algumas configurações do sequelize para testar meu db criado no `elephantsql`

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
require('dotenv/config'); 
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.url); //essa é a url do meu banco, nn é muito bacana sair mostrando ela assim né kskskskks

module.exports = sequelize;
```
- Psteriormente, em `index.js`, fiz algumas alterações básicas de segurança como não fornecer dados importantes/sensíveis como id e senha de usuarios

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
const PORT = 3333;

app.use(bodyParser.json());

User.sync({force: true}).then( () => console.log('tabela criada')).catch( () => console.log('error')) //aqui eu synquei o banco com a tabela (valeu Pedrao monitor!)

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username: username, password: password } });
  if (user) {
    res.json({ message: 'Login successful', username }); //update: tirei o objeto user, assim a senha não é vazada.
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});


app.get('/users', async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'username'] }); //aqui só removi a senha dos atributo, pois o id e o username já bastam para identificar um usuario
  res.json(users);
});

app.get('/profile', async (req, res) => {
  const { username } = req.query;
  const user = await User.findOne({ where: { username: username ?? null } });
  if (user) {
    res.json(username); //aqui eu passo só o username pois, caso eu passasse o objeto user, a saída seria assim: {"id":1,"username":"user1","password":"password1","createdAt":"2024-04-30T21:17:38.815Z","updatedAt":"2024-04-30T21:17:38.815Z"}, quando, na realidade, deveria ser assim: "user1"
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```
