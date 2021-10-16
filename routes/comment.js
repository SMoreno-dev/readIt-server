const express = require('express');
const router = express.Router();

const { getComments, getReplies, submitComment, submitReply, deleteComment } = require('../controllers/comment');

//Comments
router.post('/list', getComments);
router.post('/new', submitComment);
router.delete('/', deleteComment);

//"Replies", which are simply responses to comments
router.post('/replies/list', getReplies);
router.post('/replies/new', submitReply);



module.exports = router;