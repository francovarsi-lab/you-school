// Chequeo de enlaces de video. SOLO LECTURA: no cambia nada en Directus ni en la base.
// Uso: node database/chequear-videos.js
// Recorre todas las lecciones (publicadas y borrador), verifica cada bloque de video
// y escribe el reporte en consola y en docs/reporte-videos.md. Un pedido por segundo.
const fs = require('fs');
const path = require('path');

const DIRECTUS = 'http://localhost:8055';
const ENV_FILE = path.join(__dirname, '..', '..', 'directus-admin', '.env');
const SALIDA = path.join(__dirname, '..', 'docs', 'reporte-videos.md');
const UA = 'YOU-SCHOOL-chequeo-videos (proyecto educativo gratuito)';
const EDUCAR_HOST = 'educar.arsat.com.ar';
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

const env = {};
for (const linea of fs.readFileSync(ENV_FILE, 'utf-8').split('\n')) {
  const t = linea.trim();
  if (!t || t.startsWith('#') || !t.includes('=')) continue;
  const i = t.indexOf('=');
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

async function pedir(url, opciones = {}) {
  return fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA }, ...opciones });
}

// Devuelve { estado: 'ok' | 'roto' | 'no verificable', motivo }
async function verificarYouTube(id) {
  if (!YOUTUBE_ID.test(id)) return { estado: 'roto', motivo: `ID de YouTube con formato inválido: "${id}"` };
  const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
  try {
    await sleep(1000);
    const r = await pedir(oembed);
    if (r.status === 200) return { estado: 'ok', motivo: 'oEmbed responde 200' };
    if (r.status === 401 || r.status === 403 || r.status === 404) {
      return { estado: 'roto', motivo: `YouTube responde ${r.status}: el video no existe, es privado o no permite embeber` };
    }
    return { estado: 'no verificable', motivo: `YouTube responde ${r.status}` };
  } catch (e) {
    return { estado: 'no verificable', motivo: `sin conexión con YouTube (${e.message})` };
  }
}

// Devuelve { estado, motivo }
async function verificarMp4(url) {
  let parsed;
  try { parsed = new URL(url); } catch { return { estado: 'roto', motivo: 'URL inválida' }; }
  if (parsed.protocol !== 'https:' || parsed.hostname !== EDUCAR_HOST) {
    return { estado: 'roto', motivo: `video fuera de ${EDUCAR_HOST}` };
  }
  try {
    await sleep(1000);
    const head = await pedir(url, { method: 'HEAD' });
    const tipo = head.headers.get('content-type') || '';
    if (head.status === 200 && tipo.includes('video/mp4')) return { estado: 'ok', motivo: 'HEAD: 200 video/mp4' };
    if (head.status >= 400 && head.status < 500) {
      return { estado: 'roto', motivo: `HEAD: ${head.status}` };
    }
    // Algunos servidores no responden bien a HEAD: se prueba un rango pequeño.
    await sleep(1000);
    const get = await pedir(url, { headers: { Range: 'bytes=0-1023', 'User-Agent': UA } });
    const tipoGet = get.headers.get('content-type') || '';
    await get.arrayBuffer();
    if ((get.status === 200 || get.status === 206) && tipoGet.includes('video')) {
      return { estado: 'ok', motivo: `GET con rango: ${get.status} ${tipoGet}` };
    }
    if (get.status >= 400 && get.status < 500) return { estado: 'roto', motivo: `GET: ${get.status}` };
    return { estado: 'no verificable', motivo: `HEAD ${head.status} ${tipo}; GET ${get.status} ${tipoGet}` };
  } catch (e) {
    return { estado: 'no verificable', motivo: `sin conexión con educ.ar (${e.message})` };
  }
}

async function verificar(referencia) {
  const sep = referencia.indexOf(':');
  const prefijo = sep === -1 ? referencia : referencia.slice(0, sep);
  const valor = sep === -1 ? '' : referencia.slice(sep + 1);
  if (prefijo === 'youtube') return { tipo: 'youtube', ...(await verificarYouTube(valor)) };
  if (prefijo === 'educar') return { tipo: 'educar (MP4)', ...(await verificarMp4(valor)) };
  return { tipo: prefijo || '(vacío)', estado: 'roto', motivo: `prefijo de video desconocido: "${prefijo}"` };
}

async function main() {
  const login = await pedir(DIRECTUS + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  if (!login.ok) throw new Error(`login en Directus falló (${login.status})`);
  const token = (await login.json()).data.access_token;
  const get = async (p) => {
    const r = await pedir(DIRECTUS + p, { headers: { Authorization: 'Bearer ' + token } });
    if (!r.ok) throw new Error(`GET ${p} -> ${r.status}`);
    return (await r.json()).data;
  };

  const lecciones = await get('/items/lecciones?limit=-1&fields=id,titulo,estado&sort=titulo');
  const bloques = await get('/items/bloques_contenido?limit=-1&filter[tipo][_eq]=video&fields=leccion_id,referencia,orden');
  const porLeccion = new Map();
  for (const b of bloques) {
    if (!porLeccion.has(b.leccion_id)) porLeccion.set(b.leccion_id, []);
    porLeccion.get(b.leccion_id).push(b);
  }

  const filas = [];
  for (const l of lecciones) {
    const videos = porLeccion.get(l.id) ?? [];
    if (videos.length === 0) {
      filas.push({ leccion: l.titulo, id: l.id, estado_leccion: l.estado, tipo: '—', estado: 'sin video', motivo: 'la lección no tiene bloques de video' });
      continue;
    }
    for (const v of videos) {
      const r = await verificar(v.referencia);
      filas.push({ leccion: l.titulo, id: l.id, estado_leccion: l.estado, tipo: r.tipo, estado: r.estado, motivo: r.motivo });
      console.log(`${r.estado.padEnd(14)} ${r.tipo.padEnd(12)} ${l.titulo.slice(0, 50)}`);
    }
  }

  const cuenta = (e) => filas.filter((f) => f.estado === e).length;
  const md = [
    '# Reporte de enlaces de video',
    '',
    `Fecha: 2026-10-13. Chequeo de solo lectura: no cambió ninguna lección.`,
    '',
    `Lecciones revisadas: ${lecciones.length}. Videos verificados: ${filas.length}. ok: ${cuenta('ok')}. roto: ${cuenta('roto')}. no verificable: ${cuenta('no verificable')}. sin video: ${cuenta('sin video')}.`,
    '',
    '| Lección | id | Estado de la lección | Tipo | Resultado | Motivo |',
    '|---|---|---|---|---|---|',
    ...filas.map((f) => `| ${esc(f.leccion)} | \`${f.id}\` | ${f.estado_leccion} | ${esc(f.tipo)} | ${f.estado} | ${esc(f.motivo)} |`),
    '',
  ].join('\n');
  fs.writeFileSync(SALIDA, md, 'utf-8');
  console.log(`\nok: ${cuenta('ok')} | roto: ${cuenta('roto')} | no verificable: ${cuenta('no verificable')} | sin video: ${cuenta('sin video')}`);
  console.log(`Reporte escrito en ${path.relative(process.cwd(), SALIDA)}`);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
