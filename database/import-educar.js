// Importador de fichas de Educ.ar (solo licencias abiertas, solo video).
// Uso:
//   node database/import-educar.js            -> simulacro: no escribe nada
//   node database/import-educar.js --aplicar  -> escribe por la API de Directus
// Entrada: database/importar/lista.txt
//   URL_ficha | Año | Materia | Unidad | Tema | Conocimiento
const fs = require('fs');
const path = require('path');

const APLICAR = process.argv.includes('--aplicar');
const DIRECTUS = 'http://localhost:8055';
const ENV_FILE = path.join(__dirname, '..', '..', 'directus-admin', '.env');
const LISTA = path.join(__dirname, 'importar', 'lista.txt');
const UA = 'YOU-SCHOOL-importador (proyecto educativo gratuito)';
const EDUCAR_HOST = 'educar.arsat.com.ar';
const FUENTE_MINISTERIO = 'Ministerio de Educación de la Nación / Educ.ar';
const AUTOR_MINISTERIO = 'Ministerio de Educación de la Nación';
const LICENCIAS = { 'by': 'CC BY', 'by-sa': 'CC BY-SA', 'by-nc': 'CC BY-NC', 'by-nc-sa': 'CC BY-NC-SA' };

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function decodificar(s) {
  return s
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'").replace(/&ndash;|&#8211;/g, '–').replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í').replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ').replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú').replace(/&Ntilde;/g, 'Ñ').replace(/&uuml;/g, 'ü');
}

function textoLineas(html) {
  const sinScripts = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '');
  const conSaltos = sinScripts.replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr|label|span|a|dt|dd)>|<(p|div|li|h\d|tr|dt|dd)[^>]*>/gi, '\n');
  return decodificar(conSaltos.replace(/<[^>]+>/g, ''))
    .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

function valorDespues(lineas, etiqueta) {
  const i = lineas.findIndex((l) => l === etiqueta);
  return i === -1 || i + 1 >= lineas.length ? null : lineas[i + 1];
}

function valorOtrosContribuyentes(lineas) {
  const i = lineas.findIndex((l) => l === 'Otros contribuyentes');
  if (i === -1) return null;
  const siguiente = lineas[i + 1];
  return siguiente && !/^[A-ZÁÉÍÓÚÑ][a-zñáéíóú ]+$/.test(siguiente) ? siguiente : lineas[i + 1] ?? null;
}

function licenciaCC(texto) {
  if (!texto) return { ok: false, motivo: 'la ficha no indica licencia' };
  const t = texto.toLowerCase();
  if (t.includes('todos los derechos')) return { ok: false, motivo: 'todos los derechos reservados' };
  if (!t.includes('creative commons')) return { ok: false, motivo: `licencia no reconocida: "${texto}"` };
  const cod = t.match(/\((by(?:-[a-z]+)*)\)/);
  if (cod) {
    const c = cod[1];
    if (c.includes('nd')) return { ok: false, motivo: `licencia con No Derivadas (${c})` };
    if (!LICENCIAS[c]) return { ok: false, motivo: `licencia no aceptada (${c})` };
    return { ok: true, codigo: LICENCIAS[c] };
  }
  if (t.includes('sin derivadas')) return { ok: false, motivo: 'licencia con No Derivadas' };
  const b = t.includes('atribución');
  const nc = t.includes('no comercial');
  const sa = t.includes('compartir igual');
  if (!b) return { ok: false, motivo: `licencia no reconocida: "${texto}"` };
  return { ok: true, codigo: 'CC BY' + (nc ? '-NC' : '') + (sa ? '-SA' : '') };
}

function slugify(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function leerFicha(url) {
  await sleep(1000);
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`la ficha respondió ${r.status}`);
  const html = await r.text();
  const lineas = textoLineas(html);
  const titleTag = decodificar((html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '');
  const titulo = titleTag.split(' | Educ.ar')[0].trim() || null;
  const meta = decodificar((html.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || '').trim();
  const mp4s = [...new Set((decodificar(html).match(/https?:\/\/educar\.arsat\.com\.ar\/[^"'\s<>]+?\.mp4/gi) || []))]
    .filter((u) => !u.includes('/descarga/'));
  return {
    titulo,
    descripcion: meta || null,
    autor: valorDespues(lineas, 'Autor/es'),
    otros: valorOtrosContribuyentes(lineas),
    formato: valorDespues(lineas, 'Formato'),
    licencia: valorDespues(lineas, 'Licencia'),
    mp4: mp4s[0] ? new URL(mp4s[0]).toString() : null,
  };
}

async function verificarMp4(u) {
  const parsed = new URL(u);
  if (parsed.protocol !== 'https:' || parsed.hostname !== EDUCAR_HOST) return { ok: false, motivo: `video fuera de ${EDUCAR_HOST}` };
  const r = await fetch(u, { method: 'HEAD' });
  const tipo = r.headers.get('content-type') || '';
  if (r.status !== 200 || !tipo.includes('video/mp4')) return { ok: false, motivo: `el video no responde 200 video/mp4 (${r.status} ${tipo})` };
  return { ok: true };
}

async function resolverJerarquia(anioNombre, materiaNombre, unidadNombre, temaNombre, conocimientoNombre, plan) {
  const anios = await buscar('anios', { nombre: anioNombre });
  if (anios.length !== 1) return { ok: false, motivo: anios.length ? `año ambiguo: ${anioNombre}` : `el año "${anioNombre}" no existe` };
  const materias = await buscar('materias', { nombre: materiaNombre, anio_id: anios[0].id });
  if (materias.length !== 1) return { ok: false, motivo: `la materia "${materiaNombre}" no existe en ${anioNombre}` };
  const materia = materias[0];

  let unidad = (await buscar('unidades', { nombre: unidadNombre, materia_id: materia.id }))[0];
  if (!unidad) {
    const hermanas = await buscar('unidades', { materia_id: materia.id }, 'id,orden');
    unidad = { id: null, nombre: unidadNombre, orden: Math.max(0, ...hermanas.map((x) => x.orden ?? 0)) + 1, materia_id: materia.id };
    plan.push(`crear unidad "${unidadNombre}" (orden ${unidad.orden})`);
    if (APLICAR) unidad = await api('POST', '/items/unidades', { nombre: unidadNombre, materia_id: materia.id, orden: unidad.orden });
  }

  let tema = unidad.id ? (await buscar('temas', { nombre: temaNombre, unidad_id: unidad.id }))[0] : null;
  if (!tema) {
    const hermanos = unidad.id ? await buscar('temas', { unidad_id: unidad.id }, 'id,orden') : [];
    const orden = Math.max(0, ...hermanos.map((x) => x.orden ?? 0)) + 1;
    plan.push(`crear tema "${temaNombre}" (orden ${orden})`);
    tema = { id: null, nombre: temaNombre, orden };
    if (APLICAR) tema = await api('POST', '/items/temas', { nombre: temaNombre, unidad_id: unidad.id, orden });
  }

  let conocimiento = (await buscar('conocimientos', { nombre: conocimientoNombre }, 'id,nombre'))[0];
  if (!conocimiento) {
    plan.push(`crear conocimiento "${conocimientoNombre}"`);
    conocimiento = { id: null, nombre: conocimientoNombre };
    if (APLICAR) conocimiento = await api('POST', '/items/conocimientos', { nombre: conocimientoNombre });
  }
  return { ok: true, tema, conocimiento };
}

async function procesarLinea(linea, numero, idiomaId) {
  const partes = linea.split('|').map((x) => x.trim());
  if (partes.length !== 6) return { resultado: 'rechazada', motivo: `se esperaban 6 campos separados por |, hay ${partes.length}` };
  const [url, anioNombre, materiaNombre, unidadNombre, temaNombre, conocimientoNombre] = partes;

  let parsed;
  try { parsed = new URL(url); } catch { return { resultado: 'rechazada', motivo: 'URL inválida' }; }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'www.educ.ar' || !parsed.pathname.startsWith('/recursos/')) {
    return { resultado: 'rechazada', motivo: 'no es una ficha de educ.ar (https://www.educ.ar/recursos/...)' };
  }

  const yaExisteUrl = await buscar('lecciones', { url_origen: url }, 'id,slug');
  if (yaExisteUrl.length) return { resultado: 'saltada', motivo: `ya existe la lección ${yaExisteUrl[0].slug} con este url_origen` };

  let ficha;
  try { ficha = await leerFicha(url); } catch (e) { return { resultado: 'rechazada', motivo: `no se pudo leer la ficha: ${e.message}` }; }
  if (!ficha.titulo) return { resultado: 'rechazada', motivo: 'la ficha no tiene título' };

  const lic = licenciaCC(ficha.licencia);
  if (!lic.ok) return { resultado: 'rechazada', motivo: lic.motivo };
  if (ficha.formato !== 'Video') return { resultado: 'rechazada', motivo: `formato "${ficha.formato}": solo se importan videos` };
  if (!ficha.mp4) return { resultado: 'rechazada', motivo: 'no se encontró el MP4 en la ficha' };
  const v = await verificarMp4(ficha.mp4);
  if (!v.ok) return { resultado: 'rechazada', motivo: v.motivo };

  const slug = slugify(ficha.titulo);
  const yaExisteSlug = await buscar('lecciones', { slug }, 'id,slug');
  if (yaExisteSlug.length) return { resultado: 'saltada', motivo: `ya existe una lección con el slug "${slug}"` };

  const jer = await resolverJerarquia(anioNombre, materiaNombre, unidadNombre, temaNombre, conocimientoNombre, []).catch((e) => ({ ok: false, motivo: e.message }));
  if (!jer.ok) return { resultado: 'rechazada', motivo: jer.motivo };

  const esMinisterio = ficha.autor === AUTOR_MINISTERIO;
  const nombreFuente = esMinisterio ? FUENTE_MINISTERIO : ficha.autor;
  const plan = [];
  plan.push(`lección "${ficha.titulo}" (slug ${slug}, borrador, url_origen)`);
  plan.push(`bloque de video educar:${ficha.mp4.slice(0, 60)}...`);
  plan.push(`asociar a conocimiento "${conocimientoNombre}"`);
  plan.push(`ubicar en "${temaNombre}" con orden siguiente, publicado`);

  if (!APLICAR) {
    return { resultado: 'creada (simulacro)', motivo: `licencia ${lic.codigo}; fuente "${nombreFuente}"; ${plan.join('; ')}` };
  }

  // Escritura: fuente, lección, asociación, bloque y ubicación.
  let fuente = (await buscar('fuentes', { nombre: nombreFuente }, 'id,nombre'))[0];
  if (!fuente) fuente = await api('POST', '/items/fuentes', { nombre: nombreFuente, tipo: 'institución', url: 'https://www.educ.ar', licencia: lic.codigo });
  const leccion = await api('POST', '/items/lecciones', {
    titulo: ficha.titulo, descripcion: ficha.descripcion, slug, idioma_id: idiomaId,
    estado: 'borrador', fuente_id: fuente.id, url_origen: url,
  });
  await api('POST', '/items/lecciones_conocimientos', { leccion_id: leccion.id, conocimiento_id: jer.conocimiento.id });
  await api('POST', '/items/bloques_contenido', { leccion_id: leccion.id, tipo: 'video', orden: 1, referencia: `educar:${ficha.mp4}` });
  const enTema = await buscar('ubicaciones_curriculares', { tema_id: jer.tema.id }, 'id,orden');
  const ordenUb = Math.max(0, ...enTema.map((x) => x.orden ?? 0)) + 1;
  await api('POST', '/items/ubicaciones_curriculares', { leccion_id: leccion.id, tema_id: jer.tema.id, orden: ordenUb, estado: 'publicado' });
  return { resultado: 'creada', motivo: `lección ${slug} en "${temaNombre}" orden ${ordenUb} (borrador); fuente "${nombreFuente}"` };
}

async function main() {
  if (!fs.existsSync(LISTA)) throw new Error(`no existe ${LISTA}`);
  const lineas = fs.readFileSync(LISTA, 'utf-8').split('\n');
  const entradas = lineas.map((l, i) => ({ linea: l.trim(), n: i + 1 })).filter((e) => e.linea && !e.linea.startsWith('#'));

  const login = await fetch(DIRECTUS + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  if (!login.ok) throw new Error(`login en Directus falló (${login.status})`);
  TOKEN = (await login.json()).data.access_token;
  const idioma = (await buscar('idiomas', { codigo: 'es' }, 'id,codigo'))[0];
  if (!idioma) throw new Error('no existe el idioma es');

  console.log(APLICAR ? 'MODO: APLICAR (escribe en Directus)\n' : 'MODO: SIMULACRO (no escribe nada; usar --aplicar para escribir)\n');
  const filas = [];
  for (const e of entradas) {
    let r;
    try { r = await procesarLinea(e.linea, e.n, idioma.id); }
    catch (err) { r = { resultado: 'error', motivo: err.message }; }
    filas.push({ linea: e.n, ...r });
  }
  const ancho = (s, n) => String(s).padEnd(n).slice(0, n);
  console.log(ancho('Línea', 6), ancho('Resultado', 20), 'Motivo');
  for (const f of filas) console.log(ancho(f.linea, 6), ancho(f.resultado, 20), f.motivo);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
