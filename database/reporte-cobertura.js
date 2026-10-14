// Reporte de cobertura por grado y materia. SOLO LECTURA: no cambia nada.
// Uso: node database/reporte-cobertura.js
// Cuenta lecciones publicadas y en borrador de cada materia, y escribe docs/cobertura.md.
const fs = require('fs');
const path = require('path');

const DIRECTUS = 'http://localhost:8055';
const ENV_FILE = path.join(__dirname, '..', '..', 'directus-admin', '.env');
const SALIDA = path.join(__dirname, '..', 'docs', 'cobertura.md');

const env = {};
for (const linea of fs.readFileSync(ENV_FILE, 'utf-8').split('\n')) {
  const t = linea.trim();
  if (!t || t.startsWith('#') || !t.includes('=')) continue;
  const i = t.indexOf('=');
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

async function main() {
  const login = await fetch(DIRECTUS + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  if (!login.ok) throw new Error(`login en Directus falló (${login.status})`);
  const token = (await login.json()).data.access_token;
  const get = async (p) => {
    const r = await fetch(DIRECTUS + p, { headers: { Authorization: 'Bearer ' + token } });
    if (!r.ok) throw new Error(`GET ${p} -> ${r.status}`);
    return (await r.json()).data;
  };

  const materias = await get('/items/materias?limit=-1&fields=id,nombre,anio_id.id,anio_id.nombre,anio_id.orden');
  const ubicaciones = await get('/items/ubicaciones_curriculares?limit=-1&fields=leccion_id.id,leccion_id.estado,tema_id.unidad_id.materia_id.id');

  // Lecciones distintas por materia y estado (una lección puede estar en varias ubicaciones).
  const porMateria = new Map();
  for (const u of ubicaciones) {
    const mid = u.tema_id?.unidad_id?.materia_id?.id;
    const l = u.leccion_id;
    if (!mid || !l) continue;
    if (!porMateria.has(mid)) porMateria.set(mid, new Map());
    porMateria.get(mid).set(l.id, l.estado);
  }

  const filas = materias
    .map((m) => {
      const lecs = porMateria.get(m.id) ?? new Map();
      const valores = [...lecs.values()];
      return {
        grado: m.anio_id?.nombre ?? '(sin año)',
        orden: m.anio_id?.orden ?? 999,
        materia: m.nombre,
        publicadas: valores.filter((e) => e === 'publicado').length,
        borrador: valores.filter((e) => e !== 'publicado').length,
      };
    })
    .sort((a, b) => a.orden - b.orden || a.materia.localeCompare(b.materia));

  const grados = [...new Map(filas.map((f) => [f.grado, f.orden])).entries()].sort((a, b) => a[1] - b[1]);
  const sinLecciones = filas.filter((f) => f.publicadas + f.borrador === 0);

  const md = [
    '# Cobertura por grado y materia',
    '',
    'Fecha: 2026-10-14. Reporte de solo lectura. Cuenta lecciones distintas por materia (una lección cuenta una vez, aunque esté en varios temas).',
    '',
    '| Grado | Materia | Publicadas | Borrador |',
    '|---|---|---|---|',
    ...filas.map((f) => `| ${f.grado} | ${f.materia} | ${f.publicadas} | ${f.borrador} |`),
    '',
    '## Materias sin ninguna lección',
    '',
    sinLecciones.length
      ? sinLecciones.map((f) => `- ${f.grado}: ${f.materia}`).join('\n')
      : 'Ninguna.',
    '',
    '## Resumen por grado',
    '',
    '| Grado | Lecciones publicadas | Lecciones en borrador | Materias con contenido |',
    '|---|---|---|---|',
    ...grados.map(([g]) => {
      const de = filas.filter((f) => f.grado === g);
      return `| ${g} | ${de.reduce((a, f) => a + f.publicadas, 0)} | ${de.reduce((a, f) => a + f.borrador, 0)} | ${de.filter((f) => f.publicadas + f.borrador > 0).length} de ${de.length} |`;
    }),
    '',
  ].join('\n');
  fs.writeFileSync(SALIDA, md, 'utf-8');

  console.log('Grado | Materia | Publicadas | Borrador');
  for (const f of filas) console.log(`${f.grado} | ${f.materia} | ${f.publicadas} | ${f.borrador}`);
  console.log(`\nMaterias sin lecciones: ${sinLecciones.length}. Reporte escrito en docs/cobertura.md`);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
