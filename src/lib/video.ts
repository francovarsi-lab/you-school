export type VideoEmbed =
  | { ok: true; kind: 'iframe'; src: string }
  | { ok: true; kind: 'file'; src: string }
  | { ok: false; error: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const EDUCAR_HOST = 'educar.arsat.com.ar';

export function resolveVideoReference(ref: string): VideoEmbed {
  const sep = ref.indexOf(':');
  const prefijo = sep === -1 ? ref : ref.slice(0, sep);
  const valor = sep === -1 ? '' : ref.slice(sep + 1);

  if (prefijo === 'youtube') {
    if (!YOUTUBE_ID.test(valor)) {
      return { ok: false, error: `ID de YouTube inválido: "${valor}"` };
    }
    return { ok: true, kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${valor}` };
  }

  if (prefijo === 'educar') {
    let url: URL;
    try {
      url = new URL(valor);
    } catch {
      return { ok: false, error: 'URL de video de educ.ar inválida' };
    }
    if (url.protocol !== 'https:' || url.hostname !== EDUCAR_HOST) {
      return { ok: false, error: `Video no permitido: ${url.hostname}` };
    }
    return { ok: true, kind: 'file', src: url.toString() };
  }

  return { ok: false, error: `Prefijo de video desconocido: "${prefijo}"` };
}
