'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface LessonData {
  id: string;
  titulo: string;
  slug: string;
  contenido: string;
  breadcrumb: {
    pais: string;
    curricula: string;
    nivel: string;
    anio: string;
    materia: string;
    unidad: string;
    tema: string;
  };
  tema_id: string;
  prevLessonId?: string;
  nextLessonId?: string;
}

export default function LeccionPage() {
  const params = useParams();
  const router = useRouter();
  const [leccion, setLeccion] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lessonId = params.id as string;

  useEffect(() => {
    const fetchLeccion = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch lesson with full curriculum chain and content
        const { data, error: supabaseError } = await supabase
          .from('ubicaciones_curriculares')
          .select(`
            leccion_id,
            tema_id,
            lecciones (
              id,
              titulo,
              slug,
              bloques_contenido (
                referencia,
                tipo
              )
            ),
            temas (
              id,
              nombre,
              unidad_id,
              unidades (
                id,
                nombre,
                materia_id,
                materias (
                  id,
                  nombre,
                  anio_id,
                  anios (
                    id,
                    nombre,
                    nivel_id,
                    niveles (
                      id,
                      nombre,
                      curricula_id,
                      curriculas (
                        id,
                        nombre,
                        pais_id,
                        paises (
                          id,
                          nombre,
                          codigo
                        )
                      )
                    )
                  )
                )
              )
            )
          `)
          .eq('leccion_id', lessonId)
          .eq('lecciones.estado', 'publicado')
          .single();

        if (supabaseError) {
          setError(`Error fetching data: ${supabaseError.message}`);
          return;
        }

        if (!data) {
          setError('Lesson not found');
          return;
        }

        // Extract and structure the data
        const lec = data.lecciones as any;
        const tema = data.temas as any;
        const unidad = tema.unidades;
        const materia = unidad.materias;
        const anio = materia.anios;
        const nivel = anio.niveles;
        const curricula = nivel.curriculas;
        const pais = curricula.paises;

        const contenido = lec.bloques_contenido?.map((b: any) => b.referencia).join('\n\n') || 'No content found';

        // Fetch prev and next lessons in the same topic
        const { data: allLessons } = await supabase
          .from('ubicaciones_curriculares')
          .select('leccion_id, orden')
          .eq('tema_id', data.tema_id)
          .eq('lecciones.estado', 'publicado')
          .order('orden');

        let prevLessonId: string | undefined;
        let nextLessonId: string | undefined;

        if (allLessons) {
          const currentIdx = allLessons.findIndex(l => l.leccion_id === lessonId);
          if (currentIdx > 0) prevLessonId = allLessons[currentIdx - 1].leccion_id;
          if (currentIdx < allLessons.length - 1) nextLessonId = allLessons[currentIdx + 1].leccion_id;
        }

        setLeccion({
          id: lec.id,
          titulo: lec.titulo,
          slug: lec.slug,
          contenido: contenido,
          tema_id: data.tema_id,
          breadcrumb: {
            pais: pais.nombre,
            curricula: curricula.nombre,
            nivel: nivel.nombre,
            anio: anio.nombre,
            materia: materia.nombre,
            unidad: unidad.nombre,
            tema: tema.nombre,
          },
          prevLessonId,
          nextLessonId,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLeccion();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full p-8 bg-red-50 border-2 border-red-400 rounded-lg">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Error</h1>
          <p className="text-red-700 mb-4">{error}</p>
          <Link href="/estudiar" className="text-blue-600 hover:underline">
            Volver a Estudiar
          </Link>
        </div>
      </div>
    );
  }

  if (!leccion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">No lesson data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex flex-wrap gap-2 text-sm text-gray-600">
            <li>
              <Link href="/estudiar" className="text-blue-600 hover:underline">
                Inicio
              </Link>
            </li>
            <li>&gt;</li>
            <li>{leccion.breadcrumb.pais}</li>
            <li>&gt;</li>
            <li>{leccion.breadcrumb.curricula}</li>
            <li>&gt;</li>
            <li>{leccion.breadcrumb.nivel}</li>
            <li>&gt;</li>
            <li>{leccion.breadcrumb.anio}</li>
            <li>&gt;</li>
            <li>{leccion.breadcrumb.materia}</li>
            <li>&gt;</li>
            <li>{leccion.breadcrumb.unidad}</li>
            <li>&gt;</li>
            <li className="font-semibold text-gray-900">{leccion.breadcrumb.tema}</li>
          </ol>
        </nav>

        {/* Main Content */}
        <article className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{leccion.titulo}</h1>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {leccion.contenido}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Slug: <code className="text-xs bg-gray-100 px-2 py-1 rounded">{leccion.slug}</code>
            </p>
          </div>
        </article>

        {/* Navigation */}
        <div className="flex gap-4 justify-between">
          {leccion.prevLessonId ? (
            <button
              onClick={() => router.push(`/leccion/${leccion.prevLessonId}`)}
              className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Anterior
            </button>
          ) : (
            <div />
          )}

          {leccion.nextLessonId ? (
            <button
              onClick={() => router.push(`/leccion/${leccion.nextLessonId}`)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Siguiente →
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
