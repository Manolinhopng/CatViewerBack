const supabase = require('../lib/supabase');

// Obtener número de likes de una imagen
exports.getLikesCount = async (req, res) => {
  const { image_id } = req.params;
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('image_id', image_id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ count });
};

exports.toggleLike = async (req, res) => {
  const { image_id } = req.body;
  // user_id proviene del token JWT validado por el middleware requireAuth
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user_id)
    .eq('image_id', image_id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return res.status(400).json({ error: error.message });
  }

  if (data) {
    // Ya existe el like, así que lo quitamos
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user_id)
      .eq('image_id', image_id);
    if (deleteError) return res.status(400).json({ error: deleteError.message });

    const { count, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('image_id', image_id);
    if (countError) return res.status(400).json({ error: countError.message });
    return res.json({ liked: false, newCount: count });
  } else {
    // No existe el like, así que lo agregamos
    const { error: insertError } = await supabase
      .from('likes')
      .insert([{ user_id, image_id }]);
    if (insertError) return res.status(400).json({ error: insertError.message });

    const { count, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('image_id', image_id);
    if (countError) return res.status(400).json({ error: countError.message });
    return res.json({ liked: true, newCount: count });
  }
};
