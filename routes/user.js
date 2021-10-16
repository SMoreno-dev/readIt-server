const express = require('express');
const router = express.Router();

const { getUserPosts, getSubscriptions } = require('../controllers/user');

//Gets post collection from an user
router.post('/posts', getUserPosts);

//Gets user subscriptions
router.post('/subscriptions', getSubscriptions)
module.exports = router;