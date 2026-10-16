// Esqueleto de Secundaria (NAP Argentina) por la API de Directus. Idempotente: busca antes de crear.
// Crea el nivel, los años 1.º a 5.º y la materia Biología (las lecciones de Claves caen en los cinco años).
// Uso: node database/seed-secundaria.js
const fs = require('fs');
const path = require('path');

const B = 'http://localhost:8055';
const env = {};
for (const linea of fs.readFileSync(path.join(__dirname, '..', '..', 'directus-admin', '.env'), 'utf-8').split('\n')) {
  const t = linea.trim();
  if (!t || t.startsWith('#') || !t.includes('=')) continue;
  const i = t.indexOf('=');
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}
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
  const creado = await api('POST', `/items/${coleccion}`, datos);
  reporte.creados.push(`${coleccion}: ${datos.nombre}`);
  return creado;
}

const ANIOS = [['1er año', 1], ['2do año', 2], ['3er año', 3], ['4to año', 4], ['5to año', 5]];
const MATERIAS = ['Biología'];

async function main() {
  const login = await fetch(B + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  if (!login.ok) throw new Error(`Login en Directus falló: ${login.status}`);
  TOKEN = (await login.json()).data.access_token;

  const reporte = { creados: [], reutilizados: [] };
  const pais = await buscarUno('paises', { nombre: 'Argentina' });
  if (!pais) throw new Error('No existe el país Argentina. Frené.');
  const curricula = await buscarUno('curriculas', { nombre: 'NAP Argentina', pais_id: pais.id });
  if (!curricula) throw new Error('No existe la currícula NAP Argentina. Frené.');

  const nivel = await asegurar('niveles', { nombre: 'Secundaria', curricula_id: curricula.id }, { nombre: 'Secundaria', curricula_id: curricula.id, orden: 2 }, reporte);

  for (const [nombre, orden] of ANIOS) {
    const anio = await asegurar('anios', { nombre, nivel_id: nivel.id }, { nombre, nivel_id: nivel.id, orden }, reporte);
    for (let i = 0; i < MATERIAS.length; i++) {
      await asegurar('materias', { nombre: MATERIAS[i], anio_id: anio.id }, { nombre: MATERIAS[i], anio_id: anio.id, orden: i + 1 }, reporte);
    }
  }

  console.log(`Creados (${reporte.creados.length}):`);
  reporte.creados.forEach((x) => console.log('  + ' + x));
  console.log(`Reutilizados (${reporte.reutilizados.length}):`);
  reporte.reutilizados.forEach((x) => console.log('  = ' + x));
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
