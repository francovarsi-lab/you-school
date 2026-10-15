// Duración de un MP4 leyendo solo su encabezado (pedidos Range), sin descargar el archivo.
// Lee las cajas de nivel superior hasta "moov" y saca la duración de "mvhd".
const UA = 'YOU-SCHOOL-duracion (proyecto educativo gratuito)';

async function duracionMp4(url) {
  const pedir = async (desde, hasta) => {
    const r = await fetch(url, { headers: { Range: `bytes=${desde}-${hasta}`, 'User-Agent': UA } });
    if (r.status !== 206 && r.status !== 200) throw new Error(`HTTP ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
  };

  let pos = 0;
  for (let i = 0; i < 100; i++) {
    const cab = await pedir(pos, pos + 15);
    let tam = cab.readUInt32BE(0);
    const tipo = cab.toString('latin1', 4, 8);
    let cabeza = 8;
    if (tam === 1) { tam = Number(cab.readBigUInt64BE(8)); cabeza = 16; }
    if (tam < cabeza) throw new Error('caja inválida en el encabezado del MP4');
    if (tipo === 'moov') {
      const moov = await pedir(pos + cabeza, pos + tam - 1);
      const i2 = moov.indexOf('mvhd', 0, 'latin1');
      if (i2 < 0) throw new Error('moov sin mvhd');
      const version = moov[i2 + 4];
      // mvhd: version(1) flags(3) creación, modificación, escala (timescale) y duración.
      const escala = version === 1 ? moov.readUInt32BE(i2 + 24) : moov.readUInt32BE(i2 + 16);
      const duracion = version === 1 ? Number(moov.readBigUInt64BE(i2 + 28)) : moov.readUInt32BE(i2 + 20);
      return duracion / escala;
    }
    pos += tam;
  }
  throw new Error('no se encontró la caja moov');
}

module.exports = { duracionMp4 };
