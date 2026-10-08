export type VideoEmbed = { ok: true; src: string } | { ok: false; error: string };

const YOUTUBE_PREFIX = 'youtube:';
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function resolveVideoReference(ref: string): VideoEmbed {
  if (ref.startsWith(YOUTUBE_PREFIX)) {
    const id = ref.slice(YOUTUBE_PREFIX.length);
    if (!YOUTUBE_ID.test(id)) {
      return { ok: false, error: `ID de YouTube inválido: "${id}"` };
    }
    return { ok: true, src: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  const prefix = ref.split(':')[0];
  return { ok: false, error: `Prefijo de video desconocido: "${prefix}"` };
}
