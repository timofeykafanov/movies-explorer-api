const express = require('express');
const mongoose = require('mongoose');

const { celebrate, Joi } = require('celebrate');

const NotFoundError = require('./errors/NotFoundError');

const {
  createUser,
  login,
  logout,
} = require('./controllers/users');

const { PORT = 3000 } = process.env;

const app = express();

app.listen(PORT);
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
});

app.use('/users', require('./routes/users'));
app.use('/movies', require('./routes/movies'));

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

app.post('/signout', logout);

app.use((req, res, next) => {
  next(new NotFoundError('Такой страницы не существует'));
});

app.use((err, req, res, next) => {
  res
    .status(err.statusCode || 500)
    .send({ message: err.message });
  next();
});