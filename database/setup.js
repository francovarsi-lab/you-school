const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env from directus-admin
const envPath = path.join(__dirname, '../../directus-admin/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Parse .env manually
const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, value] = trimmed.split('=');
        env[key.trim()] = value.trim();
    }
});

// Connection configuration
const config = {
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    database: env.DB_DATABASE,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    ssl: env.DB_SSL__REJECT_UNAUTHORIZED === 'false' ? { rejectUnauthorized: false } : true
};

console.log(`Connecting to Supabase: ${config.user}@${config.host}:${config.port}/${config.database}`);

const client = new Client(config);

async function setup() {
    try {
        await client.connect();
        console.log('✓ Connected to Supabase');

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        console.log('\n[Executing schema.sql...]');
        await client.query(schemaSql);
        console.log('✓ Schema executed successfully');

        // Verify tables created
        const tablesResult = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        const tables = tablesResult.rows.map(r => r.table_name);
        console.log(`\n[Tables Created: ${tables.length}]`);
        tables.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));

        // Check Row Level Security (RLS) status
        console.log('\n[Row Level Security (RLS) Status]');
        const rlsResult = await client.query(`
            SELECT
                tablename,
                rowsecurity
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);

        const rlsEnabled = rlsResult.rows.filter(r => r.rowsecurity).length;
        const totalTables = rlsResult.rows.length;

        rlsResult.rows.forEach(r => {
            const status = r.rowsecurity ? '✓ ENABLED' : '✗ DISABLED';
            console.log(`  ${r.tablename}: ${status}`);
        });

        console.log(`\nRLS Summary: ${rlsEnabled}/${totalTables} tables have RLS enabled`);

        // Expected table count
        const expectedTables = 16;
        if (tables.length === expectedTables) {
            console.log(`\n✓ SUCCESS: All ${expectedTables} tables created!`);
        } else {
            console.log(`\n✗ WARNING: Expected ${expectedTables} tables but found ${tables.length}`);
        }

        await client.end();
        process.exit(0);
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        await client.end();
        process.exit(1);
    }
}

setup();
