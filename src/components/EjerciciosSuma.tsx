'use client';

import { useState } from 'react';

// Ejercicios de sumar hasta 10 (ver docs/bloques.md). El color nunca es lo único: naranja = círculo, azul = cuadrado redondeado, y siempre hay texto.
// Ningún avance se bloquea por fallar. Sin puntos, rachas ni vidas.

const TOTAL = 10;
const ANIMO = ['Bueno, seguí intentando', 'Mirá el dibujo y probá con otro número', 'Dale, probá de nuevo'];

const BOTON_OPCION = 'flex min-h-14 w-full items-center justify-center rounded-lg border-2 px-6 py-3 text-2xl font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60 dark:text-gray-100';

const celdaClase = (tipo: 'vacia' | 'naranja' | 'azul' | 'sobra') => {
  const base = 'flex min-h-14 min-w-14 items-center justify-center border-2';
  if (tipo === 'naranja') return `${base} rounded-full border-orange-800 bg-orange-500`;
  if (tipo === 'azul') return `${base} rounded-lg border-blue-900 bg-blue-700`;
  if (tipo === 'sobra') return `${base} rounded-lg border-red-800 bg-red-600`;
  return `${base} rounded-lg border-dashed border-gray-500 bg-white dark:bg-gray-900`;
};

const nombreCelda = { vacia: 'vacío', naranja: 'naranja', azul: 'azul', sobra: 'sobrante en rojo' };

// Marco de 10 casilleros (2 filas de 5). Las fichas naranjas son fijas; las azules se dibujan según la respuesta.
export function CompletarSuma({ n, registrar }: { n: number; registrar: (correcta: boolean) => void }) {
  const correcta = TOTAL - n;
  const opciones = [correcta - 1, correcta, correcta + 1];
  const [elegida, setElegida] = useState<number | null>(null);
  const [acertado, setAcertado] = useState(false);
  const [errores, setErrores] = useState(0);

  const elegir = (e: number) => {
    if (acertado) return;
    const ok = e === correcta;
    setElegida(e);
    if (ok) setAcertado(true);
    else setErrores((x) => x + 1);
    registrar(ok);
  };

  // Antes de contestar no hay azules. Con acierto, se llenan los vacíos. Con error, se dibuja la respuesta elegida.
  const azules = acertado ? correcta : elegida ?? 0;
  const total = n + azules;
  const dentro = Math.min(azules, TOTAL - n);
  const sobran = total > TOTAL ? total - TOTAL : 0;
  const faltan = total < TOTAL && elegida !== null ? TOTAL - total : 0;

  const celdas = Array.from({ length: TOTAL }, (_, i) => {
    if (i < n) return 'naranja' as const;
    if (i < n + dentro) return 'azul' as const;
    return 'vacia' as const;
  });

  return (
    <div className="space-y-5">
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{n} + ? = 10</p>

      <div className="grid w-fit grid-cols-5 gap-2 rounded-xl border-4 border-gray-800 p-3 dark:border-gray-300" role="img" aria-label={`Marco de 10. ${n} fichas naranjas, ${dentro} azules, ${TOTAL - n - dentro} vacíos`}>
        {celdas.map((c, i) => (
          <div key={i} className={celdaClase(c)} aria-hidden="true">
            <span className="sr-only">{nombreCelda[c]}</span>
          </div>
        ))}
      </div>

      {sobran > 0 && (
        <div className="space-y-2" aria-label={`Sobran ${sobran}`}>
          <p className="text-xl font-semibold text-red-700 dark:text-red-300">Sobran {sobran}:</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: sobran }, (_, i) => (
              <div key={i} className={celdaClase('sobra')} aria-hidden="true" />
            ))}
          </div>
        </div>
      )}

      {acertado && <p className="text-2xl font-bold text-green-800 dark:text-green-300" role="status">¡Bien! {n} + {correcta} = 10</p>}
      {!acertado && elegida !== null && (
        <div role="status" className="space-y-1">
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{n} + {elegida} = {total}</p>
          {sobran > 0 && <p className="text-xl text-red-700 dark:text-red-300">Pasaste el 10.</p>}
          {faltan > 0 && <p className="text-xl text-red-700 dark:text-red-300">Todavía faltan {faltan}.</p>}
          <p className="text-xl text-gray-900 dark:text-gray-100">{ANIMO[(errores - 1) % ANIMO.length]}.</p>
        </div>
      )}

      <div className="grid gap-3">
        {opciones.map((op) => {
          const esElegida = elegida === op;
          const error = esElegida && !acertado;
          return (
            <button
              key={op}
              type="button"
              onClick={() => elegir(op)}
              disabled={acertado}
              aria-pressed={esElegida}
              className={`${BOTON_OPCION} ${error ? 'border-red-700 bg-red-50 text-red-900 dark:bg-red-950' : 'border-gray-600 bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'} ${acertado && op === correcta ? 'border-green-800 bg-green-50' : ''}`}
            >
              {op}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Los 10 casilleros empiezan naranjas. Cada toque alterna naranja/azul. Hay que encontrar maneras distintas de formar 10.
export function ArmarDiez({ consigna, meta, registrar }: { consigna: string; meta: number; registrar: (correcta: boolean) => void }) {
  const [azul, setAzul] = useState<boolean[]>(() => Array(TOTAL).fill(false));
  const [maneras, setManeras] = useState<string[]>([]);
  const azules = azul.filter(Boolean).length;
  const naranjas = TOTAL - azules;
  const lograste = maneras.length >= meta;

  // Una manera es un par distinto sin importar el orden (7 + 3 es igual a 3 + 7), y con ambos lados presentes.
  const tocar = (i: number) => {
    const siguiente = azul.map((v, p) => (p === i ? !v : v));
    setAzul(siguiente);
    const a = siguiente.filter(Boolean).length;
    const b = TOTAL - a;
    if (a > 0 && b > 0) {
      const etiqueta = `${Math.min(a, b)} + ${Math.max(a, b)}`;
      if (!maneras.includes(etiqueta)) {
        const nuevas = [...maneras, etiqueta];
        setManeras(nuevas);
        if (nuevas.length === meta) registrar(true);
      }
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{consigna}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100" aria-live="polite">{naranjas} + {azules} = 10</p>

      <div className="grid w-fit grid-cols-5 gap-2 rounded-xl border-4 border-gray-800 p-3 dark:border-gray-300">
        {azul.map((esAzul, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tocar(i)}
            aria-label={`Casillero ${i + 1}, ${esAzul ? 'azul' : 'naranja'}. Tocá para cambiarlo`}
            className={`flex min-h-14 min-w-14 items-center justify-center border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${esAzul ? 'rounded-lg border-blue-900 bg-blue-700' : 'rounded-full border-orange-800 bg-orange-500'}`}
          >
            <span className="sr-only">{esAzul ? 'azul' : 'naranja'}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Maneras encontradas: {maneras.length} de {meta}</p>
        <ul className="flex flex-wrap gap-2" aria-label="Maneras encontradas">
          {maneras.map((m) => (
            <li key={m} className="rounded-lg border-2 border-gray-700 bg-white px-3 py-2 text-xl font-semibold text-gray-900 dark:bg-gray-800 dark:text-gray-100">{m}</li>
          ))}
        </ul>
      </div>

      {lograste && <p role="status" className="text-2xl font-bold text-green-800 dark:text-green-300">¡Lo lograste! Y todavía hay más maneras.</p>}
    </div>
  );
}
