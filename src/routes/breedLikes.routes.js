const express = require('express');
const router = express.Router();
const likesBreedController = require('../controller/likesBreed.controller');
const rankingController = require('../controller/ranking.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

// Ranking top razas por período (público, debe ir ANTES del wildcard /:breed_id)
router.get('/top', rankingController.getTopBreeds);

// Alternar like para una raza (requiere autenticación)
router.post('/toggle', requireAuth, likesBreedController.toggleBreedLike);

// Obtener número de likes de una raza (público)
router.get('/:breed_id', likesBreedController.getBreedLikes);

module.exports = router;