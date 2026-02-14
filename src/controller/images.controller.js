// src/controller/images.controller.js
const supabase = require('../lib/supabase');

// Guardar registro de imagen subida
exports.uploadImage = async (req, res) => {
  const { user_id, path, public_url } = req.body;
  const { data, error } = await supabase
    .from('user_images')
    .insert([{ user_id, path, public_url, is_active: true }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, image: data[0] });
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

// Borrado lógico de imagen
exports.softDeleteImage = async (req, res) => {
  const { imageId } = req.body;
  const { error } = await supabase
    .from('user_images')
    .update({ is_active: false, deleted_at: new Date().toISOString() })
    .eq('id', imageId);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
};