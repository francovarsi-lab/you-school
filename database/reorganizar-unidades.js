// Reorganiza los temas de las unidades "Por clasificar" en unidades con nombre real.
// Uso:
//   node database/reorganizar-unidades.js            -> simulacro: no escribe nada
//   node database/reorganizar-unidades.js --aplicar  -> escribe por la API de Directus
// Idempotente: reutiliza unidades existentes, no mueve temas ya movidos y solo borra
// "Por clasificar" si quedó sin temas.
const fs = require('fs');
const path = require('path');

const APLICAR = process.argv.includes('--aplicar');
const DIRECTUS = 'http://localhost:8055';
const ENV_FILE = path.join(__dirname, '..', '..', 'directus-admin', '.env');
const POR_CLASIFICAR = 'Por clasificar';

const MAPA = [
  ['4to grado', 'Matemática', 'Números y operaciones', ['Multiplicación', 'Proporcionalidad']],
  ['4to grado', 'Matemática', 'Geometría y medida', ['Perímetro y área', 'Triángulos']],
  ['1er grado', 'Matemática', 'Números y operaciones', ['Medidas y recetas']],
  ['4to grado', 'Ciencias Naturales', 'El agua y el ambiente', ['El agua']],
  ['4to grado', 'Ciencias Naturales', 'Los seres vivos', ['Animales']],
  ['4to grado', 'Ciencias Naturales', 'Ciencia y método', ['Método científico', 'Experimentos']],
  ['1er grado', 'Ciencias Naturales', 'El mundo físico', ['Luz y sombras']],
  ['1er grado', 'Ciencias Naturales', 'Los seres vivos', ['Fósiles y dinosaurios']],
  ['4to grado', 'Ciencias Sociales', 'La Argentina y su territorio', ['Geografía de la Argentina']],
  ['4to grado', 'Ciencias Sociales', 'Sociedad y cultura', ['Alimentación e historia']],
  ['1er grado', 'Ciencias Sociales', 'La familia y la comunidad', ['Mi familia', 'Transporte']],
  ['3er grado', 'Ciencias Sociales', 'Sociedad y cultura', ['Inmigración']],
  ['4to grado', 'Lengua', 'Lectura y literatura', ['Lectura de cuentos', 'Historieta', 'Lectura de imágenes']],
  ['1er grado', 'Lengua', 'Lectura y literatura', ['Lectura de cuentos']],
];

const env = {};
for (const linea of fs.readFileSync(ENV_FILE, 'utf-8').split('\n')) {
  const t = linea.trim();
  if (!t || t.startsWith('#') || !t.includes('=')) continue;
  const i = t.indexOf('=');
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

let TOKEN = '';
async function api(method, p, body) {
  const r = await fetch(DIRECTUS + p, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`${method} ${p} -> ${r.status} ${txt}`);
  return txt ? JSON.parse(txt).data : null;
}
const qs = (f) => Object.entries(f).map(([k, v]) => `filter[${k}][_eq]=${encodeURIComponent(v)}`).join('&');
const buscar = (col, f, fields = 'id,nombre,orden') => api('GET', `/items/${col}?${qs(f)}&limit=-1&fields=${fields}`);

async function ubicacionesYLecciones(temaId) {
  const ub = await buscar('ubicaciones_curriculares', { tema_id: temaId }, 'id,leccion_id,estado');
  return { ubicaciones: ub.length, lecciones: new Set(ub.map((u) => u.leccion_id)).size };
}

async function snapshotLecciones() {
  const ls = await api('GET', '/items/lecciones?limit=-1&fields=id,estado');
  return Object.fromEntries(ls.map((l) => [l.id, l.estado]));
}

async function main() {
  const login = await fetch(DIRECTUS + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  if (!login.ok) throw new Error(`login en Directus falló (${login.status})`);
  TOKEN = (await login.json()).data.access_token;

  console.log(APLICAR ? 'MODO: APLICAR (escribe en Directus)\n' : 'MODO: SIMULACRO (no escribe nada; usar --aplicar para escribir)\n');
  const estadosAntes = await snapshotLecciones();
  const filas = [];
  const conteosAntes = {};
  const yaMovidos = new Set();
  const totales = { crear: 0, mover: 0, borrar: 0 };

  for (const [anioNombre, materiaNombre, unidadNueva, temas] of MAPA) {
    const anio = (await buscar('anios', { nombre: anioNombre }))[0];
    if (!anio) throw new Error(`no existe el año ${anioNombre}`);
    const materia = (await buscar('materias', { nombre: materiaNombre, anio_id: anio.id }))[0];
    if (!materia) throw new Error(`no existe ${materiaNombre} en ${anioNombre}`);
    const porClasificar = (await buscar('unidades', { nombre: POR_CLASIFICAR, materia_id: materia.id }, 'id,nombre,orden'))[0];

    let unidad = (await buscar('unidades', { nombre: unidadNueva, materia_id: materia.id }, 'id,nombre,orden'))[0];
    const existe = Boolean(unidad);
    if (!existe) totales.crear++;
    if (!unidad && APLICAR) {
      const hermanas = await buscar('unidades', { materia_id: materia.id }, 'id,orden');
      unidad = await api('POST', '/items/unidades', {
        nombre: unidadNueva, materia_id: materia.id,
        orden: Math.max(0, ...hermanas.map((x) => x.orden ?? 0)) + 1,
      });
    }

    const movidosAqui = [];
    for (const nombreTema of temas) {
      const tema = porClasificar
        ? (await buscar('temas', { nombre: nombreTema, unidad_id: porClasificar.id }, 'id,nombre,orden'))[0]
        : null;
      if (!tema) {
        movidosAqui.push(`${nombreTema} (no está en Por clasificar)`);
        continue;
      }
      const antes = await ubicacionesYLecciones(tema.id);
      conteosAntes[tema.id] = { nombre: nombreTema, ...antes };
      yaMovidos.add(tema.id);
      movidosAqui.push(nombreTema);
      totales.mover++;
      if (APLICAR) await api('PATCH', `/items/temas/${tema.id}`, { unidad_id: unidad.id });
    }

    let quedan = [];
    if (porClasificar) {
      const todos = await buscar('temas', { unidad_id: porClasificar.id }, 'id,nombre');
      quedan = todos.filter((t) => !yaMovidos.has(t.id)).map((t) => t.nombre);
      if (quedan.length === 0) {
        totales.borrar++;
        if (APLICAR) await api('DELETE', `/items/unidades/${porClasificar.id}`);
      }
    }
    filas.push({
      anio: anioNombre,
      materia: materiaNombre,
      unidad: existe ? `${unidadNueva} (existe)` : `${unidadNueva} (crear)`,
      mover: movidosAqui.join(', '),
      quedan: quedan.length ? quedan.join(', ') : (porClasificar ? 'ninguno: se borra Por clasificar' : 'sin Por clasificar'),
    });
  }

  console.log('Año | Materia | Unidad nueva | Temas a mover | Quedan en Por clasificar');
  for (const f of filas) console.log(`${f.anio} | ${f.materia} | ${f.unidad} | ${f.mover} | ${f.quedan}`);
  console.log(`\nTotales: crear ${totales.crear} unidades, mover ${totales.mover} temas, borrar ${totales.borrar} unidades "Por clasificar"`);

  if (APLICAR) {
    const estadosDespues = await snapshotLecciones();
    const cambiaron = Object.keys(estadosAntes).filter((id) => estadosAntes[id] !== estadosDespues[id]);
    console.log('\nVerificación de conteos (antes -> después):');
    for (const [id, c] of Object.entries(conteosAntes)) {
      const d = await ubicacionesYLecciones(id);
      console.log(`  ${c.nombre}: ubicaciones ${c.ubicaciones} -> ${d.ubicaciones}, lecciones ${c.lecciones} -> ${d.lecciones}`);
    }
    console.log(`Lecciones que cambiaron de estado: ${cambiaron.length}`);
  }
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
