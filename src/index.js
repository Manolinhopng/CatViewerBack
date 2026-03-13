const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Restricción de CORS: solo se acepta el origen del frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.static('public'));

// Rate limiting global: 100 peticiones por IP cada 15 minutos
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intenta de nuevo más tarde.' },
});

// Rate limiting estricto para autenticación: 10 intentos por IP cada 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticación, intenta de nuevo más tarde.' },
});

app.use(globalLimiter);

const authRoutes = require('./routes/auth.routes');
const imagesRoutes = require('./routes/images.routes');
const likesRoutes = require('./routes/likes.routes');
const breedLikesRoutes = require('./routes/breedLikes.routes');
const commentsRoutes = require('./routes/comments.routes');

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/like', likesRoutes);
app.use('/api/breedLikes', breedLikesRoutes);
app.use('/api/comments', commentsRoutes);

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});