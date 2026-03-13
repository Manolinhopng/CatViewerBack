const { validationResult } = require('express-validator');

/**
 * Middleware que recoge los errores generados por express-validator.
 * Se debe usar después de los validadores en cada ruta.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { handleValidationErrors };
