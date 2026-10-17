'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ilustracion } from '@/lib/ilustraciones';
import { type Bloque, normalizarBloques, rutaFrase, rutaNumero, rutasAudio } from '@/lib/bloques';
import { escuchar, estaSilenciado, precargarAudios, setSilenciado, sonidoAcierto, sonidoError } from '@/lib/sonido';

// Un bloque por pantalla. Sin puntos, rachas, vidas ni premios.
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

type Voz = SpeechSynthesisVoice | null;

const BOTON = 'flex min-h-12 items-center justify-center rounded-lg border-2 px-6 py-3 text-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50';
const BOTON_PRIMARIO = `${BOTON} border-blue-800 bg-blue-800 text-white hover:bg-blue-900`;
const BOTON_SECUNDARIO = `${BOTON} border-gray-600 bg-white text-gray-900 hover:bg-gray-100`;
const BOTON_OPCION = `${BOTON} w-full justify-start text-left border-gray-600 bg-white text-gray-900 hover:bg-gray-100`;

// Botón "Escuchar": usa el archivo pregrabado si la pantalla tiene uno; si no, la voz del navegador.
// Sin archivo y sin voz en español, el botón no aparece.
function BotonEscuchar({ texto, archivo, voz }: { texto: string; archivo?: string; voz: Voz }) {
  if (!archivo && !voz) return null;
  return (
    <button type="button" onClick={() => escuchar(archivo ? rutaFrase(archivo) : undefined, texto, voz)} className={BOTON_SECUNDARIO}>
      Escuchar
    </button>
  );
}

// Objetos que se tocan de a uno: cada toque salta, dice su número y suma al contador.
function Objetos({ emoji, cantidad, voz }: { emoji: string; cantidad: number; voz: Voz }) {
  const [tocados, setTocados] = useState<boolean[]>(() => Array(cantidad).fill(false));
  const [saltando, setSaltando] = useState<number | null>(null);
  const contados = tocados.filter(Boolean).length;

  const tocar = (i: number) => {
    setTocados((prev) => prev.map((v, p) => (p === i ? true : v)));
    setSaltando(i);
    escuchar(rutaNumero(i + 1), String(i + 1), voz);
  };

  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold text-gray-900" aria-live="polite">Contados: {contados} de {cantidad}</p>
      <div className="flex flex-wrap gap-3">
        {tocados.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tocar(i)}
            onAnimationEnd={() => setSaltando(null)}
            aria-label={`Objeto ${i + 1} de ${cantidad}${t ? ', contado' : ''}`}
            className={`flex min-h-12 min-w-12 items-center justify-center rounded-lg border-4 p-1 text-5xl leading-none ${t ? 'border-blue-800 bg-blue-50' : 'border-gray-500 bg-white hover:bg-gray-100'} ${saltando === i ? 'salto' : ''}`}
          >
            <span aria-hidden="true">{emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Texto({ texto, audio, voz }: { texto: string; audio?: string; voz: Voz }) {
  return (
    <div className="space-y-4">
      <p className="text-xl leading-relaxed text-gray-900 whitespace-pre-wrap break-words">{texto}</p>
      <BotonEscuchar texto={texto} archivo={audio} voz={voz} />
    </div>
  );
}

function Imagen({ url, descripcion, cantidad, voz }: { url: string; descripcion: string; cantidad: number; voz: Voz }) {
  const emoji = ilustracion(url);
  if (!emoji) return <p className="text-xl leading-relaxed text-gray-900 break-words">{descripcion}</p>;
  return (
    <div className="space-y-4">
      <p className="text-xl leading-relaxed text-gray-900 break-words">{descripcion}</p>
      <Objetos emoji={emoji} cantidad={cantidad} voz={voz} />
    </div>
  );
}

// Número grande. Al tocarlo suena su nombre y aparecen esa cantidad de objetos, que también se tocan.
function Numero({ valor, objeto, voz }: { valor: number; objeto: string; voz: Voz }) {
  const [mostrar, setMostrar] = useState(false);
  const emoji = ilustracion(objeto) ?? '•';
  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => {
          setMostrar(true);
          escuchar(rutaNumero(valor), String(valor), voz);
        }}
        aria-label={`Número ${valor}. Tocá para escucharlo y ver los objetos`}
        className="flex min-h-24 w-full items-center justify-center rounded-lg border-4 border-blue-800 bg-blue-50 text-8xl font-bold text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        <span aria-hidden="true">{valor}</span>
      </button>
      {mostrar && valor === 0 && <p className="text-xl text-gray-900">No hay objetos.</p>}
      {mostrar && valor > 0 && <Objetos key={valor} emoji={emoji} cantidad={valor} voz={voz} />}
    </div>
  );
}

function Opciones({ b, voz, registrar }: { b: Extract<Bloque, { tipo: 'ejercicio_opciones' }>; voz: Voz; registrar: (c: boolean) => void }) {
  const [elegida, setElegida] = useState<number | null>(null);
  const [acertado, setAcertado] = useState(false);

  const elegir = (i: number) => {
    if (acertado) return;
    const ok = i === b.correcta;
    setElegida(i);
    if (ok) {
      setAcertado(true);
      sonidoAcierto();
    } else {
      sonidoError();
    }
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
      {acertado && <BotonEscuchar texto={b.explicacion} archivo={b.audio} voz={voz} />}
    </div>
  );
}

function Contar({ b, voz, registrar }: { b: Extract<Bloque, { tipo: 'ejercicio_contar' }>; voz: Voz; registrar: (c: boolean) => void }) {
  const [marcados, setMarcados] = useState<boolean[]>(() => Array(b.cantidad).fill(false));
  const [acertado, setAcertado] = useState(false);
  const [elegida, setElegida] = useState<number | null>(null);
  const [saltando, setSaltando] = useState<number | null>(null);
  const emoji = ilustracion(b.objeto) ?? '•';
  const contados = marcados.filter(Boolean).length;
  const listo = contados === b.cantidad;

  // Siempre la respuesta correcta y dos cercanas, en orden.
  const opciones = [b.cantidad - 1, b.cantidad, b.cantidad + 1].filter((n) => n >= 0);

  // Cada toque dice el número que le toca.
  const tocar = (i: number) => {
    setSaltando(i);
    if (marcados[i]) return;
    setMarcados((prev) => prev.map((m, p) => (p === i ? true : m)));
    escuchar(rutaNumero(i + 1), String(i + 1), voz);
  };

  const elegir = (n: number) => {
    if (acertado) return;
    const ok = n === b.cantidad;
    setElegida(n);
    if (ok) {
      setAcertado(true);
      sonidoAcierto();
    } else {
      sonidoError();
    }
    registrar(ok);
  };

  return (
    <div className="space-y-4">
      <h2 tabIndex={-1} className="text-2xl font-bold text-gray-900 break-words">{b.pregunta}</h2>
      <p className="text-lg font-semibold text-gray-900" aria-live="polite">Contados: {contados} de {b.cantidad}</p>
      <div className="flex flex-wrap gap-3">
        {marcados.map((m, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tocar(i)}
            onAnimationEnd={() => setSaltando(null)}
            aria-label={`${b.objeto} ${i + 1} de ${b.cantidad}${m ? ', contado' : ''}`}
            className={`flex min-h-12 min-w-12 items-center justify-center rounded-lg border-4 p-1 text-5xl leading-none ${m ? 'border-blue-800 bg-blue-50' : 'border-gray-500 bg-white hover:bg-gray-100'} ${saltando === i ? 'salto' : ''}`}
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

function Ordenar({ b, semilla, voz, registrar }: { b: Extract<Bloque, { tipo: 'ejercicio_ordenar' }>; semilla: string; voz: Voz; registrar: (c: boolean) => void }) {
  const [puestos, setPuestos] = useState<number[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const mezcla = useMemo(() => mezclar(b.elementos.map((_, i) => i), semilla), [b.elementos, semilla]);
  const pool = mezcla.filter((i) => !puestos.includes(i));
  const terminado = puestos.length === b.elementos.length;

  const tocar = (i: number) => {
    // El elemento correcto siempre es el siguiente en la secuencia.
    if (i === puestos.length) {
      const valor = b.elementos[i];
      if (/^\d+$/.test(valor) && Number(valor) <= 20) escuchar(rutaNumero(Number(valor)), valor, voz);
      else sonidoAcierto();
      setPuestos([...puestos, i]);
      setAviso(puestos.length + 1 === b.elementos.length ? '¡Muy bien! Ya están en orden.' : '¡Bien!');
      registrar(true);
    } else {
      sonidoError();
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

function Pantalla({ bloque, semilla, voz, registrar }: { bloque: Bloque; semilla: string; voz: Voz; registrar: (correcta: boolean) => void }) {
  switch (bloque.tipo) {
    case 'texto':
      return <Texto texto={bloque.contenido} audio={bloque.audio} voz={voz} />;
    case 'audio':
      return <Texto texto={bloque.texto} audio={bloque.audio} voz={voz} />;
    case 'imagen':
      return <Imagen url={bloque.url} descripcion={bloque.descripcion} cantidad={bloque.cantidad} voz={voz} />;
    case 'numero':
      return <Numero valor={bloque.valor} objeto={bloque.objeto} voz={voz} />;
    case 'ejercicio_opciones':
      return <Opciones b={bloque} voz={voz} registrar={registrar} />;
    case 'ejercicio_contar':
      return <Contar b={bloque} voz={voz} registrar={registrar} />;
    case 'ejercicio_ordenar':
      return <Ordenar b={bloque} semilla={semilla} voz={voz} registrar={registrar} />;
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
  const [voz, setVoz] = useState<Voz>(null);
  const [silencio, setSilencioState] = useState(() => estaSilenciado());
  const enCierre = paso >= n;
  const montado = useRef(false);
  const contenido = useRef<HTMLDivElement>(null);

  // Voz en español del navegador. Se consulta al abrir, para que no haya demora al primer "Escuchar".
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
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

  // Precarga los audios pregrabados de la lección al abrirla.
  useEffect(() => {
    precargarAudios(rutasAudio(bloques));
  }, [bloques]);

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

  const alternarSonido = () => {
    const nuevo = !silencio;
    setSilenciado(nuevo);
    setSilencioState(nuevo);
  };

  return (
    <section aria-label="Lección por pantallas" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!enCierre ? (
          <p className="text-lg font-semibold text-gray-900">
            {paso + 1} de {n}
            <span className="sr-only"> (pantalla)</span>
          </p>
        ) : (
          <span />
        )}
        <button type="button" onClick={alternarSonido} aria-pressed={silencio} className={BOTON_SECUNDARIO}>
          {silencio ? 'Activar sonidos' : 'Silenciar sonidos'}
        </button>
      </div>

      {!enCierre && (
        <div key={paso} ref={contenido} tabIndex={-1} className="space-y-4 focus-visible:outline-none">
          <Pantalla
            bloque={bloque}
            semilla={`${semilla}:${paso}`}
            voz={voz}
            registrar={(correcta) => alResponder?.({ pantalla: paso, tipo: bloque.tipo, correcta })}
          />
        </div>
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
