// Publica (o revierte a borrador) lecciones importadas de Educ.ar, identificadas por su ficha.
// Uso:
//   node database/publicar-lecciones.js --ids=155979,155971            -> simulacro
//   node database/publicar-lecciones.js --ids=155979,155971 --aplicar  -> publica
//   node database/publicar-lecciones.js --ids=155979 --revertir --aplicar -> vuelve a borrador
// Solo cambia el estado de las lecciones indicadas. Escribe por la API de Directus.
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const APLICAR = args.includes('--aplicar');
const REVERTIR = args.includes('--revertir');
const idsArg = args.find((a) => a.startsWith('--ids='));
const IDS = idsArg ? idsArg.slice('--ids='.length).split(',').map((s) => s.trim()).filter(Boolean) : [];

const DIRECTUS = 'http://localhost:8055';
const ENV_FILE = path.join(__dirname, '..', '..', 'directus-admin', '.env');
const EDUCAR_HOST = 'educar.arsat.com.ar';

if (!IDS.length) { console.error('Falta --ids=<id,id,...>'); process.exit(1); }

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

async function verificarMp4(referencia) {
  if (!referencia || !referencia.startsWith('educar:')) return { ok: false, motivo: 'el bloque de video no es educar:' };
  let url;
  try { url = new URL(referencia.slice('educar:'.length)); } catch { return { ok: false, motivo: 'URL de video inválida' }; }
  if (url.protocol !== 'https:' || url.hostname !== EDUCAR_HOST) return { ok: false, motivo: `video fuera de ${EDUCAR_HOST}` };
  const r = await fetch(url.toString(), { method: 'HEAD' });
  const tipo = r.headers.get('content-type') || '';
  if (r.status !== 200 || !tipo.includes('video/mp4')) return { ok: false, motivo: `video no responde 200 video/mp4 (${r.status} ${tipo})` };
  return { ok: true };
}

async function revisar(leccion) {
  const ub = (await api('GET', `/items/ubicaciones_curriculares?filter[leccion_id][_eq]=${leccion.id}&limit=-1&fields=tema_id.nombre,tema_id.unidad_id.nombre`))[0];
  const unidadTema = ub ? `${ub.tema_id.unidad_id.nombre} > ${ub.tema_id.nombre}` : 'sin ubicación';
  const bloques = await api('GET', `/items/bloques_contenido?filter[leccion_id][_eq]=${leccion.id}&limit=-1&fields=tipo,referencia`);
  const video = bloques.find((b) => b.tipo === 'video');
  const mp4 = await verificarMp4(video?.referencia);
  const conoc = await api('GET', `/items/lecciones_conocimientos?filter[leccion_id][_eq]=${leccion.id}&limit=-1&fields=id`);
  const fuente = leccion.fuente_id?.nombre ?? 'sin fuente';
  const licencia = leccion.fuente_id?.licencia ?? 'sin licencia';
  const problemas = [];
  if (!ub) problemas.push('sin ubicación curricular');
  if (!leccion.fuente_id) problemas.push('sin fuente');
  if (!leccion.fuente_id?.licencia) problemas.push('sin licencia');
  if (!mp4.ok) problemas.push(mp4.motivo);
  if (!conoc.length) problemas.push('no asociada a conocimiento');
  return {
    titulo: leccion.titulo, unidadTema, fuente, licencia, url: leccion.url_origen ?? '-',
    mp4: mp4.ok ? 'sí (200 video/mp4)' : `no: ${mp4.motivo}`,
    conocimiento: conoc.length ? 'sí' : 'no',
    problemas,
  };
}

async function main() {
  const login = await fetch(DIRECTUS + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  if (!login.ok) throw new Error(`login en Directus falló (${login.status})`);
  TOKEN = (await login.json()).data.access_token;

  console.log(APLICAR ? 'MODO: APLICAR' : 'MODO: SIMULACRO (no escribe nada; usar --aplicar)');
  console.log(REVERTIR ? 'ACCIÓN: volver a borrador\n' : 'ACCIÓN: publicar\n');

  const filas = [];
  for (const id of IDS) {
    const url = `https://www.educ.ar/recursos/${id}`;
    const lec = (await api('GET', `/items/lecciones?filter[url_origen][_eq]=${encodeURIComponent(url)}&limit=-1&fields=id,titulo,estado,url_origen,fuente_id.nombre,fuente_id.licencia`))[0];
    if (!lec) { filas.push({ id, resultado: 'no encontrada', motivo: `ninguna lección con url_origen ${url}` }); continue; }
    const r = await revisar(lec);
    const estadoDeseado = REVERTIR ? 'borrador' : 'publicado';
    let resultado;
    let motivo = '';
    if (lec.estado === estadoDeseado) {
      resultado = 'saltada';
      motivo = `ya está en ${estadoDeseado}`;
    } else if (!REVERTIR && r.problemas.length) {
      resultado = 'no publicada';
      motivo = r.problemas.join('; ');
    } else {
      resultado = APLICAR ? estadoDeseado : `cambiaría a ${estadoDeseado}`;
      if (APLICAR) await api('PATCH', `/items/lecciones/${lec.id}`, { estado: estadoDeseado });
    }
    filas.push({ id, resultado, motivo, ...r });
  }

  for (const f of filas) {
    if (!f.titulo) { console.log(`${f.id} | ${f.resultado} | ${f.motivo}`); continue; }
    console.log(`\n${f.titulo}`);
    console.log(`  unidad > tema: ${f.unidadTema}`);
    console.log(`  fuente: ${f.fuente} | licencia: ${f.licencia}`);
    console.log(`  url_origen: ${f.url}`);
    console.log(`  MP4: ${f.mp4} | asociada a conocimiento: ${f.conocimiento}`);
    console.log(`  resultado: ${f.resultado}${f.motivo ? ' (' + f.motivo + ')' : ''}`);
  }
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
