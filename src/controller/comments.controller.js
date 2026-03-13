const supabase = require('../lib/supabase');

// Obtener comentarios de una raza específica
exports.getComments = async (req, res) => {
  const { breedId, primaryColor, secondaryColor } = req.query;

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('breed_id', breedId)
      .eq('primary_color', primaryColor)
      .eq('secondary_color', secondaryColor)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting comments:', error);
      return res.status(400).json({ error: error.message });
    }

    const commentsWithLikes = await Promise.all(
      data.map(async (comment) => {
        const { count } = await supabase
          .from('comment_likes')
          .select('*', { count: 'exact', head: true })
          .eq('comment_id', comment.id);
        return { ...comment, likes_count: count };
      })
    );

    res.json({ comments: commentsWithLikes });
  } catch (error) {
    console.error('Error in getComments:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear un nuevo comentario
exports.createComment = async (req, res) => {
  // user_id proviene del token JWT validado por el middleware requireAuth
  const user_id = req.user.id;
  const { breed_id, primary_color, secondary_color, text, image_url } = req.body;
  const user_name = req.user.user_metadata?.name || null;
  const user_email = req.user.email || null;

  if (!breed_id || !primary_color || !secondary_color || !text) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        user_id,
        breed_id,
        primary_color,
        secondary_color,
        text,
        image_url: image_url || null,
        user_name,
        user_email,
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error al insertar comentario:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ comment: data });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un comentario
exports.updateComment = async (req, res) => {
  const { id } = req.params;
  const { text, image_url } = req.body;
  // user_id proviene del token JWT validado por el middleware requireAuth
  const user_id = req.user.id;

  try {
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    if (existingComment.user_id !== user_id) {
      return res.status(403).json({ error: 'No tienes permisos para editar este comentario' });
    }

    const { data, error } = await supabase
      .from('comments')
      .update({
        text,
        image_url: image_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ comment: data });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar un comentario
exports.deleteComment = async (req, res) => {
  const { id } = req.params;
  // user_id proviene del token JWT validado por el middleware requireAuth
  const user_id = req.user.id;

  try {
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    if (existingComment.user_id !== user_id) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este comentario' });
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Comentario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Toggle like en un comentario
exports.toggleCommentLike = async (req, res) => {
  const { comment_id } = req.body;
  // user_id proviene del token JWT validado por el middleware requireAuth
  const user_id = req.user.id;

  try {
    const { data: existingLike, error: fetchError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('user_id', user_id)
      .eq('comment_id', comment_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return res.status(400).json({ error: fetchError.message });
    }

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('user_id', user_id)
        .eq('comment_id', comment_id);

      if (deleteError) {
        return res.status(400).json({ error: deleteError.message });
      }

      const { count, error: countError } = await supabase
        .from('comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', comment_id);
      if (countError) return res.status(400).json({ error: countError.message });
      return res.json({ liked: false, newCount: count });
    } else {
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert([{ user_id, comment_id }]);

      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }

      const { count, error: countError } = await supabase
        .from('comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', comment_id);
      if (countError) return res.status(400).json({ error: countError.message });
      return res.json({ liked: true, newCount: count });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};