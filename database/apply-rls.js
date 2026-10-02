const { Client } = require('pg');
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

const config = {
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    database: env.DB_DATABASE,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    ssl: env.DB_SSL__REJECT_UNAUTHORIZED === 'false' ? { rejectUnauthorized: false } : true
};

const client = new Client(config);

async function applyRLS() {
    try {
        await client.connect();
        console.log('✓ Connected to Supabase\n');

        const policiesPath = path.join(__dirname, 'rls-policies.sql');
        const policiesSql = fs.readFileSync(policiesPath, 'utf-8');

        console.log('[Applying RLS Policies...]');
        await client.query(policiesSql);
        console.log('✓ RLS Policies applied successfully\n');

        console.log('[Verifying policies...]');
        const result = await client.query(`
            SELECT schemaname, tablename, policyname, cmd, qual
            FROM pg_policies
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname
        `);

        console.log(`Total policies created: ${result.rows.length}\n`);

        const tableNames = new Set();
        result.rows.forEach(row => {
            tableNames.add(row.tablename);
        });

        console.log('Tables with policies:');
        Array.from(tableNames).sort().forEach(table => {
            const policiesForTable = result.rows.filter(r => r.tablename === table);
            console.log(`  ${table}: ${policiesForTable.length} policy(ies)`);
        });

        console.log('\n✓ RLS Configuration Complete');

        await client.end();
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        await client.end();
        process.exit(1);
    }
}

applyRLS();
