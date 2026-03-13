const supabase = require('../lib/supabase');

// Toggle like para una raza
exports.toggleBreedLike = async (req, res) => {
  const { breed_id } = req.body;
  // user_id proviene del token JWT validado por el middleware requireAuth
  const user_id = req.user.id;

  if (!breed_id) {
    return res.status(400).json({ error: 'Falta el parámetro breed_id' });
  }

  try {
    const { data: existingLike, error: fetchError } = await supabase
      .from('breed_likes')
      .select('id')
      .eq('user_id', user_id)
      .eq('breed_id', breed_id)
      .maybeSingle();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    let liked;
    if (existingLike) {
      // Ya existe el like, así que lo quitamos
      const { error: deleteError } = await supabase
        .from('breed_likes')
        .delete()
        .eq('user_id', user_id)
        .eq('breed_id', breed_id);
      if (deleteError) return res.status(400).json({ error: deleteError.message });
      liked = false;
    } else {
      // No existe el like, así que lo agregamos
      const { error: insertError } = await supabase
        .from('breed_likes')
        .insert([{ user_id, breed_id }]);
      if (insertError) return res.status(400).json({ error: insertError.message });
      liked = true;
    }

    // Obtener el nuevo conteo total para esta raza
    const { count, error: countError } = await supabase
      .from('breed_likes')
      .select('*', { count: 'exact', head: true })
      .eq('breed_id', breed_id);

    if (countError) {
      console.error('Error al contar likes:', countError);
    } else {
      // Intentar actualizar el contador en la tabla 'breeds'
      const { error: updateError } = await supabase
        .from('breeds')
        .update({ likes_count: count })
        .eq('id', breed_id);

      if (updateError) {
        console.warn('No se pudo actualizar breeds.likes_count:', updateError.message);
      }
    }

    return res.json({ liked, newCount: count || 0 });
  } catch (error) {
    console.error('Error fatal en toggleBreedLike:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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