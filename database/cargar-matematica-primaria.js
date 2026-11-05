// Carga las 30 lecciones de Matemática de Primaria (1.º a 6.º) como borrador, por la API de Directus.
// Contenido en database/contenido-matematica-primaria.js. Idempotente: si el slug ya existe, no crea nada.
// Uso: node database/cargar-matematica-primaria.js            -> simulacro (no escribe)
//      node database/cargar-matematica-primaria.js --aplicar  -> escribe
//      node database/cargar-matematica-primaria.js --aplicar --actualizar -> además reemplaza el contenido de los borradores existentes
// Antes de escribir, correr node database/inspeccionar-matematica.js (guarda el respaldo).
const fs = require('fs');
const path = require('path');
const { LECCIONES, UNIDADES_NUEVAS, TEMAS_NUEVOS } = require('./contenido-matematica-primaria');

const APLICAR = process.argv.includes('--aplicar');
const ACTUALIZAR = process.argv.includes('--actualizar');
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
const buscar = (coleccion, filtros, fields = 'id,nombre') => api('GET', `/items/${coleccion}?${qs(filtros)}&limit=-1&fields=${fields}`);

const FUENTE_NOMBRE = 'YOU SCHOOL';
const AUTOR = 'YOU SCHOOL (borrador escrito con IA, pendiente de revisión docente)';

function revisarBloques(bloques, slug) {
  for (const b of bloques) {
    if (b.tipo === 'ejercicio_opciones' && (b.correcta < 0 || b.correcta >= b.opciones.length)) throw new Error(`${slug}: respuesta correcta fuera de rango`);
    if (b.tipo === 'ejercicio_ordenar' && b.elementos.length < 2) throw new Error(`${slug}: ordenar con menos de 2 elementos`);
    if (b.tipo === 'texto' && !b.contenido) throw new Error(`${slug}: texto vacío`);
  }
}

async function main() {
  const login = await fetch(B + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }) });
  if (!login.ok) throw new Error(`Login en Directus falló: ${login.status}`);
  TOKEN = (await login.json()).data.access_token;

  for (const l of LECCIONES) revisarBloques(l.bloques, l.slug);

  const idioma = (await buscar('idiomas', { codigo: 'es' }, 'id'))[0];
  const fuente = (await buscar('fuentes', { nombre: FUENTE_NOMBRE }, 'id'))[0];
  if (!idioma || !fuente) throw new Error('Falta el idioma es o la fuente YOU SCHOOL. Frené.');

  // Materia Matemática de cada grado.
  const materiaDe = {};
  for (const grado of ['1er grado', '2do grado', '3er grado', '4to grado', '5to grado', '6to grado']) {
    const anio = (await buscar('anios', { nombre: grado }, 'id'))[0];
    const mat = anio ? (await buscar('materias', { nombre: 'Matemática', anio_id: anio.id }, 'id'))[0] : null;
    if (!mat) throw new Error(`No existe Matemática en ${grado}. Frené.`);
    materiaDe[grado] = mat.id;
  }

  const plan = [];
  // Unidades y temas que faltan.
  const unidadesNuevas = [];
  for (const u of UNIDADES_NUEVAS) {
    const ex = (await buscar('unidades', { nombre: u.nombre, materia_id: materiaDe[u.grado] }, 'id'))[0];
    if (!ex) { plan.push(`crear unidad "${u.nombre}" en ${u.grado} > Matemática`); unidadesNuevas.push(u); }
  }
  const temasNuevos = [];
  for (const t of TEMAS_NUEVOS) {
    const ua = (await buscar('unidades', { nombre: t.unidad, materia_id: materiaDe[t.grado] }, 'id'))[0];
    const existeUnidad = ua || unidadesNuevas.some((u) => u.grado === t.grado && u.nombre === t.unidad);
    if (!existeUnidad) throw new Error(`Falta la unidad "${t.unidad}" para el tema "${t.nombre}"`);
    const tema = ua ? (await buscar('temas', { nombre: t.nombre, unidad_id: ua.id }, 'id'))[0] : null;
    if (!tema) { plan.push(`crear tema "${t.nombre}" en ${t.grado} > ${t.unidad}`); temasNuevos.push(t); }
  }

  // Lecciones.
  const creables = [];
  const actualizables = [];
  for (const l of LECCIONES) {
    const ya = await buscar('lecciones', { slug: l.slug }, 'id,estado');
    if (ya.length && ACTUALIZAR && ya[0].estado === 'borrador') {
      actualizables.push({ id: ya[0].id, l });
      plan.push(`actualizar lección ${l.slug}: título, descripción y ${l.bloques.length} bloques (sigue en borrador)`);
      continue;
    }
    if (ya.length) { plan.push(`ya existe ${l.slug} (${ya[0].estado}): no se toca`); continue; }
    creables.push(l);
    plan.push(`crear lección "${l.titulo}" (${l.slug}) en ${l.grado} > ${l.unidad} > ${l.tema}, borrador, ${l.bloques.length} bloques`);
  }

  console.log(APLICAR ? 'MODO: APLICAR' : 'MODO: SIMULACRO (usar --aplicar para escribir)');
  plan.forEach((p) => console.log('  - ' + p));
  if (!APLICAR) return;

  // Crear lo que falta.
  for (const u of unidadesNuevas) await api('POST', '/items/unidades', { nombre: u.nombre, materia_id: materiaDe[u.grado], orden: 2 });
  for (const t of temasNuevos) {
    const ua = (await buscar('unidades', { nombre: t.unidad, materia_id: materiaDe[t.grado] }, 'id'))[0];
    await api('POST', '/items/temas', { nombre: t.nombre, unidad_id: ua.id, orden: 1 });
  }

  // Actualizar las que ya están en borrador (solo contenido; no toca estado ni ubicación).
  for (const { id, l } of actualizables) {
    await api('PATCH', `/items/lecciones/${id}`, { titulo: l.titulo, descripcion: l.descripcion, bloques: l.bloques });
    console.log('  actualizada', l.slug);
  }

  // Crear lecciones.
  let creadas = 0;
  for (const l of creables) {
    const ua = (await buscar('unidades', { nombre: l.unidad, materia_id: materiaDe[l.grado] }, 'id'))[0];
    const tema = (await buscar('temas', { nombre: l.tema, unidad_id: ua.id }, 'id'))[0];
    if (!tema) throw new Error(`No encuentro el tema "${l.tema}" para ${l.slug}`);
    let conocimiento = (await buscar('conocimientos', { nombre: l.titulo }, 'id'))[0];
    if (!conocimiento) conocimiento = await api('POST', '/items/conocimientos', { nombre: l.titulo });

    const leccion = await api('POST', '/items/lecciones', {
      titulo: l.titulo,
      descripcion: l.descripcion,
      slug: l.slug,
      idioma_id: idioma.id,
      estado: 'borrador',
      fuente_id: fuente.id,
      autor: AUTOR,
      tipo_de_contenido: 'bloques',
      bloques: l.bloques,
    });
    await api('POST', '/items/lecciones_conocimientos', { leccion_id: leccion.id, conocimiento_id: conocimiento.id });
    const orden = (await buscar('ubicaciones_curriculares', { tema_id: tema.id }, 'id')).length + 1;
    await api('POST', '/items/ubicaciones_curriculares', { leccion_id: leccion.id, tema_id: tema.id, orden, estado: 'publicado' });
    creadas++;
    console.log('  creada', l.slug);
  }
  console.log(`Listo: ${creadas} lecciones nuevas en borrador.`);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
