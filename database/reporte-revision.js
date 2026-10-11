// Genera database/reportes/revision-lecciones.html: todas las lecciones agrupadas por
// Año > Materia > Unidad > Tema. Lee solo por la API de Directus. Sin recursos externos.
const fs = require('fs');
const path = require('path');

const DIRECTUS = 'http://localhost:8055';
const ENV_FILE = path.join(__dirname, '..', '..', 'directus-admin', '.env');
const SALIDA_DIR = path.join(__dirname, 'reportes');
const SALIDA = path.join(SALIDA_DIR, 'revision-lecciones.html');

const env = {};
for (const linea of fs.readFileSync(ENV_FILE, 'utf-8').split('\n')) {
  const t = linea.trim();
  if (!t || t.startsWith('#') || !t.includes('=')) continue;
  const i = t.indexOf('=');
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function main() {
  const login = await fetch(DIRECTUS + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  if (!login.ok) throw new Error(`login en Directus falló (${login.status})`);
  const token = (await login.json()).data.access_token;
  const get = async (p) => {
    const r = await fetch(DIRECTUS + p, { headers: { Authorization: 'Bearer ' + token } });
    if (!r.ok) throw new Error(`GET ${p} -> ${r.status} ${await r.text()}`);
    return (await r.json()).data;
  };

  const ubicaciones = await get(
    '/items/ubicaciones_curriculares?limit=-1&fields=orden,estado,' +
    'leccion_id.id,leccion_id.titulo,leccion_id.estado,leccion_id.url_origen,leccion_id.fuente_id.nombre,leccion_id.fuente_id.licencia,' +
    'tema_id.id,tema_id.nombre,tema_id.unidad_id.id,tema_id.unidad_id.nombre,tema_id.unidad_id.materia_id.id,tema_id.unidad_id.materia_id.nombre,' +
    'tema_id.unidad_id.materia_id.anio_id.id,tema_id.unidad_id.materia_id.anio_id.nombre,tema_id.unidad_id.materia_id.anio_id.orden'
  );
  const lecciones = await get('/items/lecciones?limit=-1&fields=id,titulo,estado,url_origen,fuente_id.nombre,fuente_id.licencia');
  const conUbicacion = new Set(ubicaciones.map((u) => u.leccion_id?.id));

  const arbol = new Map();
  for (const u of ubicaciones) {
    const a = u.tema_id.unidad_id.materia_id.anio_id;
    const m = u.tema_id.unidad_id.materia_id;
    const un = u.tema_id.unidad_id;
    const t = u.tema_id;
    const claves = [a.id, m.id, un.id, t.id];
    let nodo = arbol;
    const nombres = [a.nombre, m.nombre, un.nombre, t.nombre];
    const ordenAnio = a.orden ?? 999;
    claves.forEach((k, i) => {
      if (!nodo.has(k)) nodo.set(k, { nombre: nombres[i], orden: i === 0 ? ordenAnio : 0, hijos: new Map(), lecciones: [] });
      if (i < 3) nodo = nodo.get(k).hijos;
      else nodo.get(k).lecciones.push({ ...u.leccion_id, orden: u.orden });
    });
  }

  const sinUbicacion = lecciones.filter((l) => !conUbicacion.has(l.id));
  const estadoTxt = (e) => (e === 'publicado' ? 'Publicado' : 'Borrador');
  const estadoClase = (e) => (e === 'publicado' ? 'pub' : 'bor');
  const enlace = (url) => {
    if (!url) return '';
    const label = /educ\.ar/i.test(url) ? 'Ver ficha en Educ.ar' : 'Ver fuente original';
    return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  };
  const leccionHtml = (l) => `
    <li class="leccion">
      <div class="titulo">${esc(l.titulo)} <span class="estado ${estadoClase(l.estado)}">${estadoTxt(l.estado)}</span></div>
      <div class="meta">Fuente: ${esc(l.fuente_id?.nombre ?? 'sin fuente')}${l.fuente_id?.licencia ? ' · Licencia: ' + esc(l.fuente_id.licencia) : ''}</div>
      ${l.url_origen ? `<div class="meta">${enlace(l.url_origen)}</div>` : ''}
    </li>`;

  const ramas = (mapa, nivel) => [...mapa.values()]
    .sort((x, y) => (x.orden - y.orden) || x.nombre.localeCompare(y.nombre))
    .map((n) => {
      const hijos = n.hijos.size ? ramas(n.hijos, nivel + 1) : '';
      const lec = n.lecciones.length
        ? `<ul class="lista">${n.lecciones.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).map(leccionHtml).join('')}</ul>`
        : '';
      return `<details class="nivel n${nivel}" open><summary>${esc(n.nombre)}</summary>${hijos}${lec}</details>`;
    }).join('');

  const total = lecciones.length;
  const pub = lecciones.filter((l) => l.estado === 'publicado').length;
  const bor = total - pub;
  const generado = new Date().toLocaleString('es-AR');

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Revisión de lecciones: YOU SCHOOL</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #111; background: #f8fafc; margin: 0; padding: 16px; line-height: 1.4; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .resumen { color: #334155; margin: 0 0 16px; font-size: 15px; }
  details { margin: 6px 0; }
  summary { cursor: pointer; font-weight: 600; padding: 8px 4px; min-height: 40px; display: flex; align-items: center; }
  .n0 > summary { font-size: 20px; background: #e2e8f0; padding: 10px; border-radius: 8px; }
  .n1 > summary { font-size: 18px; }
  .n2 > summary { font-size: 16px; }
  .n3 > summary { font-size: 15px; font-weight: 500; }
  details.n0, details.n1, details.n2, details.n3 { padding-left: 10px; border-left: 3px solid #cbd5e1; }
  .lista { list-style: none; padding: 0 0 8px 6px; margin: 0; }
  .leccion { background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin: 8px 0; }
  .titulo { font-weight: 600; }
  .meta { font-size: 14px; color: #334155; margin-top: 4px; word-break: break-word; }
  .meta a { color: #1e40af; }
  .estado { display: inline-block; font-size: 12px; padding: 2px 8px; border-radius: 999px; margin-left: 6px; vertical-align: middle; }
  .estado.bor { background: #fef3c7; color: #78350f; }
  .estado.pub { background: #dcfce7; color: #14532d; }
  .sin { margin-top: 24px; }
  @media (min-width: 720px) { body { padding: 24px; max-width: 960px; margin: 0 auto; } }
</style>
</head>
<body>
<h1>Revisión de lecciones</h1>
<p class="resumen">Total: ${total} lecciones (${bor} en borrador, ${pub} publicadas). Generado el ${esc(generado)}.</p>
${ramas(arbol, 0)}
${sinUbicacion.length ? `<div class="sin"><details class="n0" open><summary>Sin ubicación curricular (${sinUbicacion.length})</summary><ul class="lista">${sinUbicacion.map(leccionHtml).join('')}</ul></details></div>` : ''}
</body>
</html>
`;

  fs.mkdirSync(SALIDA_DIR, { recursive: true });
  fs.writeFileSync(SALIDA, html, 'utf-8');
  console.log(`Reporte: ${SALIDA}`);
  console.log(`Lecciones: ${total} (borrador ${bor}, publicadas ${pub}); sin ubicación: ${sinUbicacion.length}`);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
