const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(bodyParser.json());
app.use(express.static('public')); // Папка с html, css, js

// Чтение пользователей из файла
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Запись пользователей в файл
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Регистрация
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;

  // Валидация
  if (
    typeof username !== 'string' || username.length < 3 ||
    typeof email !== 'string' || !email.includes('@') ||
    typeof password !== 'string' || password.length < 6
  ) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
  }

  users.push({ username, email, password }); // В реальном приложении пароль нужно хешировать!
  writeUsers(users);

  res.json({ message: 'Регистрация успешна' });
});

// Авторизация
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
  }

  // Возвращаем данные пользователя (без пароля)
  res.json({ username: user.username, email: user.email });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
