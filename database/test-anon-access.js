const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env to get Supabase URL and public key
const envPath = path.join(__dirname, '../../you-school/.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

let supabaseUrl = '';
let supabaseAnonKey = '';

envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.includes('NEXT_PUBLIC_SUPABASE_URL')) {
        supabaseUrl = trimmed.split('=')[1];
    }
    if (trimmed.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
        supabaseAnonKey = trimmed.split('=')[1];
    }
});

console.log(`Using Supabase URL: ${supabaseUrl}`);
console.log(`Using anon key: ${supabaseAnonKey.substring(0, 20)}...\n`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnonAccess() {
    try {
        console.log('[Testing anon access to ubicaciones_curriculares]\n');

        const { data, error } = await supabase
            .from('ubicaciones_curriculares')
            .select('*')
            .limit(1);

        if (error) {
            console.log(`✗ Query failed: ${error.message}`);
            console.log(`  Code: ${error.code}`);
            console.log(`  Status: ${error.status}`);
            process.exit(1);
        }

        if (!data || data.length === 0) {
            console.log('✗ No data returned (but connection worked)');
            console.log('  This might mean: no records exist, or RLS policies are blocking access');
            process.exit(1);
        }

        console.log('✓ SUCCESS: anon role can read ubicaciones_curriculares\n');
        console.log('First record sample:');
        console.log(JSON.stringify(data[0], null, 2));

        // Now try to fetch the full lesson chain
        console.log('\n[Testing full lesson chain query]\n');

        const { data: lessonData, error: lessonError } = await supabase
            .from('ubicaciones_curriculares')
            .select(`
                leccion_id,
                tema_id,
                lecciones (
                  id,
                  titulo,
                  slug,
                  bloques_contenido (
                    referencia,
                    tipo
                  )
                ),
                temas (
                  id,
                  nombre
                )
            `)
            .eq('lecciones.slug', 'introduccion-a-las-fracciones')
            .single();

        if (lessonError) {
            console.log(`✗ Lesson query failed: ${lessonError.message}`);
            // This is expected if no matching lesson
        } else if (lessonData) {
            console.log('✓ Full chain query successful!\n');
            console.log('Lesson data:');
            console.log(JSON.stringify(lessonData, null, 2));
        } else {
            console.log('✗ No lesson found with that slug');
        }

    } catch (error) {
        console.error('✗ ERROR:', error.message);
        process.exit(1);
    }
}

testAnonAccess();
