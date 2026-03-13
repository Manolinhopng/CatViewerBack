const express = require('express');
const router = express.Router();
const likesController = require('../controller/likes.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

// Obtener número de likes de una imagen (público)
router.get('/:image_id', likesController.getLikesCount);

// Toggle like (requiere autenticación)
router.post('/toggle', requireAuth, likesController.toggleLike);

module.exports = router;