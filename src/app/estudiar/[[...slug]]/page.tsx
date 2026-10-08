'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface BreadcrumbItem {
  nombre: string;
  depth: number;
}

interface ListItem {
  id: string;
  nombre: string;
  type: 'pais' | 'curricula' | 'nivel' | 'anio' | 'materia' | 'unidad' | 'tema' | 'leccion';
}

const linkClass =
  'rounded-sm text-blue-800 no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700';

export default function EstudiarPage() {
  const params = useParams();
  const router = useRouter();
  const [items, setItems] = useState<ListItem[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string>('');

  const slug = useMemo(() =>
    Array.isArray(params.slug) ? params.slug : params.slug ? [params.slug] : [],
    [params.slug]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // No slug: list countries
        if (slug.length === 0) {
          const { data, error: err } = await supabase
            .from('paises')
            .select('id, nombre')
            .order('nombre');

          if (err) throw err;
          setItems(data?.map(p => ({ id: p.id, nombre: p.nombre, type: 'pais' })) || []);
          setCurrentLevel('Selecciona un país');
          setBreadcrumb([]);
          return;
        }

        // Build breadcrumb and fetch next level based on slug length
        const breadcrumbData: BreadcrumbItem[] = [];

        if (slug.length >= 1) {
          // Fetch country for breadcrumb
          const { data: pais } = await supabase
            .from('paises')
            .select('id, nombre')
            .eq('id', slug[0])
            .single();
          if (pais) breadcrumbData.push({ nombre: pais.nombre, depth: 1 });
        }

        // Level 1: list curriculas for country
        if (slug.length === 1) {
          const { data, error: err } = await supabase
            .from('curriculas')
            .select('id, nombre')
            .eq('pais_id', slug[0])
            .order('nombre');

          if (err) throw err;
          setItems(data?.map(c => ({ id: c.id, nombre: c.nombre, type: 'curricula' })) || []);
          setCurrentLevel('Selecciona una currícula');
          setBreadcrumb(breadcrumbData);
          return;
        }

        if (slug.length >= 2) {
          const { data: curricula } = await supabase
            .from('curriculas')
            .select('id, nombre')
            .eq('id', slug[1])
            .single();
          if (curricula) breadcrumbData.push({ nombre: curricula.nombre, depth: 2 });
        }

        // Level 2: list levels
        if (slug.length === 2) {
          const { data, error: err } = await supabase
            .from('niveles')
            .select('id, nombre')
            .eq('curricula_id', slug[1])
            .order('nombre');

          if (err) throw err;
          setItems(data?.map(n => ({ id: n.id, nombre: n.nombre, type: 'nivel' })) || []);
          setCurrentLevel('Selecciona un nivel');
          setBreadcrumb(breadcrumbData);
          return;
        }

        if (slug.length >= 3) {
          const { data: nivel } = await supabase
            .from('niveles')
            .select('id, nombre')
            .eq('id', slug[2])
            .single();
          if (nivel) breadcrumbData.push({ nombre: nivel.nombre, depth: 3 });
        }

        // Level 3: list years
        if (slug.length === 3) {
          const { data, error: err } = await supabase
            .from('anios')
            .select('id, nombre')
            .eq('nivel_id', slug[2])
            .order('nombre');

          if (err) throw err;
          setItems(data?.map(a => ({ id: a.id, nombre: a.nombre, type: 'anio' })) || []);
          setCurrentLevel('Selecciona un año');
          setBreadcrumb(breadcrumbData);
          return;
        }

        if (slug.length >= 4) {
          const { data: anio } = await supabase
            .from('anios')
            .select('id, nombre')
            .eq('id', slug[3])
            .single();
          if (anio) breadcrumbData.push({ nombre: anio.nombre, depth: 4 });
        }

        // Level 4: list subjects
        if (slug.length === 4) {
          const { data, error: err } = await supabase
            .from('materias')
            .select('id, nombre')
            .eq('anio_id', slug[3])
            .order('nombre');

          if (err) throw err;
          setItems(data?.map(m => ({ id: m.id, nombre: m.nombre, type: 'materia' })) || []);
          setCurrentLevel('Selecciona una materia');
          setBreadcrumb(breadcrumbData);
          return;
        }

        if (slug.length >= 5) {
          const { data: materia } = await supabase
            .from('materias')
            .select('id, nombre')
            .eq('id', slug[4])
            .single();
          if (materia) breadcrumbData.push({ nombre: materia.nombre, depth: 5 });
        }

        // Level 5: list units
        if (slug.length === 5) {
          const { data, error: err } = await supabase
            .from('unidades')
            .select('id, nombre')
            .eq('materia_id', slug[4])
            .order('nombre');

          if (err) throw err;
          setItems(data?.map(u => ({ id: u.id, nombre: u.nombre, type: 'unidad' })) || []);
          setCurrentLevel('Selecciona una unidad');
          setBreadcrumb(breadcrumbData);
          return;
        }

        if (slug.length >= 6) {
          const { data: unidad } = await supabase
            .from('unidades')
            .select('id, nombre')
            .eq('id', slug[5])
            .single();
          if (unidad) breadcrumbData.push({ nombre: unidad.nombre, depth: 6 });
        }

        // Level 6: list topics
        if (slug.length === 6) {
          const { data, error: err } = await supabase
            .from('temas')
            .select('id, nombre')
            .eq('unidad_id', slug[5])
            .order('nombre');

          if (err) throw err;
          setItems(data?.map(t => ({ id: t.id, nombre: t.nombre, type: 'tema' })) || []);
          setCurrentLevel('Selecciona un tema');
          setBreadcrumb(breadcrumbData);
          return;
        }

        if (slug.length >= 7) {
          const { data: tema } = await supabase
            .from('temas')
            .select('id, nombre')
            .eq('id', slug[6])
            .single();
          if (tema) breadcrumbData.push({ nombre: tema.nombre, depth: 7 });
        }

        // Level 7: list lessons for this topic
        if (slug.length === 7) {
          const { data, error: err } = await supabase
            .from('ubicaciones_curriculares')
            .select('leccion_id, orden, lecciones(id, titulo)')
            .eq('tema_id', slug[6])
            .eq('lecciones.estado', 'publicado')
            .order('orden');

          if (err) throw err;
          const lessons = data
            ?.map((uc: any) => ({
              id: uc.leccion_id,
              nombre: uc.lecciones?.titulo || 'Sin título',
              type: 'leccion' as const,
            }))
            .filter(Boolean) || [];

          setItems(lessons);
          setCurrentLevel('Lecciones disponibles');
          setBreadcrumb(breadcrumbData);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, router]);

  const handleClick = (itemId: string) => {
    const newSlug = [...slug, itemId].join('/');
    router.push(`/estudiar/${newSlug}`);
  };

  const handleLessonClick = (lessonId: string) => {
    router.push(`/leccion/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <nav className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-700">
              <li>
                <Link href="/" className={linkClass}>
                  Inicio
                </Link>
              </li>
              {breadcrumb.map((item) => (
                <li key={item.depth} className="flex items-center gap-x-2">
                  <span aria-hidden="true">&gt;</span>
                  <Link href={`/estudiar/${slug.slice(0, item.depth).join('/')}`} className={linkClass}>
                    {item.nombre}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Current Level Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{currentLevel}</h1>

        {/* Items List */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.type === 'leccion') {
                    handleLessonClick(item.id);
                  } else {
                    handleClick(item.id);
                  }
                }}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left border border-gray-200 hover:border-blue-400"
              >
                <p className="font-semibold text-gray-900">{item.nombre}</p>
                <p className="text-sm text-gray-500 mt-1">{item.type}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No hay elementos disponibles</p>
        )}
      </div>
    </div>
  );
}
