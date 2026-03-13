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
  
  // Sincronizar usuario
  if (data.user) {
    await syncUser(data.user);
  }

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
  
  // Sincronizar usuario
  if (data.user) {
    await syncUser(data.user);
  }

  res.json({ user: data.user, session: data.session });
};

async function syncUser(supabaseUser) {
  const { id, email, user_metadata, email_confirmed_at } = supabaseUser;

  try {
    // Busca en tu tabla users
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error al buscar usuario para sincronizar:', fetchError);
      return;
    }

    if (!existingUser) {
      // Si no existe, lo creas
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ 
          id, 
          email, 
          name: user_metadata?.name || '', 
          email_confirmed_at: email_confirmed_at || null,
          created_at: new Date().toISOString() 
        }]);
      
      if (insertError) console.error('Error al insertar usuario en sincronización:', insertError);
    } else {
      // Si existe, actualizas la confirmación de email (por si acaso cambió)
      const { error: updateError } = await supabase
        .from('users')
        .update({ email_confirmed_at: email_confirmed_at || null })
        .eq('id', id);
      
      if (updateError) console.error('Error al actualizar usuario en sincronización:', updateError);
    }
  } catch (err) {
    console.error('Error catch en syncUser:', err);
  }
}

