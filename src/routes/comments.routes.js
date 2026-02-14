const express = require('express');
const router = express.Router();
const commentsController = require('../controller/comments.controller');

// Obtener comentarios de una raza específica
router.get('/', commentsController.getComments);

// Crear un nuevo comentario
router.post('/', commentsController.createComment);

// Actualizar un comentario
router.put('/:id', commentsController.updateComment);

// Eliminar un comentario
router.delete('/:id', commentsController.deleteComment);

// Toggle like en un comentario
router.post('/like', commentsController.toggleCommentLike);

module.exports = router; 