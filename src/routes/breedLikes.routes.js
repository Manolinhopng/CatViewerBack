const express = require('express');
const router = express.Router();
const likesBreedController = require('../controller/likesBreed.controller');

// Alternar like para una raza
router.post('/toggle', likesBreedController.toggleBreedLike);
// Obtener número de likes de una raza
router.get('/:breed_id', likesBreedController.getBreedLikes);

module.exports = router;