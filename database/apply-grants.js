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

async function applyGrants() {
    try {
        await client.connect();
        console.log('✓ Connected to Supabase\n');

        const grants = [
            'GRANT SELECT ON idiomas TO anon;',
            'GRANT SELECT ON paises TO anon;',
            'GRANT SELECT ON curriculas TO anon;',
            'GRANT SELECT ON niveles TO anon;',
            'GRANT SELECT ON anios TO anon;',
            'GRANT SELECT ON materias TO anon;',
            'GRANT SELECT ON unidades TO anon;',
            'GRANT SELECT ON temas TO anon;',
            'GRANT SELECT ON conocimientos TO anon;',
            'GRANT SELECT ON bloques_contenido TO anon;',
            'GRANT SELECT ON lecciones_conocimientos TO anon;',
            'GRANT SELECT ON temas_conocimientos TO anon;',
            'GRANT SELECT ON etiquetas TO anon;',
            'GRANT SELECT ON lecciones_etiquetas TO anon;',
            'GRANT SELECT ON fuentes TO anon;',
            'GRANT SELECT ON lecciones TO anon;',
            'GRANT SELECT ON ubicaciones_curriculares TO anon;'
        ];

        console.log('[Applying GRANT SELECT to anon role...]');

        for (const grant of grants) {
            try {
                await client.query(grant);
                const tableName = grant.match(/ON\s+(\w+)/)[1];
                console.log(`  ✓ ${tableName}`);
            } catch (error) {
                console.log(`  ⚠ ${grant}: ${error.message}`);
            }
        }

        console.log('\n[Verifying grants...]');
        const result = await client.query(`
            SELECT table_name
            FROM information_schema.table_privileges
            WHERE grantee = 'anon'
            AND privilege_type = 'SELECT'
            AND table_schema = 'public'
            ORDER BY table_name
        `);

        console.log(`\nTables with SELECT grant for anon: ${result.rows.length}`);
        result.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });

        console.log('\n✓ GRANTS Applied Successfully');

        await client.end();
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        await client.end();
        process.exit(1);
    }
}

applyGrants();
