// Carga la lección piloto propia "Contamos del 1 al 10" en Primaria > 1er grado > Matemática, como borrador.
// Por la API de Directus. Idempotente: si ya existe el slug, no crea nada.
// Uso: node database/cargar-leccion-piloto.js            -> simulacro (no escribe)
//      node database/cargar-leccion-piloto.js --aplicar  -> escribe
const fs = require('fs');
const path = require('path');

const APLICAR = process.argv.includes('--aplicar');
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
async function buscar(coleccion, filtros, fields = 'id,nombre') {
  return api('GET', `/items/${coleccion}?${qs(filtros)}&limit=-1&fields=${fields}`);
}

const SLUG = 'contamos-del-1-al-10';
const FUENTE = { nombre: 'YOU SCHOOL', tipo: 'propia', url: 'https://you-school.vercel.app', licencia: 'CC BY-NC-SA 4.0' };
const AUTOR = 'YOU SCHOOL (borrador escrito con IA, pendiente de revisión docente)';
const BLOQUES = [
  { tipo: 'texto', contenido: 'Contar es decir cuántas cosas hay. Hoy vamos a contar del 1 al 10.' },
  { tipo: 'imagen', url: 'manzana', cantidad: 3, descripcion: 'Tres manzanas' },
  { tipo: 'texto', contenido: 'Hay tres manzanas. Las contamos así: uno, dos, tres.' },
  { tipo: 'ejercicio_contar', pregunta: 'Tocá cada estrella para contarla.', objeto: 'estrella', cantidad: 5 },
  { tipo: 'ejercicio_opciones', pregunta: '¿Qué número viene después del 6?', opciones: ['5', '7', '8'], correcta: 1, explicacion: 'Después del 6 viene el 7. Contamos: cinco, seis, siete.' },
  { tipo: 'ejercicio_ordenar', consigna: 'Tocá los números de menor a mayor.', elementos: ['1', '2', '3', '4', '5'] },
  { tipo: 'ejercicio_contar', pregunta: 'Tocá cada pelota para contarla.', objeto: 'pelota', cantidad: 8 },
  { tipo: 'texto', contenido: '¡Muy bien! Ya sabés contar objetos hasta el 10.' },
];

async function main() {
  const login = await fetch(B + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }) });
  if (!login.ok) throw new Error(`Login en Directus falló: ${login.status}`);
  TOKEN = (await login.json()).data.access_token;

  const existe = await buscar('lecciones', { slug: SLUG }, 'id,estado');
  if (existe.length) { console.log(`Ya existe la lección ${SLUG} (${existe[0].estado}). No se crea nada.`); return; }

  const idioma = (await buscar('idiomas', { codigo: 'es' }, 'id'))[0];
  const anios = await buscar('anios', { nombre: '1er grado' }, 'id,nivel_id');
  const materiaId = await (async () => {
    for (const a of anios) {
      const m = (await buscar('materias', { nombre: 'Matemática', anio_id: a.id }, 'id'))[0];
      if (m) return m.id;
    }
    throw new Error('No existe Matemática en 1er grado. Frené.');
  })();
  if (!idioma) throw new Error('No existe el idioma es.');

  const plan = [];
  let fuente = (await buscar('fuentes', { nombre: FUENTE.nombre }, 'id,licencia'))[0];
  if (!fuente) plan.push(`crear fuente "${FUENTE.nombre}" (${FUENTE.licencia})`);
  let unidad = (await buscar('unidades', { nombre: 'Números y conteo', materia_id: materiaId }, 'id'))[0];
  if (!unidad) plan.push('crear unidad "Números y conteo"');
  let tema = unidad ? (await buscar('temas', { nombre: 'Contar hasta 10', unidad_id: unidad.id }, 'id'))[0] : null;
  if (!tema) plan.push('crear tema "Contar hasta 10"');
  let conocimiento = (await buscar('conocimientos', { nombre: 'Contar hasta 10' }, 'id'))[0];
  if (!conocimiento) plan.push('crear conocimiento "Contar hasta 10"');
  plan.push(`crear lección "Contamos del 1 al 10" (slug ${SLUG}, borrador, tipo bloques, ${BLOQUES.length} bloques)`);
  plan.push('asociar al conocimiento y ubicar en el tema, en 1er grado > Matemática');

  console.log(APLICAR ? 'MODO: APLICAR' : 'MODO: SIMULACRO (usar --aplicar para escribir)');
  plan.forEach((p) => console.log('  - ' + p));
  if (!APLICAR) return;

  if (!fuente) fuente = await api('POST', '/items/fuentes', FUENTE);
  if (!unidad) unidad = await api('POST', '/items/unidades', { nombre: 'Números y conteo', materia_id: materiaId, orden: 1 });
  if (!tema) tema = await api('POST', '/items/temas', { nombre: 'Contar hasta 10', unidad_id: unidad.id, orden: 1 });
  if (!conocimiento) conocimiento = await api('POST', '/items/conocimientos', { nombre: 'Contar hasta 10' });

  const leccion = await api('POST', '/items/lecciones', {
    titulo: 'Contamos del 1 al 10',
    descripcion: 'Aprendemos a contar objetos y a ordenar los números del 1 al 10.',
    slug: SLUG,
    idioma_id: idioma.id,
    estado: 'borrador',
    fuente_id: fuente.id,
    autor: AUTOR,
    tipo_de_contenido: 'bloques',
    bloques: BLOQUES,
  });
  await api('POST', '/items/lecciones_conocimientos', { leccion_id: leccion.id, conocimiento_id: conocimiento.id });
  await api('POST', '/items/ubicaciones_curriculares', { leccion_id: leccion.id, tema_id: tema.id, orden: 1, estado: 'publicado' });
  console.log('Creada lección', leccion.id, 'como borrador.');
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
