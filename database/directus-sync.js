const fs = require('fs');
const path = require('path');

// Read .env from directus-admin to get Directus admin credentials
const envPath = path.join(__dirname, '../../directus-admin/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, value] = trimmed.split('=');
        env[key.trim()] = value.trim();
    }
});

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = env.ADMIN_EMAIL?.replace('ADMIN_EMAIL=', '').trim();
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

// The 16 YOU SCHOOL tables to register
const tables = [
    'idiomas',
    'fuentes',
    'conocimientos',
    'lecciones',
    'bloques_contenido',
    'lecciones_conocimientos',
    'paises',
    'curriculas',
    'niveles',
    'anios',
    'materias',
    'unidades',
    'temas',
    'temas_conocimientos',
    'ubicaciones_curriculares',
    'etiquetas',
    'lecciones_etiquetas'
];

async function registerCollections() {
    try {
        console.log(`Connecting to Directus: ${DIRECTUS_URL}`);

        // 1. Authenticate to get token
        console.log('\n[1. Authenticating to Directus...]');
        const authResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            })
        });

        if (!authResponse.ok) {
            throw new Error(`Auth failed: ${authResponse.statusText}`);
        }

        const authData = await authResponse.json();
        const token = authData.data.access_token;
        console.log(`✓ Authenticated as ${ADMIN_EMAIL}`);

        // 2. Get existing collections to avoid duplicates
        console.log('\n[2. Checking existing collections...]');
        const collectionsResponse = await fetch(`${DIRECTUS_URL}/collections`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const collectionsData = await collectionsResponse.json();
        const existingCollections = collectionsData.data.map(c => c.collection);
        console.log(`✓ Found ${existingCollections.length} existing collections`);

        // 3. Register new tables as collections
        console.log(`\n[3. Registering ${tables.length} YOU SCHOOL tables as collections...]`);

        for (const table of tables) {
            if (existingCollections.includes(table)) {
                console.log(`  ⊘ ${table}: Already registered`);
                continue;
            }

            const collectionResponse = await fetch(`${DIRECTUS_URL}/collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    collection: table,
                    meta: {
                        icon: 'box',
                        note: `YOU SCHOOL - ${table}`,
                        item_duplication_fields: []
                    }
                })
            });

            if (collectionResponse.ok) {
                console.log(`  ✓ ${table}: Registered`);
            } else {
                const error = await collectionResponse.json();
                console.log(`  ✗ ${table}: ${error.errors?.[0]?.message || 'Unknown error'}`);
            }
        }

        // 4. Verify final state
        console.log('\n[4. Verifying collections registered...]');
        const finalResponse = await fetch(`${DIRECTUS_URL}/collections`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const finalData = await finalResponse.json();
        const youSchoolCollections = finalData.data
            .filter(c => tables.includes(c.collection))
            .map(c => c.collection);

        console.log(`\n✓ SUCCESS: ${youSchoolCollections.length}/${tables.length} YOU SCHOOL collections visible in Directus:`);
        youSchoolCollections.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));

        if (youSchoolCollections.length < tables.length) {
            const missing = tables.filter(t => !youSchoolCollections.includes(t));
            console.log(`\n⚠ Missing collections: ${missing.join(', ')}`);
        }

    } catch (error) {
        console.error('✗ ERROR:', error.message);
        process.exit(1);
    }
}

registerCollections();
