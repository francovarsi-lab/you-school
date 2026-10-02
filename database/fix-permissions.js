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

let token = null;
let userRoleId = null;

const youSchoolCollections = [
    'idiomas', 'fuentes', 'conocimientos', 'lecciones', 'bloques_contenido',
    'lecciones_conocimientos', 'paises', 'curriculas', 'niveles', 'anios',
    'materias', 'unidades', 'temas', 'temas_conocimientos',
    'ubicaciones_curriculares', 'etiquetas', 'lecciones_etiquetas'
];

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
}

async function getUserRole() {
    const response = await fetch(`${DIRECTUS_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    userRoleId = data.data.role;
    console.log(`✓ User role: ${userRoleId}\n`);
}

async function deleteExistingPermissions() {
    console.log('[1. Deleting existing permissions for YOU SCHOOL collections...]');

    // Get all permissions
    const response = await fetch(`${DIRECTUS_URL}/permissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    const allPermissions = data.data;

    const existingPerms = allPermissions.filter(p =>
        p.role === userRoleId && youSchoolCollections.includes(p.collection)
    );

    for (const perm of existingPerms) {
        const deleteResponse = await fetch(`${DIRECTUS_URL}/permissions/${perm.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (deleteResponse.ok) {
            console.log(`  ✓ Deleted permission for ${perm.collection}`);
        } else {
            console.log(`  ⊘ Could not delete ${perm.collection}`);
        }
    }

    if (existingPerms.length === 0) {
        console.log('  ⊘ No existing permissions to delete');
    }

    console.log('');
}

async function createPermissions() {
    console.log('[2. Creating FULL permissions (create, read, update, delete) for each collection...]');

    // For each action, create a permission
    const actions = ['create', 'read', 'update', 'delete'];

    for (const collection of youSchoolCollections) {
        for (const action of actions) {
            const response = await fetch(`${DIRECTUS_URL}/permissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    role: userRoleId,
                    collection: collection,
                    action: action,
                    permissions: null, // null = full access, no row-level restrictions
                    validation: null   // no validation rules
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.log(`  ✗ ${collection}/${action}: ${error.errors?.[0]?.message || 'Error'}`);
                continue;
            }

            console.log(`  ✓ ${collection}/${action}`);
        }
    }

    console.log('');
}

async function verifyPermissions() {
    console.log('[3. Verifying permissions...]');

    const response = await fetch(`${DIRECTUS_URL}/permissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    const allPerms = data.data;
    const userPerms = allPerms.filter(p => p.role === userRoleId);
    const youSchoolPerms = userPerms.filter(p => youSchoolCollections.includes(p.collection));

    console.log(`  Total permissions for user: ${userPerms.length}`);
    console.log(`  YOU SCHOOL permissions: ${youSchoolPerms.length}/${youSchoolCollections.length * 4}\n`);

    if (youSchoolPerms.length > 0) {
        console.log('  Sample permissions:');
        youSchoolPerms.slice(0, 5).forEach(p => {
            console.log(`    ✓ ${p.collection}/${p.action}`);
        });
        if (youSchoolPerms.length > 5) {
            console.log(`    ... and ${youSchoolPerms.length - 5} more`);
        }
    }
}

async function run() {
    try {
        console.log(`Connecting to Directus: ${DIRECTUS_URL}\n`);

        await authenticate();
        console.log(`✓ Authenticated as ${ADMIN_EMAIL}`);

        await getUserRole();

        await deleteExistingPermissions();
        await createPermissions();
        await verifyPermissions();

        console.log('✓ PERMISSIONS CONFIGURED');

    } catch (error) {
        console.error('✗ ERROR:', error.message);
        if (error.response) {
            console.error('  Response:', error.response);
        }
        process.exit(1);
    }
}

run();
