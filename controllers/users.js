const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const NotFoundError = require('../errors/NotFoundError');
const DataError = require('../errors/DataError');
const EmailError = require('../errors/EmailError');
const AuthError = require('../errors/AuthError');

const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('Пользователь с таким id не найден');
    })
    .then((user) => res.status(200).send(user))
    .catch(next);
};

const updateUserInfo = (req, res, next) => {
  const { email, name } = req.body;

  User.findOne({ email })
    .then((response) => {
      if (response) {
        throw new EmailError('Пользователь с таким email уже существует');
      }
      User.findByIdAndUpdate(req.user._id, { email, name }, { runValidators: true, new: true })
        .orFail(() => {
          throw new NotFoundError('Пользователь не найден');
        })
        .then((user) => res.status(200).send(user))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new DataError('Переданы некорректные данные'));
          } else {
            next(err);
          }
        });
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new EmailError('Пользователь с таким email уже существует');
      }
      return bcrypt.hash(password, 10)
        .then((hash) => User.create({
          name,
          email,
          password: hash,
        }))
        .then((newUser) => {
          const token = jwt.sign({ _id: newUser._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
          res
            .cookie('jwt', token, {
              maxAge: 3600000 * 24 * 7,
              httpOnly: true,
              secure: true,
              sameSite: 'none',
            })
            .status(200).send({
              _id: newUser._id,
              email: newUser.email,
              name: newUser.name,
            });
        });
    })
    .catch((err) => {
      if (err.statusCode === 400) {
        next(new DataError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthError('Неверный логин или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new AuthError('Неверный логин или пароль');
          }
          const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
          res
            .cookie('jwt', token, {
              maxAge: 3600000 * 24 * 7,
              httpOnly: true,
              secure: true,
              sameSite: 'none',
            })
            .status(200)
            .send({
              _id: user._id,
              email: user.email,
              name: user.name,
            });
        })
        .catch(next);
    });
};

const logout = (req, res) => {
  res
    .cookie('jwt', 'jwt.token.revoked', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: -1,
    })
    .send({ message: 'Сессия завершена' });
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  createUser,
  login,
  logout,
};
