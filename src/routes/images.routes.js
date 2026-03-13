const express = require('express');
const router = express.Router();
const imagesController = require('../controller/images.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

// Guardar registro de imagen subida (requiere autenticación)
router.post('/upload', requireAuth, imagesController.uploadImage);

// Obtener todas las imágenes activas (público - comunidad)
router.get('/all', imagesController.getAllActiveImages);

// Obtener imágenes activas de un usuario (público)
router.get('/active/:user_id', imagesController.getActiveImages);

// Borrado lógico de imagen (requiere autenticación)
router.post('/delete', requireAuth, imagesController.softDeleteImage);

module.exports = router;