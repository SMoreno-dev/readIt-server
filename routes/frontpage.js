const express = require('express');
const { getFrontpage } = require('../controllers/frontpage');
const router = express.Router();

//Gets frontpage feed
router.post('/feed', getFrontpage);


module.exports = router;