// Audio de las lecciones, todo gratis:
// - Archivos pregrabados en public/audio (generados una vez con Piper, ver database/generar-audio.py).
// - La voz del navegador (SpeechSynthesis) solo como respaldo.
// - Sonidos de acierto y error con Web Audio (sin archivos).
// Todo se puede silenciar. Si un archivo falta, se usa la voz; si tampoco hay voz, no pasa nada.

let silenciado = false;

export function estaSilenciado() {
  return silenciado;
}

export function setSilenciado(valor: boolean) {
  silenciado = valor;
  if (valor) detener();
}

const cache = new Map<string, HTMLAudioElement>();
const faltan = new Set<string>();
let actual: HTMLAudioElement | null = null;

function audioDe(ruta: string): HTMLAudioElement {
  let a = cache.get(ruta);
  if (!a) {
    a = new Audio(ruta);
    a.preload = 'auto';
    a.addEventListener('error', () => faltan.add(ruta));
    cache.set(ruta, a);
  }
  return a;
}

// Carga por adelantado los archivos de la lección, para que suenen sin demora.
export function precargarAudios(rutas: string[]) {
  if (typeof window === 'undefined') return;
  for (const r of rutas) if (!faltan.has(r)) audioDe(r);
}

// Quita la voz del navegador desde el primer uso: una voz vieja no se encola detrás de la nueva.
export function detener() {
  if (actual) {
    actual.pause();
    actual.currentTime = 0;
    actual = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function hablar(texto: string, voz: SpeechSynthesisVoice) {
  if (silenciado || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const ss = window.speechSynthesis;
  ss.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.voice = voz;
  u.lang = voz.lang;
  ss.speak(u);
}

// Suena el archivo pregrabado si existe; si no, habla con la voz del navegador.
export async function escuchar(ruta: string | undefined, texto: string, voz: SpeechSynthesisVoice | null) {
  if (silenciado) return;
  if (ruta && !faltan.has(ruta)) {
    const a = audioDe(ruta);
    detener();
    actual = a;
    a.currentTime = 0;
    try {
      await a.play();
      return;
    } catch {
      faltan.add(ruta);
      actual = null;
    }
  }
  if (voz) hablar(texto, voz);
}

let ctx: AudioContext | null = null;

function contexto(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  return ctx;
}

// Tonos cortos y suaves, uno detrás del otro.
function tonos(frecuencias: number[], duracion: number, forma: OscillatorType) {
  const c = contexto();
  if (!c || silenciado) return;
  if (c.state === 'suspended') void c.resume();
  frecuencias.forEach((f, i) => {
    const t = c.currentTime + i * duracion;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = forma;
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + duracion + 0.02);
  });
}

export function sonidoAcierto() {
  tonos([659, 880], 0.12, 'sine');
}

export function sonidoError() {
  tonos([220], 0.25, 'triangle');
}
