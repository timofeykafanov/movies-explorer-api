const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');

const NotFoundError = require('./errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000, MONGO_ADDRESS = 'localhost:27017/moviesdb' } = process.env;

const app = express();

app.use(cookieParser());

app.listen(PORT);
app.use(express.json());

mongoose.connect(`mongodb://${MONGO_ADDRESS}`, {
  useNewUrlParser: true,
});

app.use(requestLogger);

app.use(require('./routes/index'));

app.use((req, res, next) => {
  next(new NotFoundError('Такой страницы не существует'));
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  res
    .status(err.statusCode || 500)
    .send({ message: 'Ошибка на стороне сервера' });
  next();
});
