const supabase = require('../lib/supabase');

// Registro
exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user });
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user, session: data.session });
};

async function syncUser(supabaseUser) {
  const { id, email, user_metadata } = supabaseUser;

  // Busca en tu tabla users
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', id)
    .single();

  if (!existingUser) {
    // Si no existe, lo creas
    await supabase
      .from('users')
      .insert([{ id, email, name: user_metadata?.name || '', created_at: new Date().toISOString() }]);
  }
}

