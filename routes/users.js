const router = require('express').Router();

const { getUserInfo, updateUserInfo } = require('../controllers/users');

router.get('/me', getUserInfo);
router.patch('/me', updateUserInfo);

module.exports = router;
