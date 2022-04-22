const Movie = require('../models/movie');

const getMovies = (req, res) => {
  Movie.find({})
    .then((movies) => res.status(200).send(movies))
    .catch((err) => res.send(err));
};

const addMovie = (req, res) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  })
    .then((movie) => res.status(200).send(movie))
    .catch((err) => res.send(err));
};

const deleteMovie = (req, res) => {
  Movie.findById(req.params._id)
    .onFail(() => {
      res.send('Фильм не найден');
      // throw new NotFoundError('Фильм не найден');
    })
    .then((movie) => {
      movie.remove()
        .then(() => res.status(200).send('Фильм удален'));
    })
    .catch((err) => res.send(err));
};

module.exports = {
  getMovies,
  addMovie,
  deleteMovie,
};
