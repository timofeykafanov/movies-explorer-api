const User = require('../models/user');

const getUserInfo = (req, res) => {
  User.find({})
    .then((user) => res.status(200).send(user))
    .catch((err) => res.send(err));
};

const updateUserInfo = (req, res) => {
  const { email, name } = req.body;

  User.findByIdAndUpdate(req.user._id, { email, name }, { runValidators: true, new: true })
    .orFail(() => {
      res.send('Пользователь не найден');
      // throw new NotFoundError('Пользователь не найден');
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => res.send(err));
};

module.exports = {
  getUserInfo,
  updateUserInfo,
};
