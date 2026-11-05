// Solo lectura: muestra la estructura de Matemática de Primaria (1.º a 6.º) y las lecciones que ya hay.
// Además guarda un respaldo JSON de lecciones, unidades y temas en database/backups/ antes de tocar nada.
// Uso: node database/inspeccionar-matematica.js
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

async function main() {
  const login = await fetch(B + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }) });
  if (!login.ok) throw new Error(`Login falló: ${login.status}`);
  const TOKEN = (await login.json()).data.access_token;
  const get = async (p) => {
    const r = await fetch(B + p, { headers: { Authorization: 'Bearer ' + TOKEN } });
    if (!r.ok) throw new Error(`GET ${p} -> ${r.status}`);
    return (await r.json()).data;
  };

  const lecciones = await get('/items/lecciones?limit=-1&fields=id,titulo,slug,estado,tipo_de_contenido,bloques');
  const unidades = await get('/items/unidades?limit=-1&fields=id,nombre,materia_id,orden');
  const temas = await get('/items/temas?limit=-1&fields=id,nombre,unidad_id,orden');
  const materias = await get('/items/materias?limit=-1&fields=id,nombre,anio_id');
  const anios = await get('/items/anios?limit=-1&fields=id,nombre');

  const fecha = new Date().toISOString().slice(0, 10);
  const respaldo = path.join(__dirname, 'backups', `pre-matematica-primaria-${fecha}.json`);
  fs.writeFileSync(respaldo, JSON.stringify({ lecciones, unidades, temas }, null, 2));
  console.log('Respaldo escrito:', respaldo);

  const aniosPrimaria = anios.filter((a) => /grado$/.test(a.nombre) && Number(a.nombre.match(/^(\d)/)?.[1]) <= 6);
  for (const a of aniosPrimaria.sort((x, y) => x.nombre.localeCompare(y.nombre))) {
    const mat = materias.find((m) => m.anio_id === a.id && m.nombre === 'Matemática');
    if (!mat) { console.log(`${a.nombre}: SIN materia Matemática`); continue; }
    const us = unidades.filter((u) => u.materia_id === mat.id);
    console.log(`\n${a.nombre} > Matemática (id ${mat.id})`);
    for (const u of us) {
      console.log(`  Unidad: ${u.nombre}`);
      for (const t of temas.filter((x) => x.unidad_id === u.id)) console.log(`    Tema: ${t.nombre}`);
    }
  }

  console.log('\nLecciones existentes en Primaria Matemática (por título):');
  for (const l of lecciones) console.log(`  [${l.estado}] ${l.titulo} (${l.slug}) tipo=${l.tipo_de_contenido}`);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
