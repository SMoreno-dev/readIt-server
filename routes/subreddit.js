const express = require('express');
const router = express.Router();

const { subscription, getSubredditData, getSubredditList, getPreviews } = require ('../controllers/subreddit');

//Subscribes to subreddit
router.post('/subscribe', subscription);

//Returns Subreddit Data
router.post('/data', getSubredditData);

//Returns Subreddit List
router.get('/list', getSubredditList);

//Returns post feed
router.post('/feed', getPreviews);

module.exports = router;