const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env from directus-admin
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
const ids = {};

async function run() {
    try {
        await client.connect();
        console.log('✓ Connected to Supabase\n');

        // 1. Idiomas
        console.log('[1. CAPA CONOCIMIENTO]');
        console.log('  Inserting: Idiomas');
        const idioma = await client.query(
            'INSERT INTO idiomas (codigo, nombre) VALUES ($1, $2) RETURNING id',
            ['es', 'Español']
        );
        ids.idioma = idioma.rows[0].id;
        console.log(`  ✓ idiomas: ${ids.idioma}`);

        // 2. Conocimientos
        console.log('  Inserting: Conocimientos');
        const conocimiento = await client.query(
            'INSERT INTO conocimientos (nombre, descripcion) VALUES ($1, $2) RETURNING id',
            ['Fracciones', 'Concepto matemático de división de unidades']
        );
        ids.conocimiento = conocimiento.rows[0].id;
        console.log(`  ✓ conocimientos: ${ids.conocimiento}`);

        // 3. Lecciones
        console.log('  Inserting: Lecciones');
        const leccion = await client.query(
            'INSERT INTO lecciones (titulo, idioma_id, estado, slug) VALUES ($1, $2, $3, $4) RETURNING id',
            ['Introducción a las fracciones', ids.idioma, 'publicado', 'introduccion-a-las-fracciones']
        );
        ids.leccion = leccion.rows[0].id;
        console.log(`  ✓ lecciones: ${ids.leccion}`);

        // 4. Lecciones_Conocimientos
        console.log('  Inserting: Lecciones_Conocimientos');
        await client.query(
            'INSERT INTO lecciones_conocimientos (leccion_id, conocimiento_id) VALUES ($1, $2)',
            [ids.leccion, ids.conocimiento]
        );
        console.log(`  ✓ lecciones_conocimientos`);

        // 5. Bloques_Contenido
        console.log('  Inserting: Bloques_Contenido');
        const bloque = await client.query(
            'INSERT INTO bloques_contenido (leccion_id, tipo, orden, referencia) VALUES ($1, $2, $3, $4) RETURNING id',
            [ids.leccion, 'texto', 1, 'Contenido de prueba: una fracción representa una parte de un todo dividido en partes iguales.']
        );
        ids.bloque = bloque.rows[0].id;
        console.log(`  ✓ bloques_contenido: ${ids.bloque}`);

        console.log('\n[2. CAPA CURRICULAR]');

        // 6. Países
        console.log('  Inserting: Países');
        const pais = await client.query(
            'INSERT INTO paises (nombre, codigo) VALUES ($1, $2) RETURNING id',
            ['Argentina', 'AR']
        );
        ids.pais = pais.rows[0].id;
        console.log(`  ✓ paises: ${ids.pais}`);

        // 7. Currículas
        console.log('  Inserting: Currículas');
        const curricula = await client.query(
            'INSERT INTO curriculas (pais_id, nombre) VALUES ($1, $2) RETURNING id',
            [ids.pais, 'NAP Argentina']
        );
        ids.curricula = curricula.rows[0].id;
        console.log(`  ✓ curriculas: ${ids.curricula}`);

        // 8. Niveles
        console.log('  Inserting: Niveles');
        const nivel = await client.query(
            'INSERT INTO niveles (curricula_id, nombre, orden) VALUES ($1, $2, $3) RETURNING id',
            [ids.curricula, 'Primaria', 1]
        );
        ids.nivel = nivel.rows[0].id;
        console.log(`  ✓ niveles: ${ids.nivel}`);

        // 9. Años
        console.log('  Inserting: Años');
        const anio = await client.query(
            'INSERT INTO anios (nivel_id, nombre, orden) VALUES ($1, $2, $3) RETURNING id',
            [ids.nivel, '4to grado', 4]
        );
        ids.anio = anio.rows[0].id;
        console.log(`  ✓ anios: ${ids.anio}`);

        // 10. Materias
        console.log('  Inserting: Materias');
        const materia = await client.query(
            'INSERT INTO materias (anio_id, nombre, orden) VALUES ($1, $2, $3) RETURNING id',
            [ids.anio, 'Matemática', 1]
        );
        ids.materia = materia.rows[0].id;
        console.log(`  ✓ materias: ${ids.materia}`);

        // 11. Unidades
        console.log('  Inserting: Unidades');
        const unidad = await client.query(
            'INSERT INTO unidades (materia_id, nombre, orden) VALUES ($1, $2, $3) RETURNING id',
            [ids.materia, 'Números', 1]
        );
        ids.unidad = unidad.rows[0].id;
        console.log(`  ✓ unidades: ${ids.unidad}`);

        // 12. Temas
        console.log('  Inserting: Temas');
        const tema = await client.query(
            'INSERT INTO temas (unidad_id, nombre, orden) VALUES ($1, $2, $3) RETURNING id',
            [ids.unidad, 'Fracciones', 1]
        );
        ids.tema = tema.rows[0].id;
        console.log(`  ✓ temas: ${ids.tema}`);

        console.log('\n[3. CAPA CONEXIÓN]');

        // 13. Ubicaciones_Curriculares
        console.log('  Inserting: Ubicaciones_Curriculares');
        const ubicacion = await client.query(
            'INSERT INTO ubicaciones_curriculares (leccion_id, tema_id, orden, estado) VALUES ($1, $2, $3, $4) RETURNING id',
            [ids.leccion, ids.tema, 1, 'publicado']
        );
        ids.ubicacion = ubicacion.rows[0].id;
        console.log(`  ✓ ubicaciones_curriculares: ${ids.ubicacion}`);

        console.log('\n[4. VERIFICATION - Reconstructing full chain]');
        console.log('  Querying: SELECT * FROM paises->curriculas->niveles->anios->materias->unidades->temas->ubicaciones_curriculares->lecciones->bloques_contenido\n');

        const query = `
            SELECT
                p.nombre as pais,
                p.codigo as codigo_pais,
                c.nombre as curricula,
                n.nombre as nivel,
                a.nombre as anio,
                m.nombre as materia,
                u.nombre as unidad,
                t.nombre as tema,
                l.titulo as leccion,
                l.slug as slug_leccion,
                l.estado as estado_leccion,
                bc.referencia as contenido,
                bc.tipo as tipo_contenido
            FROM paises p
            JOIN curriculas c ON p.id = c.pais_id
            JOIN niveles n ON c.id = n.curricula_id
            JOIN anios a ON n.id = a.nivel_id
            JOIN materias m ON a.id = m.anio_id
            JOIN unidades u ON m.id = u.materia_id
            JOIN temas t ON u.id = t.unidad_id
            JOIN ubicaciones_curriculares uc ON t.id = uc.tema_id
            JOIN lecciones l ON uc.leccion_id = l.id
            JOIN bloques_contenido bc ON l.id = bc.leccion_id
            WHERE p.id = $1
        `;

        const result = await client.query(query, [ids.pais]);

        if (result.rows.length === 0) {
            console.log('  ✗ No results found - chain is broken');
        } else {
            const row = result.rows[0];
            console.log('  ✓ FULL CHAIN RECONSTRUCTED:\n');
            console.log(`  ┌─ País: ${row.pais} (${row.codigo_pais})`);
            console.log(`  ├─ Currícula: ${row.curricula}`);
            console.log(`  ├─ Nivel: ${row.nivel}`);
            console.log(`  ├─ Año: ${row.anio}`);
            console.log(`  ├─ Materia: ${row.materia}`);
            console.log(`  ├─ Unidad: ${row.unidad}`);
            console.log(`  ├─ Tema: ${row.tema}`);
            console.log(`  ├─ Lección: "${row.leccion}"`);
            console.log(`  │  ├─ Slug: ${row.slug_leccion}`);
            console.log(`  │  └─ Estado: ${row.estado_leccion}`);
            console.log(`  ├─ Bloque (${row.tipo_contenido}): "${row.contenido}"`);
            console.log(`  └─ ✓ All relations working\n`);
        }

        console.log('✓ TEST DATA LOADED SUCCESSFULLY');

        await client.end();
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        if (error.detail) {
            console.error('  Detail:', error.detail);
        }
        await client.end();
        process.exit(1);
    }
}

run();
