const express = require('express');
const router = express.Router();
const imagesController = require('../controller/images.controller');

// Guardar registro de imagen subida
router.post('/upload', imagesController.uploadImage);
// Obtener imágenes activas de un usuario
router.get('/active/:user_id', imagesController.getActiveImages);
// Borrado lógico de imagen
router.post('/delete', imagesController.softDeleteImage);

module.exports = router; 