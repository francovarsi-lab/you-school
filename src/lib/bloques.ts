// Formato de los bloques de lecciones propias (ver docs/bloques.md).
// Los datos vienen de Directus o de Supabase sin tipar: se validan antes de mostrarlos.
// Un bloque mal formado no rompe la lección: se muestra un aviso en su lugar.

export type Bloque =
  | { tipo: 'texto'; contenido: string; audio?: string }
  | { tipo: 'audio'; texto: string; audio?: string }
  | { tipo: 'imagen'; url: string; descripcion: string; cantidad: number }
  | { tipo: 'numero'; valor: number; objeto: string }
  | { tipo: 'ejercicio_opciones'; pregunta: string; opciones: string[]; correcta: number; explicacion: string; audio?: string }
  | { tipo: 'ejercicio_contar'; pregunta: string; objeto: string; cantidad: number }
  | { tipo: 'ejercicio_ordenar'; consigna: string; elementos: string[] }
  | { tipo: 'invalido' };

const texto = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;
const textos = (x: unknown): x is string[] => Array.isArray(x) && x.length > 0 && x.every(texto);
const entero = (x: unknown, min: number, max: number): x is number => typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max;
const MAX_OBJETOS = 20;
const OBJETO_POR_DEFECTO = 'estrella';

// Nombre de archivo pregrabado opcional: solo letras, números y guiones.
const archivo = (x: unknown): string | undefined => (texto(x) && /^[a-z0-9-]+$/.test(x) ? x : undefined);

export function normalizarBloque(raw: unknown): Bloque {
  const b = raw as Record<string, unknown> | null;
  if (!b || typeof b !== 'object') return { tipo: 'invalido' };
  switch (b.tipo) {
    case 'texto':
      return texto(b.contenido) ? { tipo: 'texto', contenido: b.contenido, audio: archivo(b.audio) } : { tipo: 'invalido' };
    case 'audio':
      return texto(b.texto) ? { tipo: 'audio', texto: b.texto, audio: archivo(b.audio) } : { tipo: 'invalido' };
    case 'imagen': {
      if (!texto(b.url) || !texto(b.descripcion)) return { tipo: 'invalido' };
      const cantidad = entero(b.cantidad, 1, MAX_OBJETOS) ? b.cantidad : 1;
      return { tipo: 'imagen', url: b.url, descripcion: b.descripcion, cantidad };
    }
    case 'numero': {
      if (!entero(b.valor, 0, MAX_OBJETOS)) return { tipo: 'invalido' };
      return { tipo: 'numero', valor: b.valor, objeto: texto(b.objeto) ? b.objeto : OBJETO_POR_DEFECTO };
    }
    case 'ejercicio_opciones': {
      const ok = texto(b.pregunta) && textos(b.opciones) && b.opciones.length >= 2 && entero(b.correcta, 0, b.opciones.length - 1) && texto(b.explicacion);
      return ok
        ? { tipo: 'ejercicio_opciones', pregunta: b.pregunta as string, opciones: b.opciones as string[], correcta: b.correcta as number, explicacion: b.explicacion as string, audio: archivo(b.audio) }
        : { tipo: 'invalido' };
    }
    case 'ejercicio_contar': {
      const ok = texto(b.pregunta) && texto(b.objeto) && entero(b.cantidad, 1, MAX_OBJETOS);
      return ok ? { tipo: 'ejercicio_contar', pregunta: b.pregunta as string, objeto: b.objeto as string, cantidad: b.cantidad as number } : { tipo: 'invalido' };
    }
    case 'ejercicio_ordenar':
      return texto(b.consigna) && textos(b.elementos)
        ? { tipo: 'ejercicio_ordenar', consigna: b.consigna, elementos: b.elementos }
        : { tipo: 'invalido' };
    default:
      return { tipo: 'invalido' };
  }
}

export function normalizarBloques(raw: unknown): Bloque[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizarBloque);
}

// Todos los archivos pregrabados que necesita una lección (para precargarlos al abrirla).
export function rutasAudio(bloques: Bloque[]): string[] {
  const numeros = new Set<number>();
  const frases = new Set<string>();
  for (const b of bloques) {
    if (b.tipo === 'numero') numeros.add(b.valor);
    if (b.tipo === 'imagen') for (let n = 1; n <= b.cantidad; n++) numeros.add(n);
    if (b.tipo === 'ejercicio_contar') for (let n = 1; n <= b.cantidad; n++) numeros.add(n);
    if (b.tipo === 'ejercicio_ordenar') for (const e of b.elementos) if (/^\d+$/.test(e) && Number(e) <= MAX_OBJETOS) numeros.add(Number(e));
    if ((b.tipo === 'texto' || b.tipo === 'audio') && b.audio) frases.add(b.audio);
    if (b.tipo === 'ejercicio_opciones' && b.audio) frases.add(b.audio);
  }
  return [...[...numeros].map(rutaNumero), ...[...frases].map(rutaFrase)];
}

export const rutaNumero = (n: number) => `/audio/numero-${n}.mp3`;
export const rutaFrase = (clave: string) => `/audio/${clave}.mp3`;
