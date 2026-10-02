'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  leccion_id: string;
  titulo: string;
  breadcrumb?: string;
}

export default function AprenderPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchQuery.trim().length === 0) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      try {
        setLoading(true);
        setHasSearched(true);

        const query = `%${searchQuery.toLowerCase()}%`;

        // Search in lecciones titulo/descripcion
        const { data: lecciones } = await supabase
          .from('lecciones')
          .select('id, titulo, slug, estado')
          .eq('estado', 'publicado')
          .or(`titulo.ilike.${query},descripcion.ilike.${query}`) as any;

        // Search in etiquetas
        const { data: etiquetasData } = await supabase
          .from('lecciones_etiquetas')
          .select(`
            leccion_id,
            etiquetas (
              nombre
            ),
            lecciones (
              id,
              titulo,
              slug,
              estado
            )
          `)
          .ilike('etiquetas.nombre', query) as any;

        // Collect unique lessons
        const lessonSet = new Map<string, SearchResult>();

        // Add from lecciones search
        if (lecciones) {
          for (const lec of lecciones) {
            lessonSet.set(lec.id, {
              leccion_id: lec.id,
              titulo: lec.titulo,
            });
          }
        }

        // Add from etiquetas search
        if (etiquetasData) {
          for (const et of etiquetasData) {
            if (et.lecciones && et.lecciones.estado === 'publicado') {
              lessonSet.set(et.leccion_id, {
                leccion_id: et.leccion_id,
                titulo: et.lecciones.titulo,
              });
            }
          }
        }

        // Fetch ubicaciones for breadcrumbs
        const lectureIds = Array.from(lessonSet.keys());
        if (lectureIds.length > 0) {
          const { data: ubicaciones } = await supabase
            .from('ubicaciones_curriculares')
            .select(`
              leccion_id,
              temas (
                nombre,
                unidades (
                  nombre,
                  materias (
                    nombre,
                    anios (
                      nombre,
                      niveles (
                        nombre,
                        curriculas (
                          nombre,
                          paises (
                            nombre
                          )
                        )
                      )
                    )
                  )
                )
              )
            `)
            .in('leccion_id', lectureIds)
            .limit(1) as any;

          if (ubicaciones && ubicaciones.length > 0) {
            for (const ub of ubicaciones) {
              const result = lessonSet.get(ub.leccion_id);
              if (result && ub.temas) {
                const t = ub.temas as any;
                const breadcrumb = `${t.unidades?.nombre} > ${t.nombre}`;
                result.breadcrumb = breadcrumb;
              }
            }
          }
        }

        setResults(Array.from(lessonSet.values()));
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Aprender</h1>

        {/* Search Input */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Busca lecciones, conocimientos, etiquetas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 dark:bg-gray-900 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>

        {/* Results */}
        {hasSearched && loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Buscando...</p>
          </div>
        )}

        {hasSearched && !loading && results.length === 0 && (
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <p className="text-yellow-800">No se encontraron resultados para "{searchQuery}"</p>
          </div>
        )}

        {!hasSearched && (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <p className="text-blue-800">Comienza a escribir para buscar lecciones, conocimientos y etiquetas.</p>
          </div>
        )}

        {hasSearched && !loading && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">Se encontraron {results.length} resultado(s)</p>
            {results.map((result) => (
              <div
                key={result.leccion_id}
                onClick={() => router.push(`/leccion/${result.leccion_id}`)}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-400"
              >
                <h3 className="font-semibold text-gray-900 hover:text-blue-600">{result.titulo}</h3>
                {result.breadcrumb && (
                  <p className="text-sm text-gray-500 mt-2">{result.breadcrumb}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
