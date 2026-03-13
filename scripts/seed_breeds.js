const supabase = require('./lib/supabase');

const cats = [
  { id: "12", breed: "Tuxedo" },
  { id: "1",  breed: "Calico" },
  { id: "2",  breed: "Marrón" },
  { id: "4",  breed: "Crema y Negro" },
  { id: "5",  breed: "Naranja y Blanco" },
  { id: "6",  breed: "Negro" },
  { id: "7",  breed: "Naranja" },
  { id: "8",  breed: "Blanco" },
  { id: "9",  breed: "Moteado Blanco y Negro" },
  { id: "10", breed: "Gris y Blanco" },
  { id: "11", breed: "Gris" }
];

async function seed() {
  console.log('--- Seeding Start ---');
  
  // Try to fetch to see if table exists and columns
  const { data: testData, error: testError } = await supabase.from('breeds').select('*').limit(1);
  
  if (testError) {
    console.error('Error checking breeds table:', testError);
    return;
  }

  const breedsToInsert = cats.map(c => ({
    id: c.id,
    name: c.breed
    // description: c.description // Omitted if column might not exist
  }));

  const { data, error } = await supabase
    .from('breeds')
    .upsert(breedsToInsert, { onConflict: 'id' });

  if (error) {
    console.error('Error seeding breeds:', error);
  } else {
    console.log('Breeds seeded successfully!');
  }
}

seed();
