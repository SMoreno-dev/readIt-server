const express = require('express');
const router = express.Router();

const { submit, fetchPost, votePost, getPostVotes, deletePost } = require('../controllers/post');

router.post('/new', submit);

router.post('/', fetchPost)

router.post('/vote', votePost)

router.post('/votes', getPostVotes);

router.delete('/', deletePost)

module.exports = router;