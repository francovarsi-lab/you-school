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
    console.log(`✓ Authenticated\n`);
}

async function createRecord() {
    console.log('[Testing: Create a new etiqueta (tag) record]\n');
    console.log('Request:');
    console.log('  POST /items/etiquetas');
    console.log('  Body: { "nombre": "Test Tag 2026-09-28" }\n');

    const response = await fetch(`${DIRECTUS_URL}/items/etiquetas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            nombre: `Test Tag ${new Date().toISOString().split('T')[0]}`
        })
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);

    const data = await response.json();

    if (!response.ok) {
        console.log('\n✗ FAILED TO CREATE RECORD');
        console.log('Error response:');
        console.log(JSON.stringify(data, null, 2));
        return false;
    }

    console.log('\n✓ RECORD CREATED SUCCESSFULLY');
    console.log(`Record ID: ${data.data.id}`);
    console.log(`Record Data: ${JSON.stringify(data.data, null, 2)}`);

    return true;
}

async function run() {
    try {
        console.log(`Connecting to Directus: ${DIRECTUS_URL}\n`);
        await authenticate();
        const success = await createRecord();

        if (success) {
            console.log('\n✓ SUCCESS: Directus can now create records via API!');
        } else {
            console.log('\n✗ STILL FAILING: Directus API is rejecting record creation');
            process.exit(1);
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        process.exit(1);
    }
}

run();
