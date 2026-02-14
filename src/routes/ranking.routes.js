const express = require('express');
const router = express.Router();
const rankingController = require('../controller/ranking.controller');

// ...
router.get('/top', rankingController.getTopBreeds);

module.exports = router;
