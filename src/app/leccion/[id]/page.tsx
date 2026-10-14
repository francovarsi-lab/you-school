'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { resolveVideoReference } from '@/lib/video';

interface Bloque {
  orden: number;
  tipo: string;
  referencia: string;
}

interface Crumb {
  nombre: string;
  href: string;
}

interface Fuente {
  nombre: string;
  url: string | null;
  licencia: string | null;
}

interface Entrada {
  id: string;
  titulo: string;
  temaId: string;
  unidadId: string;
  unidadNombre: string;
}

interface Enlace {
  href: string;
  texto: string;
}

interface LeccionData {
  titulo: string;
  descripcion: string | null;
  fuente: Fuente | null;
  urlOrigen: string | null;
  bloques: Bloque[];
  crumbs: Crumb[];
  prev: Enlace | null;
  next: Enlace | null;
  materiaNombre: string;
  materiaHref: string;
  posicion: { n: number; m: number; unidad: string } | null;
}

const porOrden = <T extends { orden?: number | null }>(a: T, b: T) => (a.orden ?? Infinity) - (b.orden ?? Infinity);

function VideoArchivo({ src, titulo, origen }: { src: string; titulo: string; origen: string | null }) {
  const [fallo, setFallo] = useState(false);

  if (fallo) {
    return (
      <div className="p-4 bg-gray-100 border border-gray-400 rounded-lg text-gray-900">
        <p>No se pudo cargar el video.</p>
        {origen && (
          <a
            href={origen}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center mt-2 text-blue-800 underline hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 rounded-sm"
          >
            Ver en Educ.ar
          </a>
        )}
      </div>
    );
  }

  return (
    <video
      className="block w-[calc(100%+2rem)] -mx-4 max-w-none rounded-none bg-black md:w-full md:mx-0 md:rounded-lg"
      controls
      preload="none"
      playsInline
      src={src}
      aria-label={`Video: ${titulo}`}
      onError={() => setFallo(true)}
    >
      Tu navegador no puede reproducir este video.
    </video>
  );
}

// El iframe de YouTube no se carga hasta tocar el botón: abrir la página no pide nada a YouTube.
function VideoYouTube({ src, titulo }: { src: string; titulo: string }) {
  const [activo, setActivo] = useState(false);

  if (!activo) {
    return (
      <button
        type="button"
        onClick={() => setActivo(true)}
        className="flex w-full aspect-video -mx-4 md:mx-0 md:rounded-lg items-center justify-center bg-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        <span className="rounded-full bg-white px-6 py-3 font-semibold text-gray-900">▶ Reproducir video</span>
        <span className="sr-only">: {titulo}</span>
      </button>
    );
  }

  return (
    <div className="relative -mx-4 md:mx-0 aspect-video md:rounded-lg overflow-hidden bg-black">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`${src}?autoplay=1`}
        title={`Video: ${titulo}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}

export default function LeccionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leccionId = params.id as string;
  const temaParam = searchParams.get('tema');
  const [leccion, setLeccion] = useState<LeccionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeccion = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: qError } = await supabase
          .from('ubicaciones_curriculares')
          .select(`
            tema_id, orden,
            lecciones!inner (
              id,
              titulo,
              descripcion,
              slug,
              estado,
              bloques_contenido ( orden, tipo, referencia ),
              url_origen,
              fuentes ( nombre, url, licencia )
            ),
            temas (
              id,
              nombre,
              unidades (
                id,
                nombre,
                materias (
                  id,
                  nombre,
                  anios (
                    id,
                    nombre,
                    niveles (
                      id,
                      nombre,
                      curriculas (
                        id,
                        nombre,
                        paises ( id, nombre )
                      )
                    )
                  )
                )
              )
            )
          `)
          .eq('leccion_id', leccionId)
          .eq('estado', 'publicado')
          .eq('lecciones.estado', 'publicado')
          .order('orden');

        if (qError) {
          console.error(qError);
          setError('No se pudo cargar la lección. Probá de nuevo más tarde.');
          return;
        }
        if (!data || data.length === 0) {
          setError('Lección no encontrada o no publicada');
          return;
        }

        const rows = data as any[];
        const row = rows.find((r) => r.tema_id === temaParam) ?? rows[0];
        const lec = row.lecciones;
        const tema = row.temas;
        const unidad = tema.unidades;
        const materia = unidad.materias;
        const anio = materia.anios;
        const nivel = anio.niveles;
        const curricula = nivel.curriculas;
        const pais = curricula.paises;

        const crumbs: Crumb[] = [
          { nombre: pais.nombre, href: `/estudiar?abrir=${pais.id}` },
          { nombre: curricula.nombre, href: `/estudiar?abrir=${curricula.id}` },
          { nombre: nivel.nombre, href: `/estudiar?abrir=${nivel.id}` },
          { nombre: anio.nombre, href: `/estudiar?abrir=${anio.id}` },
          { nombre: materia.nombre, href: `/estudiar?abrir=${materia.id}` },
          { nombre: unidad.nombre, href: `/estudiar?abrir=${unidad.id}` },
          { nombre: tema.nombre, href: `/estudiar?abrir=${tema.id}` },
        ];

        const { data: mat } = await supabase
          .from('materias')
          .select(`
            id, nombre,
            unidades (
              id, nombre, orden,
              temas (
                id, nombre, orden,
                ubicaciones_curriculares ( orden, estado, lecciones ( id, titulo, estado ) )
              )
            )
          `)
          .eq('id', materia.id)
          .single();

        const secuencia: Entrada[] = [];
        for (const u of [...((mat as any)?.unidades ?? [])].sort(porOrden)) {
          for (const t of [...u.temas].sort(porOrden)) {
            const ubs = (t.ubicaciones_curriculares as any[])
              .filter((ub) => ub.estado === 'publicado' && ub.lecciones?.estado === 'publicado')
              .sort(porOrden);
            for (const ub of ubs) {
              secuencia.push({ id: ub.lecciones.id, titulo: ub.lecciones.titulo, temaId: t.id, unidadId: u.id, unidadNombre: u.nombre });
            }
          }
        }

        const enSecuencia = (e: Entrada) => e.id === leccionId && e.temaId === tema.id;
        let idx = secuencia.findIndex(enSecuencia);
        if (idx === -1) idx = secuencia.findIndex((e) => e.id === leccionId);
        const actual = idx >= 0 ? secuencia[idx] : null;

        const volverMateria: Enlace = { href: `/estudiar?abrir=${materia.id}`, texto: `Volver a ${materia.nombre}` };
        const enlaceA = (e: Entrada, texto: string): Enlace => ({ href: `/leccion/${e.id}?tema=${e.temaId}`, texto });
        const prev = idx > 0 ? enlaceA(secuencia[idx - 1], '← Anterior') : volverMateria;
        const next = idx >= 0 && idx < secuencia.length - 1 ? enlaceA(secuencia[idx + 1], 'Siguiente →') : volverMateria;

        let posicion: LeccionData['posicion'] = null;
        if (actual) {
          const deUnidad = secuencia.filter((e) => e.unidadId === actual.unidadId);
          const n = deUnidad.findIndex((e) => e.id === actual.id && e.temaId === actual.temaId) + 1;
          posicion = { n, m: deUnidad.length, unidad: actual.unidadNombre };
        }

        setLeccion({
          titulo: lec.titulo,
          descripcion: lec.descripcion?.trim() || null,
          fuente: lec.fuentes ?? null,
          urlOrigen: lec.url_origen ?? null,
          bloques: [...(lec.bloques_contenido ?? [])].sort((a: Bloque, b: Bloque) => a.orden - b.orden),
          crumbs,
          prev,
          next,
          materiaNombre: materia.nombre,
          materiaHref: `/estudiar?abrir=${materia.id}`,
          posicion,
        });
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la lección. Probá de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeccion();
  }, [leccionId, temaParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">Cargando...</p>
      </div>
    );
  }

  if (error || !leccion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full p-8 bg-red-50 border-2 border-red-400 rounded-lg">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Error</h1>
          <p className="text-red-800 mb-4">{error ?? 'Sin datos'}</p>
          <Link href="/estudiar" className="inline-flex min-h-11 items-center text-blue-800 underline">
            Volver a Estudiar
          </Link>
        </div>
      </div>
    );
  }

  const origen = leccion.urlOrigen ?? leccion.fuente?.url ?? null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[70ch] mx-auto">
        <nav aria-label="Ubicación curricular" className="mb-8">
          <ol className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-gray-700">
            <li>
              <Link href="/estudiar" className="inline-flex min-h-11 items-center text-blue-800 underline hover:text-blue-900">
                Inicio
              </Link>
            </li>
            {leccion.crumbs.map((c, i) => (
              <li key={c.href} className="flex gap-x-2">
                <span aria-hidden="true">&gt;</span>
                {i === leccion.crumbs.length - 1 ? (
                  <span className="font-semibold text-gray-900" aria-current="page">{c.nombre}</span>
                ) : (
                  <Link href={c.href} className="inline-flex min-h-11 items-center text-blue-800 underline hover:text-blue-900">
                    {c.nombre}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <article className="bg-white rounded-lg shadow-lg p-4 md:p-8 mb-8">
          {leccion.posicion && (
            <p className="text-sm font-semibold text-gray-800 mb-2 break-words">
              Lección {leccion.posicion.n} de {leccion.posicion.m} en {leccion.posicion.unidad}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 break-words">{leccion.titulo}</h1>

          <div className="space-y-6">
            {leccion.bloques.map((b, i) => {
              if (b.tipo === 'video') {
                const embed = resolveVideoReference(b.referencia);
                if (!embed.ok) {
                  return (
                    <div key={i} className="p-4 bg-amber-50 border border-amber-400 rounded text-amber-900">
                      Este video no se puede mostrar en este momento.
                    </div>
                  );
                }
                if (embed.kind === 'file') {
                  return <VideoArchivo key={i} src={embed.src} titulo={leccion.titulo} origen={origen} />;
                }
                return <VideoYouTube key={i} src={embed.src} titulo={leccion.titulo} />;
              }
              return (
                <p key={i} className="leading-relaxed text-gray-800 whitespace-pre-wrap break-words">
                  {b.referencia}
                </p>
              );
            })}
            {leccion.bloques.length === 0 && (
              <p className="text-gray-700">Esta lección todavía no tiene contenido.</p>
            )}
          </div>

          {leccion.descripcion && (
            <p className="mt-6 pt-4 border-t border-gray-300 text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
              {leccion.descripcion}
            </p>
          )}

          {leccion.fuente && (
            <p className={`${leccion.descripcion ? 'mt-3' : 'mt-6 pt-4 border-t border-gray-300'} text-sm text-gray-800 break-words`}>
              Fuente:{' '}
              {origen ? (
                <a
                  href={origen}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-blue-800 underline hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 rounded-sm"
                >
                  {leccion.fuente.nombre}
                </a>
              ) : (
                leccion.fuente.nombre
              )}
              {leccion.fuente.licencia && <>. Licencia: {leccion.fuente.licencia}</>}
            </p>
          )}
        </article>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={leccion.prev!.href}
            className="flex min-h-14 items-center justify-center px-6 py-4 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {leccion.prev!.texto}
          </Link>
          <Link
            href={leccion.next!.href}
            className="flex min-h-14 items-center justify-center px-6 py-4 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {leccion.next!.texto}
          </Link>
        </div>
      </div>
    </div>
  );
}
