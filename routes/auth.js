const express = require('express');
const router = express.Router();

const validInfo = require('../utils/validInfo');

const { signUp, signIn } = require('../controllers/auth');

//Sign Up
router.post('/signup', validInfo, signUp);

//Sign In
router.post('/signin', validInfo, signIn);

module.exports = router;