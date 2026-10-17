// Ilustraciones por clave: las lecciones guardan la clave ("manzana"), no el emoji ni una URL.
// Más adelante cada clave puede apuntar a un SVG propio sin tocar las lecciones (ver docs/estilo-visual.md).
// Si la clave no existe, el visor muestra la descripción del bloque en su lugar.

export const ILUSTRACIONES: Record<string, string> = {
  manzana: '🍎',
  pelota: '⚽',
  estrella: '⭐',
  sol: '☀️',
  luna: '🌙',
  casa: '🏠',
  arbol: '🌳',
  perro: '🐶',
  gato: '🐱',
  pez: '🐟',
  auto: '🚗',
  flor: '🌸',
};

export function ilustracion(clave: string): string | null {
  return Object.prototype.hasOwnProperty.call(ILUSTRACIONES, clave) ? ILUSTRACIONES[clave] : null;
}
