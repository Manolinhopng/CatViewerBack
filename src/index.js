const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const imagesRoutes = require('./routes/images.routes');
const likesRoutes = require('./routes/likes.routes');
const breedLikesRoutes = require('./routes/breedLikes.routes');
const commentsRoutes = require('./routes/comments.routes');

app.use('/api/auth', authRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/like', likesRoutes);
app.use('/api/breedLikes', breedLikesRoutes);
app.use('/api/comments', commentsRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});