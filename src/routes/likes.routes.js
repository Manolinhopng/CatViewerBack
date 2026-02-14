const express = require('express');
const router = express.Router();
const likesController = require('../controller/likes.controller');

// Obtener número de likes de una imagen
router.get('/:image_id', likesController.getLikesCount);
// Toggle like
router.post('/toggle', likesController.toggleLike);

module.exports = router; 