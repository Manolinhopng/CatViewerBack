const supabase = require('../lib/supabase');

// Helper para obtener la fecha de inicio según el periodo
function getStartDate(period) {
  const now = new Date();
  if (period === 'week') {
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  }
  if (period === 'month') {
    now.setDate(now.getDate() - 30);
    return now.toISOString();
  }
  return null;
}

// GET /api/breedLikes/top?period=all|month|week&limit=3
exports.getTopBreeds = async (req, res) => {
  const { period = 'all' } = req.query;
  // Sanitizar limit: debe ser un número entero entre 1 y 20
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 3, 1), 20);
  const startDate = getStartDate(period);

  let query = supabase
    .from('breed_likes')
    .select('breed_id, created_at');

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  const { data, error } = await query;
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Contar likes por breed_id
  const likeCounts = {};
  data.forEach(like => {
    likeCounts[like.breed_id] = (likeCounts[like.breed_id] || 0) + 1;
  });

  // Obtener los IDs de las razas más likeadas
  const sorted = Object.entries(likeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  const breedIds = sorted.map(([breed_id]) => breed_id);

  // Obtener los nombres reales de las razas
  let breedsInfo = [];
  if (breedIds.length > 0) {
    const { data: breedsData, error: breedsError } = await supabase
      .from('breeds')
      .select('id, name')
      .in('id', breedIds);
    if (breedsError) {
      return res.status(400).json({ error: breedsError.message });
    }
    breedsInfo = breedsData;
  }

  const topBreeds = sorted.map(([breed_id, likes]) => {
    const breed = breedsInfo.find(b => b.id == breed_id);
    return {
      id: breed_id,
      name: breed ? breed.name : breed_id,
      likes,
    };
  });

  res.json(topBreeds);
};
