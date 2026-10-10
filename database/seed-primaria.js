// Esqueleto de Primaria (Argentina) por la API de Directus. Idempotente: busca por nombre y padre antes de crear.
// Uso: node database/seed-primaria.js
const fs = require('fs');
const path = require('path');

const B = 'http://localhost:8055';
const ENV_FILE = path.join(__dirname, '..', '..', 'directus-admin', '.env');

function leerEnv(file) {
  const env = {};
  for (const linea of fs.readFileSync(file, 'utf-8').split('\n')) {
    const t = linea.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) continue;
    const i = t.indexOf('=');
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = leerEnv(ENV_FILE);
let TOKEN = '';

async function api(method, p, body) {
  const r = await fetch(B + p, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`${method} ${p} -> ${r.status} ${txt}`);
  return txt ? JSON.parse(txt).data : null;
}

const qs = (obj) => Object.entries(obj).map(([k, v]) => `filter[${k}][_eq]=${encodeURIComponent(v)}`).join('&');

async function buscarUno(coleccion, filtros) {
  const rows = await api('GET', `/items/${coleccion}?${qs(filtros)}&limit=-1&fields=id,nombre`);
  if (rows.length > 1) throw new Error(`Duplicado en ${coleccion}: ${JSON.stringify(filtros)}`);
  return rows[0] ?? null;
}

async function asegurar(coleccion, filtros, datos, reporte) {
  const existente = await buscarUno(coleccion, filtros);
  if (existente) {
    reporte.reutilizados.push(`${coleccion}: ${datos.nombre}`);
    return existente;
  }
  const creado = await api('POST', `/items/${coleccion}`, { ...datos });
  reporte.creados.push(`${coleccion}: ${datos.nombre}`);
  return creado;
}

async function contar(coleccion) {
  return (await api('GET', `/items/${coleccion}?limit=-1&fields=id`)).length;
}

const TABLAS = ['paises', 'curriculas', 'niveles', 'anios', 'materias', 'unidades', 'temas', 'lecciones', 'ubicaciones_curriculares'];

const ANIOS = [
  ['1er grado', 1], ['2do grado', 2], ['3er grado', 3], ['4to grado', 4],
  ['5to grado', 5], ['6to grado', 6], ['7mo grado', 7],
];

const AREAS = [
  'Lengua', 'Matemática', 'Ciencias Sociales', 'Ciencias Naturales',
  'Educación Tecnológica', 'Educación Artística', 'Educación Física', 'Formación Ética y Ciudadana',
];

async function main() {
  const login = await fetch(B + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  if (!login.ok) throw new Error(`Login en Directus falló: ${login.status}`);
  TOKEN = (await login.json()).data.access_token;

  const antes = {};
  for (const t of TABLAS) antes[t] = await contar(t);

  const reporte = { creados: [], reutilizados: [] };

  const pais = await buscarUno('paises', { nombre: 'Argentina' });
  if (!pais) throw new Error('No existe el país Argentina. Frené para no crear la cadena de cero.');
  const curricula = await buscarUno('curriculas', { nombre: 'NAP Argentina', pais_id: pais.id });
  if (!curricula) throw new Error('No existe la currícula NAP Argentina.');
  const nivel = await buscarUno('niveles', { nombre: 'Primaria', curricula_id: curricula.id });
  if (!nivel) throw new Error('No existe el nivel Primaria.');
  reporte.reutilizados.push('paises: Argentina', 'curriculas: NAP Argentina', 'niveles: Primaria');

  for (const [nombre, orden] of ANIOS) {
    const anio = await asegurar('anios', { nombre, nivel_id: nivel.id }, { nombre, nivel_id: nivel.id, orden }, reporte);

    for (let i = 0; i < AREAS.length; i++) {
      const area = AREAS[i];
      await asegurar('materias', { nombre: area, anio_id: anio.id }, { nombre: area, anio_id: anio.id, orden: i + 1 }, reporte);
    }
  }

  const despues = {};
  for (const t of TABLAS) despues[t] = await contar(t);

  const aniosPrimaria = await api('GET', `/items/anios?${qs({ nivel_id: nivel.id })}&limit=-1&fields=id,nombre,orden&sort=orden`);
  const aniosRepetidos = aniosPrimaria.map((a) => a.nombre).filter((n, i, arr) => arr.indexOf(n) !== i);
  const materiasPrimaria = await api('GET', `/items/materias?filter[anio_id][_in]=${aniosPrimaria.map((a) => a.id).join(',')}&limit=-1&fields=nombre,anio_id`);
  const claves = materiasPrimaria.map((m) => `${m.anio_id}|${m.nombre}`);
  const duplicados = claves.filter((k, i) => claves.indexOf(k) !== i).map((k) => k.split('|')[1]);

  console.log('Conteos antes / después:');
  for (const t of TABLAS) console.log(`  ${t}: ${antes[t]} -> ${despues[t]}`);
  console.log(`\nCreados (${reporte.creados.length}):`);
  reporte.creados.forEach((x) => console.log('  + ' + x));
  console.log(`\nReutilizados (${reporte.reutilizados.length}):`);
  reporte.reutilizados.forEach((x) => console.log('  = ' + x));
  console.log('\nDuplicados en Primaria:', duplicados.length || aniosRepetidos.length ? { anios: aniosRepetidos, materias: duplicados } : 'ninguno');
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
