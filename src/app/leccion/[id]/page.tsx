'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

interface LeccionData {
  titulo: string;
  slug: string;
  fuente: Fuente | null;
  urlOrigen: string | null;
  bloques: Bloque[];
  crumbs: Crumb[];
  temaNombre: string;
  prevId?: string;
  nextId?: string;
}

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
            className="inline-block mt-2 text-blue-800 underline hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 rounded-sm"
          >
            Ver en Educ.ar
          </a>
        )}
      </div>
    );
  }

  return (
    <video
      className="w-full rounded-lg bg-black"
      controls
      preload="metadata"
      playsInline
      src={src}
      aria-label={`Video: ${titulo}`}
      onError={() => setFallo(true)}
    >
      Tu navegador no puede reproducir este video.
    </video>
  );
}

export default function LeccionPage() {
  const params = useParams();
  const leccionId = params.id as string;
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
            tema_id,
            lecciones!inner (
              id,
              titulo,
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
          .limit(1);

        if (qError) {
          setError(`Error al cargar la lección: ${qError.message}`);
          return;
        }
        if (!data || data.length === 0) {
          setError('Lección no encontrada o no publicada');
          return;
        }

        const row = data[0] as any;
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

        const { data: hermanas } = await supabase
          .from('ubicaciones_curriculares')
          .select('leccion_id, orden, lecciones!inner ( estado )')
          .eq('tema_id', row.tema_id)
          .eq('estado', 'publicado')
          .eq('lecciones.estado', 'publicado')
          .order('orden');

        const ids = (hermanas ?? []).map((h: any) => h.leccion_id as string);
        const idx = ids.indexOf(leccionId);

        setLeccion({
          titulo: lec.titulo,
          slug: lec.slug,
          fuente: lec.fuentes ?? null,
          urlOrigen: lec.url_origen ?? null,
          bloques: [...(lec.bloques_contenido ?? [])].sort((a: Bloque, b: Bloque) => a.orden - b.orden),
          crumbs,
          temaNombre: tema.nombre,
          prevId: idx > 0 ? ids[idx - 1] : undefined,
          nextId: idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : undefined,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchLeccion();
  }, [leccionId]);

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
          <Link href="/estudiar" className="text-blue-800 underline">
            Volver a Estudiar
          </Link>
        </div>
      </div>
    );
  }

  const origen = leccion.urlOrigen ?? leccion.fuente?.url ?? null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <nav aria-label="Ubicación curricular" className="mb-8">
          <ol className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-gray-700">
            <li>
              <Link href="/estudiar" className="text-blue-800 underline hover:text-blue-900">
                Inicio
              </Link>
            </li>
            {leccion.crumbs.map((c, i) => (
              <li key={c.href} className="flex gap-x-2">
                <span aria-hidden="true">&gt;</span>
                {i === leccion.crumbs.length - 1 ? (
                  <span className="font-semibold text-gray-900" aria-current="page">{c.nombre}</span>
                ) : (
                  <Link href={c.href} className="text-blue-800 underline hover:text-blue-900">
                    {c.nombre}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <article className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{leccion.titulo}</h1>

          <div className="space-y-6">
            {leccion.bloques.map((b, i) => {
              if (b.tipo === 'video') {
                const embed = resolveVideoReference(b.referencia);
                if (!embed.ok) {
                  return (
                    <div key={i} className="p-4 bg-amber-50 border border-amber-400 rounded text-amber-900">
                      No se puede mostrar el video: {embed.error}
                    </div>
                  );
                }
                if (embed.kind === 'file') {
                  return <VideoArchivo key={i} src={embed.src} titulo={leccion.titulo} origen={origen} />;
                }
                return (
                  <div key={i} className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={embed.src}
                      title={`Video: ${leccion.titulo}`}
                      loading="lazy"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                );
              }
              return (
                <p key={i} className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                  {b.referencia}
                </p>
              );
            })}
            {leccion.bloques.length === 0 && (
              <p className="text-gray-700">Esta lección todavía no tiene contenido.</p>
            )}
          </div>

          {leccion.fuente && (
            <p className="mt-6 pt-4 border-t border-gray-300 text-sm text-gray-800">
              Fuente:{' '}
              {origen ? (
                <a
                  href={origen}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 underline hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 rounded-sm"
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

        <div className="flex gap-4 justify-between">
          {leccion.prevId ? (
            <Link
              href={`/leccion/${leccion.prevId}`}
              className="px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300"
            >
              ← Anterior
            </Link>
          ) : <span />}
          {leccion.nextId ? (
            <Link
              href={`/leccion/${leccion.nextId}`}
              className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800"
            >
              Siguiente →
            </Link>
          ) : <span />}
        </div>
      </div>
    </div>
  );
}
