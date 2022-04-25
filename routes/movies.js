const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { getMovies, addMovie, deleteMovie } = require('../controllers/movies');

router.get('/', getMovies);
router.post('/', addMovie);

router.delete('/_id', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().length(24).hex(),
  }),
}), deleteMovie);

module.exports = router;
