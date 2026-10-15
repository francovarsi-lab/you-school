// Importador de lotes manuales: videos de YouTube que no vienen de Educ.ar (p. ej. Khan Academy).
// Uso: node database/importar-lote-externo.js [--archivo=ruta.json] [--aplicar]
// Por defecto es simulacro: no escribe nada. Con --aplicar respalda Directus y crea las lecciones en BORRADOR.
// Campos por entrada: url, titulo, descripcion, fuente, grado, materia, unidad, tema, conocimiento
// (y duracion_min opcional, si se conoce). Ver docs/IMPORTAR-LOTE-EXTERNO.md.
const fs = require('fs');
const path = require('path');

const DIRECTUS = 'http://localhost:8055';
const ENV_FILE = path.join(__dirname, '..', '..', 'directus-admin', '.env');
const ARG = (n) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || '').slice(n.length + 3);
const ARCHIVO = ARG('archivo') || path.join(__dirname, 'importar', 'lote-externo.json');
const APLICAR = process.argv.includes('--aplicar');
const CAMPOS = ['url', 'titulo', 'descripcion', 'fuente', 'grado', 'materia', 'unidad', 'tema', 'conocimiento'];
const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const TV = /\b(conductor(es)?|programa|entrevista|charla|capitulo|episodio|conversan)\b/;
const sinTildes = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slugify = (s) => sinTildes(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const env = {};
for (const linea of fs.readFileSync(ENV_FILE, 'utf-8').split('\n')) {
  const t = linea.trim();
  if (!t || t.startsWith('#') || !t.includes('=')) continue;
  const i = t.indexOf('=');
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

function idDeYouTube(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const id = host === 'youtu.be' ? u.pathname.slice(1) : host.endsWith('youtube.com') ? u.searchParams.get('v') : null;
    return id && YT_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

// Canal y título según oEmbed. No da duración: esa viene de duracion_min, si se conoce.
async function oembed(id) {
  const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`);
  if (!r.ok) return { ok: false, status: r.status };
  const j = await r.json();
  return { ok: true, canal: j.author_name, titulo: j.title };
}

async function main() {
  const entradas = JSON.parse(fs.readFileSync(ARCHIVO, 'utf-8'));
  if (!Array.isArray(entradas)) throw new Error('el archivo debe ser una lista de objetos');

  const login = await fetch(DIRECTUS + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  if (!login.ok) throw new Error(`login en Directus falló (${login.status})`);
  const token = (await login.json()).data.access_token;
  const H = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
  const get = async (p) => {
    const r = await fetch(DIRECTUS + p, { headers: H });
    if (!r.ok) throw new Error(`GET ${p} -> ${r.status}`);
    return (await r.json()).data;
  };
  const post = async (col, body) => {
    const r = await fetch(`${DIRECTUS}/items/${col}`, { method: 'POST', headers: H, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(`POST ${col} -> ${r.status} ${await r.text()}`);
    return (await r.json()).data;
  };
  const buscar = (col, f, fields = 'id,nombre,orden') =>
    get(`/items/${col}?${Object.entries(f).map(([k, v]) => `filter[${k}][_eq]=${encodeURIComponent(v)}`).join('&')}&limit=-1&fields=${fields}`);

  const idioma = (await buscar('idiomas', { codigo: 'es' }, 'id,codigo'))[0];
  if (!idioma) throw new Error('no existe el idioma es');
  const lecciones = await get('/items/lecciones?limit=-1&fields=slug,url_origen');
  const slugs = new Set(lecciones.map((l) => l.slug));
  const urls = new Set(lecciones.map((l) => l.url_origen).filter(Boolean));

  // Respaldo antes de escribir.
  if (APLICAR) {
    const colecciones = ['lecciones', 'bloques_contenido', 'lecciones_conocimientos', 'ubicaciones_curriculares', 'fuentes', 'unidades', 'temas', 'conocimientos'];
    const copia = { fecha: new Date().toISOString(), colecciones: {} };
    for (const c of colecciones) copia.colecciones[c] = await get(`/items/${c}?limit=-1`);
    const nombre = `pre-lote-externo-${Date.now()}.json`;
    fs.writeFileSync(path.join(__dirname, 'backups', nombre), JSON.stringify(copia, null, 1), 'utf-8');
    console.log(`Respaldo: database/backups/${nombre}\n`);
  }
  console.log(APLICAR ? 'MODO: APLICAR (escribe en Directus, en borrador)\n' : 'MODO: SIMULACRO (no escribe nada; usar --aplicar para escribir)\n');

  const filas = [];
  for (const [i, e] of entradas.entries()) {
    const n = i + 1;
    const falta = CAMPOS.filter((c) => !e[c]);
    if (falta.length) { filas.push({ n, resultado: 'rechazada', motivo: `faltan campos: ${falta.join(', ')}` }); continue; }
    const id = idDeYouTube(e.url);
    if (!id) { filas.push({ n, resultado: 'rechazada', motivo: 'la URL no es de YouTube (watch?v= o youtu.be/)' }); continue; }
    const urlLimpia = `https://www.youtube.com/watch?v=${id}`;
    if (urls.has(urlLimpia)) { filas.push({ n, resultado: 'saltada', motivo: 'ya existe una lección con este video' }); continue; }

    let video;
    try { video = await oembed(id); } catch (err) { filas.push({ n, resultado: 'error', motivo: err.message }); continue; }
    if (!video.ok) { filas.push({ n, resultado: 'rechazada', motivo: `YouTube no devuelve el video (oEmbed ${video.status}): no existe, es privado o no permite embeber` }); continue; }

    const fuente = (await buscar('fuentes', { nombre: e.fuente }, 'id,nombre,licencia,url'))[0];
    if (!fuente) { filas.push({ n, resultado: 'rechazada', motivo: `la fuente "${e.fuente}" no existe en Directus` }); continue; }
    if (/khan/i.test(fuente.nombre) && !/khan academy/i.test(video.canal ?? '')) {
      filas.push({ n, resultado: 'a revisar', motivo: `el canal es "${video.canal}", no el de Khan Academy (solo videos propios)` }); continue;
    }

    // Mismos filtros que Educ.ar: formato TV y duración.
    if (TV.test(sinTildes(`${e.titulo} ${e.descripcion}`))) { filas.push({ n, resultado: 'a revisar', motivo: 'formato TV: título o descripción habla de conductores, programa, entrevista, charla, capítulo, episodio o conversan' }); continue; }
    if (typeof e.duracion_min !== 'number') { filas.push({ n, resultado: 'a revisar', motivo: 'sin duración verificada: agregar duracion_min en el archivo' }); continue; }
    if (e.duracion_min > 20) { filas.push({ n, resultado: 'excluida', motivo: `programa de ${e.duracion_min} min (más de 20)` }); continue; }
    if (e.duracion_min > 10) { filas.push({ n, resultado: 'a revisar', motivo: `video largo: ${e.duracion_min} min (más de 10)` }); continue; }

    const slug = slugify(e.titulo);
    if (slugs.has(slug)) { filas.push({ n, resultado: 'saltada', motivo: `ya existe una lección con el slug "${slug}"` }); continue; }

    // Ubicación: año > materia > unidad > tema, y conocimiento. Crea lo que falta.
    const anio = (await buscar('anios', { nombre: e.grado }))[0];
    if (!anio) { filas.push({ n, resultado: 'rechazada', motivo: `el grado "${e.grado}" no existe` }); continue; }
    const materia = (await buscar('materias', { nombre: e.materia, anio_id: anio.id }))[0];
    if (!materia) { filas.push({ n, resultado: 'rechazada', motivo: `la materia "${e.materia}" no existe en ${e.grado}` }); continue; }
    let unidad = (await buscar('unidades', { nombre: e.unidad, materia_id: materia.id }))[0];
    let tema = unidad ? (await buscar('temas', { nombre: e.tema, unidad_id: unidad.id }))[0] : null;
    let conocimiento = (await buscar('conocimientos', { nombre: e.conocimiento }, 'id,nombre'))[0];
    const crea = [];
    if (!unidad) crea.push(`unidad "${e.unidad}"`);
    if (!tema) crea.push(`tema "${e.tema}"`);
    if (!conocimiento) crea.push(`conocimiento "${e.conocimiento}"`);

    if (APLICAR) {
      if (!unidad) { const hermanas = await buscar('unidades', { materia_id: materia.id }, 'id,orden'); unidad = await post('unidades', { nombre: e.unidad, materia_id: materia.id, orden: Math.max(0, ...hermanas.map((x) => x.orden ?? 0)) + 1 }); }
      if (!tema) { const hermanos = await buscar('temas', { unidad_id: unidad.id }, 'id,orden'); tema = await post('temas', { nombre: e.tema, unidad_id: unidad.id, orden: Math.max(0, ...hermanos.map((x) => x.orden ?? 0)) + 1 }); }
      if (!conocimiento) conocimiento = await post('conocimientos', { nombre: e.conocimiento });
      const leccion = await post('lecciones', {
        titulo: e.titulo, descripcion: e.descripcion, slug, idioma_id: idioma.id,
        estado: 'borrador', fuente_id: fuente.id, url_origen: urlLimpia,
      });
      await post('bloques_contenido', { leccion_id: leccion.id, tipo: 'video', orden: 1, referencia: `youtube:${id}` });
      await post('lecciones_conocimientos', { leccion_id: leccion.id, conocimiento_id: conocimiento.id });
      const enTema = await buscar('ubicaciones_curriculares', { tema_id: tema.id }, 'id,orden');
      await post('ubicaciones_curriculares', { leccion_id: leccion.id, tema_id: tema.id, orden: Math.max(0, ...enTema.map((x) => x.orden ?? 0)) + 1, estado: 'publicado' });
      slugs.add(slug); urls.add(urlLimpia);
    }
    filas.push({
      n, resultado: APLICAR ? 'creada' : 'creada (simulacro)',
      motivo: `canal "${video.canal}"; fuente "${fuente.nombre}" (${fuente.licencia}); duración ${e.duracion_min} min; ${crea.length ? 'se crean: ' + crea.join(', ') : 'jerarquía existente'}; "${e.titulo}" (slug ${slug}, borrador)`,
    });
  }

  for (const f of filas) console.log(`${String(f.n).padEnd(4)} ${f.resultado.padEnd(18)} ${f.motivo}`);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
