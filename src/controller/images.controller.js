const supabase = require('../lib/supabase');

// Guardar registro de imagen subida
exports.uploadImage = async (req, res) => {
  const { path, public_url } = req.body;
  // user_id proviene del token JWT validado por el middleware requireAuth
  const user_id = req.user.id;

  if (!path || !public_url) {
    return res.status(400).json({ error: 'Faltan campos requeridos: path y public_url' });
  }

  const { data, error } = await supabase
    .from('user_images')
    .insert([{ user_id, path, public_url, is_active: true }])
    .select('*')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, image: data });
};

// Obtener imágenes activas de un usuario
exports.getActiveImages = async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from('user_images')
    .select('*')
    .eq('user_id', user_id)
    .eq('is_active', true);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ images: data });
};

// Obtener todas las imágenes activas (Comunidad)
exports.getAllActiveImages = async (req, res) => {
  const { data, error } = await supabase
    .from('user_images')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ images: data });
};

// Borrado lógico de imagen (solo el propietario puede borrar su imagen)
exports.softDeleteImage = async (req, res) => {
  const { imageId } = req.body;
  // user_id proviene del token JWT validado por el middleware requireAuth
  const user_id = req.user.id;

  if (!imageId) {
    return res.status(400).json({ error: 'Falta el campo imageId' });
  }

  // Verificar que la imagen pertenece al usuario autenticado
  const { data: existingImage, error: fetchError } = await supabase
    .from('user_images')
    .select('user_id')
    .eq('id', imageId)
    .single();

  if (fetchError) {
    return res.status(404).json({ error: 'Imagen no encontrada' });
  }

  if (existingImage.user_id !== user_id) {
    return res.status(403).json({ error: 'No tienes permisos para eliminar esta imagen' });
  }

  const { error } = await supabase
    .from('user_images')
    .update({ is_active: false, deleted_at: new Date().toISOString() })
    .eq('id', imageId);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
};