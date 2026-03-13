// src/verify_rls.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_KEY;

const serviceClient = createClient(supabaseUrl, serviceRoleKey);
const anonClient = createClient(supabaseUrl, anonKey);

async function runTests() {
  console.log('--- Iniciando Verificación de RLS ---\n');

  try {
    // 1. Probar acceso con Service Role (Debe poder hacer todo)
    console.log('1. Probando Service Role (Bypassa RLS)...');
    const { data: usersData, error: usersError } = await serviceClient.from('users').select('id').limit(1);
    if (usersError) {
      console.error('❌ Error Service Role (users):', usersError.message);
    } else {
      console.log('✅ Service Role puede ver usuarios.');
    }

    // 2. Probar acceso con Anon Key a 'users' (Debe fallar o devolver vacío si no es su propio ID)
    console.log('\n2. Probando Anon Key (Debe fallar en acceso no autorizado)...');
    const { data: anonUsers, error: anonError } = await anonClient.from('users').select('*');
    if (anonError) {
      console.log('✅ Anon Key restringida correctamente (error expected):', anonError.message);
    } else if (anonUsers.length === 0) {
      console.log('✅ Anon Key no ve registros (seguro).');
    } else {
      console.warn('⚠️ Advertencia: Anon Key puede ver usuarios. Revisa RLS en la tabla "users".');
    }

    // 3. Probar lectura pública de comentarios
    console.log('\n3. Probando lectura pública de comentarios...');
    const { data: comments, error: commError } = await anonClient.from('comments').select('*').limit(1);
    if (commError) {
      console.error('❌ Error leyendo comentarios públicos:', commError.message);
    } else {
      console.log('✅ Comentarios son accesibles públicamente.');
    }

    // 4. Intentar insertar sin estar autenticado (Debe fallar)
    console.log('\n4. Intentando insertar comentario sin sesión...');
    const { error: insertError } = await anonClient.from('comments').insert({
      text: 'Test malicioso',
      breed_id: '1',
      primary_color: 'test',
      secondary_color: 'test',
      user_id: '00000000-0000-0000-0000-000000000000' // ID falso
    });
    
    if (insertError) {
      console.log('✅ Inserción no autorizada bloqueada:', insertError.message);
    } else {
      console.warn('⚠️ ALERTA: Se pudo insertar un comentario sin autenticación. RLS NO ESTÁ PROTEGIENDO "comments".');
    }

  } catch (err) {
    console.error('Error fatal durante la verificación:', err);
  }

  console.log('\n--- Verificación Finalizada ---');
}

runTests();
