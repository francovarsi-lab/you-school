'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ilustracion } from '@/lib/ilustraciones';
import { type Bloque, normalizarBloques } from '@/lib/bloques';

// Un bloque por pantalla. Sin puntos, rachas, vidas ni animaciones de premio.
// Ningún avance se bloquea por fallar: "Siguiente" siempre está disponible.

export type Respuesta = { pantalla: number; tipo: string; correcta: boolean };

export type Cierre = {
  fuente: string | null;
  fuenteHref: string | null;
  autor: string | null;
  licencia: string | null;
  siguiente: { href: string; texto: string } | null;
};

type Props = {
  bloques: unknown;
  semilla: string;
  cierre: Cierre;
  // Único punto donde un progreso futuro puede engancharse. Hoy no guarda nada.
  alResponder?: (r: Respuesta) => void;
};

const BOTON = 'flex min-h-12 items-center justify-center rounded-lg border-2 px-6 py-3 text-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50';
const BOTON_PRIMARIO = `${BOTON} border-blue-800 bg-blue-800 text-white hover:bg-blue-900`;
const BOTON_SECUNDARIO = `${BOTON} border-gray-600 bg-white text-gray-900 hover:bg-gray-100`;
const BOTON_OPCION = `${BOTON} w-full justify-start text-left border-gray-600 bg-white text-gray-900 hover:bg-gray-100`;

// Lectura en voz alta con la voz del navegador. Si no hay voz en español, el botón no aparece.
function BotonEscuchar({ texto }: { texto: string }) {
  const [voz, setVoz] = useState<SpeechSynthesisVoice | null>(null);
  const [hablando, setHablando] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    const ss = window.speechSynthesis;
    const buscar = () => {
      const voces = ss.getVoices();
      setVoz(voces.find((v) => v.lang === 'es-AR') ?? voces.find((v) => v.lang.toLowerCase().startsWith('es')) ?? null);
    };
    buscar();
    ss.addEventListener('voiceschanged', buscar);
    return () => {
      ss.removeEventListener('voiceschanged', buscar);
      ss.cancel();
    };
  }, []);

  if (!voz) return null;

  const alternar = () => {
    const ss = window.speechSynthesis;
    if (hablando) {
      ss.cancel();
      setHablando(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(texto);
    u.voice = voz;
    u.lang = voz.lang;
    u.onend = () => setHablando(false);
    u.onerror = () => setHablando(false);
    setHablando(true);
    ss.speak(u);
  };

  return (
    <button type="button" onClick={alternar} className={BOTON_SECUNDARIO}>
      {hablando ? 'Detener' : 'Escuchar'}
    </button>
  );
}

// Orden fijo por lección (no cambia entre visitas ni entre servidor y navegador).
function hash(s: string) {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mezclar(indices: number[], semilla: string): number[] {
  const mezcla = indices.map((i) => ({ i, k: hash(`${semilla}:${i}`) })).sort((a, b) => a.k - b.k).map((x) => x.i);
  if (indices.length > 1 && mezcla.every((v, p) => v === indices[p])) mezcla.reverse();
  return mezcla;
}

type PantallaProps = { bloque: Bloque; semilla: string; registrar: (correcta: boolean) => void };

function Texto({ texto }: { texto: string }) {
  return (
    <div className="space-y-4">
      <p className="text-xl leading-relaxed text-gray-900 whitespace-pre-wrap break-words">{texto}</p>
      <BotonEscuchar texto={texto} />
    </div>
  );
}

function Imagen({ url, descripcion, cantidad }: { url: string; descripcion: string; cantidad: number }) {
  const emoji = ilustracion(url);
  if (!emoji) return <p className="text-xl leading-relaxed text-gray-900 break-words">{descripcion}</p>;
  return (
    <div role="img" aria-label={descripcion} className="flex flex-wrap gap-3 text-6xl leading-none">
      {Array.from({ length: cantidad }, (_, i) => (
        <span key={i} aria-hidden="true">{emoji}</span>
      ))}
    </div>
  );
}

function Opciones({ b, registrar }: { b: Extract<Bloque, { tipo: 'ejercicio_opciones' }>; registrar: (c: boolean) => void }) {
  const [elegida, setElegida] = useState<number | null>(null);
  const [acertado, setAcertado] = useState(false);

  const elegir = (i: number) => {
    if (acertado) return;
    const ok = i === b.correcta;
    setElegida(i);
    if (ok) setAcertado(true);
    registrar(ok);
  };

  return (
    <div className="space-y-4">
      <h2 tabIndex={-1} className="text-2xl font-bold text-gray-900 break-words">{b.pregunta}</h2>
      <div className="grid gap-3">
        {b.opciones.map((op, i) => (
          <button
            key={i}
            type="button"
            onClick={() => elegir(i)}
            disabled={acertado}
            aria-pressed={elegida === i}
            className={`${BOTON_OPCION} ${elegida === i && !acertado ? 'border-red-700 bg-red-50' : ''} ${acertado && i === b.correcta ? 'border-green-800 bg-green-50' : ''}`}
          >
            {op}
          </button>
        ))}
      </div>
      <p role="status" className="text-xl font-semibold text-gray-900 break-words">
        {acertado && <>¡Bien! {b.explicacion}</>}
        {!acertado && elegida !== null && 'Probá de nuevo.'}
      </p>
    </div>
  );
}

function Contar({ b, registrar }: { b: Extract<Bloque, { tipo: 'ejercicio_contar' }>; registrar: (c: boolean) => void }) {
  const [marcados, setMarcados] = useState<boolean[]>(() => Array(b.cantidad).fill(false));
  const [acertado, setAcertado] = useState(false);
  const [elegida, setElegida] = useState<number | null>(null);
  const emoji = ilustracion(b.objeto) ?? '•';
  const contados = marcados.filter(Boolean).length;
  const listo = contados === b.cantidad;

  // Siempre la respuesta correcta y dos cercanas, en orden.
  const opciones = [b.cantidad - 1, b.cantidad, b.cantidad + 1].filter((n) => n >= 0);

  const tocar = (i: number) => {
    if (marcados[i]) return;
    setMarcados((prev) => prev.map((m, p) => (p === i ? true : m)));
  };

  const elegir = (n: number) => {
    if (acertado) return;
    const ok = n === b.cantidad;
    setElegida(n);
    if (ok) setAcertado(true);
    registrar(ok);
  };

  return (
    <div className="space-y-4">
      <h2 tabIndex={-1} className="text-2xl font-bold text-gray-900 break-words">{b.pregunta}</h2>
      <p className="text-lg font-semibold text-gray-900" aria-live="polite">Contados: {contados} de {b.cantidad}</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {marcados.map((m, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tocar(i)}
            disabled={m}
            aria-label={`${b.objeto} ${i + 1} de ${b.cantidad}${m ? ', contado' : ''}`}
            className={`flex min-h-12 items-center justify-center rounded-lg border-4 p-2 text-5xl leading-none ${m ? 'border-blue-800 bg-blue-50' : 'border-gray-500 bg-white hover:bg-gray-100'}`}
          >
            <span aria-hidden="true">{emoji}</span>
          </button>
        ))}
      </div>
      {listo && (
        <div className="space-y-3 pt-2">
          <p className="text-xl font-semibold text-gray-900">¿Cuántos hay?</p>
          <div className="grid gap-3">
            {opciones.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => elegir(n)}
                disabled={acertado}
                aria-pressed={elegida === n}
                className={`${BOTON_OPCION} ${elegida === n && !acertado ? 'border-red-700 bg-red-50' : ''} ${acertado && n === b.cantidad ? 'border-green-800 bg-green-50' : ''}`}
              >
                {n}
              </button>
            ))}
          </div>
          <p role="status" className="text-xl font-semibold text-gray-900">
            {acertado && `¡Bien! Hay ${b.cantidad}.`}
            {!acertado && elegida !== null && 'Probá de nuevo.'}
          </p>
        </div>
      )}
    </div>
  );
}

function Ordenar({ b, semilla, registrar }: { b: Extract<Bloque, { tipo: 'ejercicio_ordenar' }>; semilla: string; registrar: (c: boolean) => void }) {
  const [puestos, setPuestos] = useState<number[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const indices = useMemo(() => b.elementos.map((_, i) => i), [b.elementos]);
  const mezcla = useMemo(() => mezclar(indices, semilla), [indices, semilla]);
  const pool = mezcla.filter((i) => !puestos.includes(i));
  const terminado = puestos.length === b.elementos.length;

  const tocar = (i: number) => {
    // El elemento correcto siempre es el siguiente en la secuencia.
    if (i === puestos.length) {
      setPuestos([...puestos, i]);
      setAviso(puestos.length + 1 === b.elementos.length ? '¡Muy bien! Ya están en orden.' : '¡Bien!');
      registrar(true);
    } else {
      setAviso('Probá de nuevo.');
      registrar(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 tabIndex={-1} className="text-2xl font-bold text-gray-900 break-words">{b.consigna}</h2>
      {puestos.length > 0 && (
        <ol className="space-y-2">
          {puestos.map((i, p) => (
            <li key={i} className="rounded-lg border-2 border-green-800 bg-green-50 px-4 py-3 text-xl font-semibold text-gray-900 break-words">
              {p + 1}. {b.elementos[i]}
            </li>
          ))}
        </ol>
      )}
      {!terminado && (
        <div className="flex flex-wrap gap-3">
          {pool.map((i) => (
            <button key={i} type="button" onClick={() => tocar(i)} className={BOTON_SECUNDARIO}>
              {b.elementos[i]}
            </button>
          ))}
        </div>
      )}
      <p role="status" className="text-xl font-semibold text-gray-900">{aviso}</p>
    </div>
  );
}

function Pantalla({ bloque, semilla, registrar }: PantallaProps) {
  switch (bloque.tipo) {
    case 'texto':
    case 'audio':
      return <Texto texto={bloque.tipo === 'texto' ? bloque.contenido : bloque.texto} />;
    case 'imagen':
      return <Imagen url={bloque.url} descripcion={bloque.descripcion} cantidad={bloque.cantidad} />;
    case 'ejercicio_opciones':
      return <Opciones b={bloque} registrar={registrar} />;
    case 'ejercicio_contar':
      return <Contar b={bloque} registrar={registrar} />;
    case 'ejercicio_ordenar':
      return <Ordenar b={bloque} semilla={semilla} registrar={registrar} />;
    default:
      return <p className="text-xl text-gray-900">Este bloque no se puede mostrar en este momento.</p>;
  }
}

function CierreLeccion({ cierre, onAtras }: { cierre: Cierre; onAtras: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">¡Terminaste la lección!</h2>
      <div className="space-y-2 border-t border-gray-400 pt-4 text-base text-gray-900 break-words">
        {cierre.fuente && (
          <p>
            Fuente:{' '}
            {cierre.fuenteHref ? (
              <a href={cierre.fuenteHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-blue-800 underline">
                {cierre.fuente}
              </a>
            ) : (
              cierre.fuente
            )}
          </p>
        )}
        {cierre.autor && <p>Autor: {cierre.autor}</p>}
        {cierre.licencia && <p>Licencia: {cierre.licencia}</p>}
      </div>
      <div className="grid gap-3">
        {cierre.siguiente && (
          <Link href={cierre.siguiente.href} className={BOTON_PRIMARIO}>
            {cierre.siguiente.texto}
          </Link>
        )}
        <button type="button" onClick={onAtras} className={BOTON_SECUNDARIO}>
          Atrás
        </button>
      </div>
    </div>
  );
}

export default function VisorBloques({ bloques: crudos, semilla, cierre, alResponder }: Props) {
  const bloques = useMemo(() => normalizarBloques(crudos), [crudos]);
  const n = bloques.length;
  const [paso, setPaso] = useState(0);
  const enCierre = paso >= n;
  const montado = useRef(false);
  const contenido = useRef<HTMLDivElement>(null);

  // Al cambiar de pantalla, el foco va al contenido nuevo (para lectores de pantalla).
  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }
    contenido.current?.focus();
  }, [paso]);

  // Flechas del teclado: izquierda atrás, derecha adelante.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight') setPaso((p) => Math.min(p + 1, n));
      if (e.key === 'ArrowLeft') setPaso((p) => Math.max(p - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [n]);

  if (n === 0) {
    return <p className="text-gray-900">Esta lección todavía no tiene contenido.</p>;
  }

  const bloque = bloques[Math.min(paso, n - 1)];

  return (
    <section aria-label="Lección por pantallas" className="space-y-6">
      {!enCierre && (
        <>
          <p className="text-lg font-semibold text-gray-900">
            {paso + 1} de {n}
            <span className="sr-only"> (pantalla)</span>
          </p>
          <div key={paso} ref={contenido} tabIndex={-1} className="space-y-4 focus-visible:outline-none">
            <Pantalla
              bloque={bloque}
              semilla={`${semilla}:${paso}`}
              registrar={(correcta) => alResponder?.({ pantalla: paso, tipo: bloque.tipo, correcta })}
            />
          </div>
        </>
      )}
      {enCierre && (
        <div ref={contenido} tabIndex={-1} className="focus-visible:outline-none">
          <CierreLeccion cierre={cierre} onAtras={() => setPaso(n - 1)} />
        </div>
      )}

      {!enCierre && (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setPaso((p) => Math.max(p - 1, 0))} disabled={paso === 0} className={BOTON_SECUNDARIO}>
            Atrás
          </button>
          <button type="button" onClick={() => setPaso((p) => Math.min(p + 1, n))} className={BOTON_PRIMARIO}>
            {paso === n - 1 ? 'Terminar' : 'Siguiente'}
          </button>
        </div>
      )}
    </section>
  );
}
