const express = require('express');
const router = express.Router();
const { signup, signin, getProfile } = require('../controllers/auth-controller');
const { verifyToken } = require('../helpers/auth-middleware');

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
