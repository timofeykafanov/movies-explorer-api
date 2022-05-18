const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');

const NotFoundError = require('./errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3001, MONGO_ADDRESS = 'mongodb://localhost:27017/moviesdb' } = process.env;

const app = express();

app.use((req, res, next) => {
  const allowedCors = [
    'localhost:3000',
    'http://localhost:3000',
  ];
  const { origin } = req.headers;
  const { method } = req;
  const requestHeaders = req.headers['access-control-request-headers'];

  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', requestHeaders);
    return res.end();
  }

  next();
  return true;
});

app.use(cookieParser());

app.listen(PORT);
app.use(express.json());

mongoose.connect(`${MONGO_ADDRESS}`, {
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
