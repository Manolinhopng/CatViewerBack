const supabase = require('../lib/supabase');

/**
 * Middleware que valida el JWT de Supabase enviado en el header Authorization.
 * Si el token es válido, adjunta req.user con los datos del usuario autenticado.
 * Usar en rutas que requieren autenticación.
 */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado: falta el token de autorización' });
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  req.user = user;
  next();
};

module.exports = { requireAuth };
