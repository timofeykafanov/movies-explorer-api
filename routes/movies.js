const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { getMovies, addMovie, deleteMovie } = require('../controllers/movies');

router.get('/movies', getMovies);
router.post('/movies', addMovie);

router.delete('/movies/_id', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().length(24).hex(),
  }),
}), deleteMovie);

module.exports = router;
