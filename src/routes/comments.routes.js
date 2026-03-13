const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const commentsController = require('../controller/comments.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validate.middleware');

const commentValidators = [
  body('text').isString().trim().isLength({ min: 1, max: 2000 }).withMessage('El texto debe tener entre 1 y 2000 caracteres'),
  body('image_url').optional({ nullable: true }).isURL().withMessage('image_url debe ser una URL válida'),
  handleValidationErrors,
];

// Obtener comentarios de una raza (público)
router.get('/', commentsController.getComments);

// Crear un nuevo comentario (requiere autenticación)
router.post('/', requireAuth, commentValidators, commentsController.createComment);

// Actualizar un comentario (requiere autenticación)
router.put('/:id', requireAuth, commentsController.updateComment);

// Eliminar un comentario (requiere autenticación)
router.delete('/:id', requireAuth, commentsController.deleteComment);

// Toggle like en un comentario (requiere autenticación)
router.post('/like', requireAuth, commentsController.toggleCommentLike);

module.exports = router;