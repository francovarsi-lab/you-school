// Auditoría de contenido de todas las lecciones. SOLO LECTURA.
// Uso: node database/auditoria-contenido.js
// Duración (encabezado del MP4), señales de TV, audiencia de la ficha, conocimientos y ubicaciones.
// Escribe docs/auditoria-contenido.md y, para el paso de publicación, database/importar/auditoria.json.
const fs = require('fs');
const path = require('path');
const { duracionMp4 } = require('./duracion-video.js');

const DIRECTUS = 'http://localhost:8055';
const ENV_FILE = path.join(__dirname, '..', '..', 'directus-admin', '.env');
const SALIDA = path.join(__dirname, '..', 'docs', 'auditoria-contenido.md');
const JSON_SALIDA = path.join(__dirname, 'importar', 'auditoria.json');
const UA = 'YOU-SCHOOL-auditoria (proyecto educativo gratuito)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sinTildes = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const esc = (s) => String(s ?? '').replace(/\|/g, '\|').replace(/\n/g, ' ');
const TV = /\b(conductor(es)?|programa|entrevista|charla|capitulo|episodio|conversan)\b/g;

const env = {};
for (const linea of fs.readFileSync(ENV_FILE, 'utf-8').split('\n')) {
  const t = linea.trim();
  if (!t || t.startsWith('#') || !t.includes('=')) continue;
  const i = t.indexOf('=');
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const ETIQ = ['Área / disciplina', 'Nivel', 'Categoría', 'Modalidad', 'Formato', 'Etiquetas', 'Autor/es', 'Otros contribuyentes', 'Licencia', 'Duración', 'Audiencia', 'Publicado', 'Última modificación'];
function valores(lineas, etiqueta) {
  const i = lineas.findIndex((l) => l === etiqueta);
  if (i === -1) return [];
  const out = [];
  for (let j = i + 1; j < lineas.length && !ETIQ.includes(lineas[j]); j++) out.push(lineas[j]);
  return out;
}

async function audienciaDeFicha(url) {
  try {
    await sleep(1000);
    const html = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
    const lineas = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '').replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr|label|span|a|dt|dd)>/gi, '\n').replace(/<[^>]+>/g, '').split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
    return valores(lineas, 'Audiencia');
  } catch {
    return null;
  }
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

  const lecciones = await get('/items/lecciones?limit=-1&fields=id,titulo,estado,descripcion,url_origen&sort=titulo');
  const bloques = await get('/items/bloques_contenido?limit=-1&filter[tipo][_eq]=video&fields=leccion_id,referencia');
  const conocimientos = await get('/items/lecciones_conocimientos?limit=-1&fields=leccion_id');
  const ubicaciones = await get('/items/ubicaciones_curriculares?limit=-1&fields=leccion_id,estado');

  const filas = [];
  for (const l of lecciones) {
    const video = bloques.find((b) => b.leccion_id === l.id);
    const ref = video?.referencia ?? '';
    let minutos = null;
    if (ref.startsWith('educar:')) {
      try { minutos = (await duracionMp4(ref.slice(7))) / 60; } catch { minutos = null; }
    }
    const texto = `${l.titulo ?? ''} ${l.descripcion ?? ''}`;
    const senales = [...new Set([...sinTildes(texto).matchAll(TV)].map((m) => m[0]))];
    if (minutos !== null && minutos > 10) senales.push(`duración ${minutos.toFixed(1)} min`);
    const audiencia = l.url_origen?.startsWith('https://www.educ.ar/') ? await audienciaDeFicha(l.url_origen) : null;

    let veredicto;
    if (!video) veredicto = 'sin video';
    else if (!ref.startsWith('educar:')) veredicto = 'sin dato (no es MP4 de educ.ar)';
    else if (minutos === null) veredicto = 'sin dato (no se pudo leer la duración)';
    else if (minutos > 20 || senales.some((s) => !s.startsWith('duración'))) veredicto = 'probable programa';
    else if (minutos > 10) veredicto = 'largo';
    else veredicto = 'pasa';

    filas.push({
      id: l.id,
      titulo: l.titulo,
      estado: l.estado,
      minutos,
      audiencia: audiencia && audiencia.length ? audiencia.join(', ') : (audiencia ? 'no figura' : 'sin ficha'),
      senales,
      veredicto,
      conocimientos: conocimientos.filter((c) => c.leccion_id === l.id).length,
      ubicaciones: ubicaciones.filter((u) => u.leccion_id === l.id).length,
    });
    console.log(`${veredicto.padEnd(22)} ${l.estado.padEnd(9)} ${l.titulo.slice(0, 50)}`);
  }

  fs.writeFileSync(JSON_SALIDA, JSON.stringify(filas, null, 1), 'utf-8');
  const md = [
    '# Auditoría de contenido',
    '',
    'Fecha: 2026-10-15. Solo lectura. Una lección es una clase de teoría: un concepto, explicación directa al alumno, corta. Duración leída del encabezado del MP4 de educ.ar.',
    '',
    `Lecciones: ${filas.length}. Pasan: ${filas.filter((f) => f.veredicto === 'pasa').length}. Largas: ${filas.filter((f) => f.veredicto === 'largo').length}. Probables programas: ${filas.filter((f) => f.veredicto === 'probable programa').length}. Sin dato: ${filas.filter((f) => f.veredicto.startsWith('sin')).length}.`,
    '',
    '| Título | id | Estado | Duración | Audiencia (ficha) | Señales | Veredicto | Conocimientos | Ubicaciones |',
    '|---|---|---|---|---|---|---|---|---|',
    ...filas.map((f) => `| ${esc(f.titulo)} | \`${f.id}\` | ${f.estado} | ${f.minutos === null ? 'sin dato' : f.minutos.toFixed(1) + ' min'} | ${esc(f.audiencia)} | ${esc(f.senales.join(', ') || '—')} | ${f.veredicto} | ${f.conocimientos} | ${f.ubicaciones} |`),
    '',
  ].join('\n');
  fs.writeFileSync(SALIDA, md, 'utf-8');
  console.log(`\nPasan: ${filas.filter((f) => f.veredicto === 'pasa').length}. Escrito en docs/auditoria-contenido.md`);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
