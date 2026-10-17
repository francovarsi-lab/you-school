// Formato de los bloques de lecciones propias (ver docs/bloques.md).
// Los datos vienen de Directus o de Supabase sin tipar: se validan antes de mostrarlos.
// Un bloque mal formado no rompe la lección: se muestra un aviso en su lugar.

export type Bloque =
  | { tipo: 'texto'; contenido: string }
  | { tipo: 'audio'; texto: string }
  | { tipo: 'imagen'; url: string; descripcion: string; cantidad: number }
  | { tipo: 'ejercicio_opciones'; pregunta: string; opciones: string[]; correcta: number; explicacion: string }
  | { tipo: 'ejercicio_contar'; pregunta: string; objeto: string; cantidad: number }
  | { tipo: 'ejercicio_ordenar'; consigna: string; elementos: string[] }
  | { tipo: 'invalido' };

const texto = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;
const textos = (x: unknown): x is string[] => Array.isArray(x) && x.length > 0 && x.every(texto);
const MAX_OBJETOS = 20;

export function normalizarBloque(raw: unknown): Bloque {
  const b = raw as Record<string, unknown> | null;
  if (!b || typeof b !== 'object') return { tipo: 'invalido' };
  switch (b.tipo) {
    case 'texto':
      return texto(b.contenido) ? { tipo: 'texto', contenido: b.contenido } : { tipo: 'invalido' };
    case 'audio':
      return texto(b.texto) ? { tipo: 'audio', texto: b.texto } : { tipo: 'invalido' };
    case 'imagen': {
      if (!texto(b.url) || !texto(b.descripcion)) return { tipo: 'invalido' };
      const cantidad = typeof b.cantidad === 'number' && Number.isInteger(b.cantidad) ? Math.min(Math.max(b.cantidad, 1), MAX_OBJETOS) : 1;
      return { tipo: 'imagen', url: b.url, descripcion: b.descripcion, cantidad };
    }
    case 'ejercicio_opciones': {
      const ok = texto(b.pregunta) && textos(b.opciones) && b.opciones.length >= 2 && Number.isInteger(b.correcta)
        && (b.correcta as number) >= 0 && (b.correcta as number) < (b.opciones as string[]).length && texto(b.explicacion);
      return ok
        ? { tipo: 'ejercicio_opciones', pregunta: b.pregunta as string, opciones: b.opciones as string[], correcta: b.correcta as number, explicacion: b.explicacion as string }
        : { tipo: 'invalido' };
    }
    case 'ejercicio_contar': {
      const ok = texto(b.pregunta) && texto(b.objeto) && Number.isInteger(b.cantidad) && (b.cantidad as number) >= 1 && (b.cantidad as number) <= MAX_OBJETOS;
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
