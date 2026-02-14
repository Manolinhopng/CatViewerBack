const supabase = require('../lib/supabase');

// Toggle like para una raza
exports.toggleBreedLike = async (req, res) => {
  const { user_id, breed_id } = req.body;

  // Verifica si ya existe el like
  const { data, error } = await supabase
    .from('breed_likes')
    .select('id')
    .eq('user_id', user_id)
    .eq('breed_id', breed_id)
    .maybeSingle();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (data) {
    // Ya existe el like, así que lo quitamos
    const { error: deleteError } = await supabase
      .from('breed_likes')
      .delete()
      .eq('user_id', user_id)
      .eq('breed_id', breed_id);
    if (deleteError) return res.status(400).json({ error: deleteError.message });

    // Obtén el nuevo conteo
    const { count, error: countError } = await supabase
      .from('breed_likes')
      .select('*', { count: 'exact', head: true })
      .eq('breed_id', breed_id);
    if (countError) return res.status(400).json({ error: countError.message });

    return res.json({ liked: false, newCount: count });
  } else {
    // No existe el like, así que lo agregamos
    const { error: insertError } = await supabase
      .from('breed_likes')
      .insert([{ user_id, breed_id }]);
    if (insertError) return res.status(400).json({ error: insertError.message });

    // Obtén el nuevo conteo
    const { count, error: countError } = await supabase
      .from('breed_likes')
      .select('*', { count: 'exact', head: true })
      .eq('breed_id', breed_id);
    if (countError) return res.status(400).json({ error: countError.message });

    return res.json({ liked: true, newCount: count });
  }
};

// Obtener número de likes de una raza
exports.getBreedLikes = async (req, res) => {
  const { breed_id } = req.params;
  const { count, error } = await supabase
    .from('breed_likes')
    .select('*', { count: 'exact', head: true })
    .eq('breed_id', breed_id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ count });
};