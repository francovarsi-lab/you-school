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
    console.log(`✓ Authenticated as ${ADMIN_EMAIL}\n`);
}

async function checkAdminUser() {
    console.log('[1. Getting current user info...]');
    const response = await fetch(`${DIRECTUS_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error(`Failed to get user: ${response.statusText}`);
    }

    const data = await response.json();
    const user = data.data;

    console.log(`  Email: ${user.email}`);
    console.log(`  User ID: ${user.id}`);
    console.log(`  Role: ${user.role}\n`);

    return user;
}

async function checkRoleDetails(roleId) {
    console.log('[2. Getting role details...]');
    const response = await fetch(`${DIRECTUS_URL}/roles/${roleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        const error = await response.json();
        console.log(`  ✗ Failed to get role: ${error.errors?.[0]?.message || 'Unknown error'}`);
        return null;
    }

    const data = await response.json();
    const role = data.data;

    console.log(`  Role Name: ${role.name}`);
    console.log(`  Admin: ${role.admin_access ? 'YES ✓' : 'NO ✗'}`);
    console.log(`  App Access: ${role.app_access ? 'YES ✓' : 'NO ✗'}`);
    console.log(`  Admin Access: ${role.admin_access ? 'FULL' : 'LIMITED'}\n`);

    return role;
}

async function checkPermissions() {
    console.log('[3. Checking permissions for collections...]');
    const response = await fetch(`${DIRECTUS_URL}/permissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error(`Failed to get permissions: ${response.statusText}`);
    }

    const data = await response.json();
    const allPermissions = data.data;

    // Get admin role ID
    const rolesResponse = await fetch(`${DIRECTUS_URL}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const rolesData = await rolesResponse.json();
    const adminRole = rolesData.data.find(r => r.name === 'Administrator');

    if (!adminRole) {
        console.log('  ✗ Administrator role not found');
        return;
    }

    const adminPermissions = allPermissions.filter(p => p.role === adminRole.id);

    const youSchoolTables = [
        'idiomas', 'fuentes', 'conocimientos', 'lecciones', 'bloques_contenido',
        'lecciones_conocimientos', 'paises', 'curriculas', 'niveles', 'anios',
        'materias', 'unidades', 'temas', 'temas_conocimientos',
        'ubicaciones_curriculares', 'etiquetas', 'lecciones_etiquetas'
    ];

    const youSchoolPermissions = adminPermissions.filter(p => youSchoolTables.includes(p.collection));

    console.log(`  Admin Role ID: ${adminRole.id}`);
    console.log(`  Total Admin Permissions: ${adminPermissions.length}`);
    console.log(`  YOU SCHOOL Collections with perms: ${youSchoolPermissions.length}/${youSchoolTables.length}\n`);

    if (youSchoolPermissions.length > 0) {
        console.log('  Collections with Administrator permissions:');
        youSchoolPermissions.forEach(p => {
            console.log(`    ✓ ${p.collection}: ${p.action}`);
        });
    } else {
        console.log('  ✗ No permissions found for YOU SCHOOL collections');
    }
}

async function run() {
    try {
        await authenticate();
        const user = await checkAdminUser();
        await checkRoleDetails(user.role);
        await checkPermissions();
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        process.exit(1);
    }
}

run();
