const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Usar la Service Role Key para tener permisos de administrador
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

module.exports = supabase;