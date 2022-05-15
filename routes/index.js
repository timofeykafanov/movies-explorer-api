const router = require('express').Router();

const auth = require('../middlewares/auth');

router.use(require('./auth'));

router.use(auth);

router.use(require('./users'));
router.use(require('./movies'));

module.exports = router;
