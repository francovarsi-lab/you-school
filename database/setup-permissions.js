const fs = require('fs');
const path = require('path');

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
const ADMIN_EMAIL = env.ADMIN_EMAIL;
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

const collections = [
    'idiomas', 'fuentes', 'conocimientos', 'lecciones', 'bloques_contenido',
    'lecciones_conocimientos', 'paises', 'curriculas', 'niveles', 'anios',
    'materias', 'unidades', 'temas', 'temas_conocimientos',
    'ubicaciones_curriculares', 'etiquetas', 'lecciones_etiquetas'
];

let token = null;
let adminRoleId = null;

async function authenticate() {
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        })
    });

    if (!response.ok) {
        throw new Error(`Auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    token = data.data.access_token;
    console.log(`✓ Authenticated\n`);
}

async function getAdminRole() {
    console.log('[1. Getting Admin Role ID...]');
    const response = await fetch(`${DIRECTUS_URL}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    const adminRole = data.data.find(r => r.name === 'Administrator');

    if (!adminRole) {
        throw new Error('Administrator role not found');
    }

    adminRoleId = adminRole.id;
    console.log(`✓ Found Admin Role: ${adminRoleId}\n`);
}

async function grantPermission(collection) {
    try {
        const response = await fetch(`${DIRECTUS_URL}/permissions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                role: adminRoleId,
                collection: collection,
                action: 'create',
                permissions: {}
            })
        });

        if (response.status === 409) {
            // Already exists
            console.log(`  ⊘ ${collection}: Permission already exists`);
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            console.log(`  ✗ ${collection}: ${error.errors?.[0]?.message || 'Unknown error'}`);
            return;
        }

        console.log(`  ✓ ${collection}: CREATE permission granted`);
    } catch (error) {
        console.log(`  ✗ ${collection}: ${error.message}`);
    }
}

async function setupPermissions() {
    try {
        await authenticate();
        await getAdminRole();

        console.log('[2. Granting CREATE permissions for all collections...]');

        for (const collection of collections) {
            await grantPermission(collection);
        }

        console.log('\n✓ All permissions configured');

    } catch (error) {
        console.error('✗ ERROR:', error.message);
        process.exit(1);
    }
}

setupPermissions();
