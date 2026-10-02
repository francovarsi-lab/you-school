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
let userId = null;
let currentRoleId = null;
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

async function getUserAndRoles() {
    console.log('[1. Getting user and roles...]');

    // Get current user
    const userResponse = await fetch(`${DIRECTUS_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const userData = await userResponse.json();
    userId = userData.data.id;
    currentRoleId = userData.data.role;
    console.log(`  Current User ID: ${userId}`);
    console.log(`  Current Role ID: ${currentRoleId}`);

    // Get all roles
    const rolesResponse = await fetch(`${DIRECTUS_URL}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const rolesData = await rolesResponse.json();
    const adminRole = rolesData.data.find(r => r.name === 'Administrator');

    if (!adminRole) {
        throw new Error('Administrator role not found');
    }

    adminRoleId = adminRole.id;
    console.log(`  Administrator Role ID: ${adminRoleId}`);
    console.log(`  Administrator Admin Access: ${adminRole.admin_access ? 'YES ✓' : 'NO ✗'}\n`);

    if (currentRoleId === adminRoleId) {
        console.log('  ✓ User already has Administrator role');
        return false;
    }

    return true;
}

async function updateUserRole() {
    console.log('[2. Assigning Administrator role to user...]');

    const response = await fetch(`${DIRECTUS_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            role: adminRoleId
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to update user: ${error.errors?.[0]?.message || 'Unknown error'}`);
    }

    console.log(`  ✓ User role updated to Administrator\n`);
}

async function verifyChange() {
    console.log('[3. Verifying change...]');

    const response = await fetch(`${DIRECTUS_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    const newRoleId = data.data.role;

    console.log(`  New Role ID: ${newRoleId}`);

    if (newRoleId === adminRoleId) {
        console.log(`  ✓ VERIFIED: User now has Administrator role\n`);
        return true;
    } else {
        console.log(`  ✗ FAILED: Role still ${newRoleId}\n`);
        return false;
    }
}

async function run() {
    try {
        console.log(`Connecting to Directus: ${DIRECTUS_URL}\n`);

        await authenticate();

        const needsUpdate = await getUserAndRoles();

        if (!needsUpdate) {
            console.log('✓ No changes needed');
            return;
        }

        await updateUserRole();
        const verified = await verifyChange();

        if (verified) {
            console.log('✓ SUCCESS: Administrator role properly assigned');
        } else {
            console.log('✗ FAILED: Could not verify role change');
            process.exit(1);
        }

    } catch (error) {
        console.error('✗ ERROR:', error.message);
        process.exit(1);
    }
}

run();
