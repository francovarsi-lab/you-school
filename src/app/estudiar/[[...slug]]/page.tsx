import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import NavegadorClient from './NavegadorClient';

export const dynamic = 'force-dynamic';

type Leccion = { id: string; titulo: string; estado: string };
type Ubicacion = { orden: number | null; estado: string; lecciones: Leccion | null };
type Tema = { id: string; nombre: string; orden: number | null; ubicaciones_curriculares: Ubicacion[] };
type Unidad = { id: string; nombre: string; orden: number | null; temas: Tema[] };
type Materia = { id: string; nombre: string; orden: number | null; unidades: Unidad[] };
type Anio = { id: string; nombre: string; orden: number | null; materias: Materia[] };
type Nivel = { id: string; nombre: string; orden: number | null; anios: Anio[] };
type Curricula = { id: string; nombre: string; niveles: Nivel[] };
type Pais = { id: string; nombre: string; curriculas: Curricula[] };

const ordenar = <T extends { nombre: string; orden?: number | null }>(xs: T[]) =>
  [...xs].sort((a, b) => (a.orden ?? Infinity) - (b.orden ?? Infinity) || a.nombre.localeCompare(b.nombre));

const leccionesDe = (t: Tema) =>
  t.ubicaciones_curriculares
    .filter((u) => u.estado === 'publicado' && u.lecciones?.estado === 'publicado')
    .sort((a, b) => (a.orden ?? Infinity) - (b.orden ?? Infinity))
    .map((u) => u.lecciones as Leccion);

const sumar = (n: number[]) => n.reduce((a, b) => a + b, 0);
const contarUnidad = (u: Unidad) => sumar(u.temas.map((t) => leccionesDe(t).length));
const contarMateria = (m: Materia) => sumar(m.unidades.map(contarUnidad));
const contarAnio = (a: Anio) => sumar(a.materias.map(contarMateria));
const contarNivel = (n: Nivel) => sumar(n.anios.map(contarAnio));
const contarCurricula = (c: Curricula) => sumar(c.niveles.map(contarNivel));
const contarPais = (p: Pais) => sumar(p.curriculas.map(contarCurricula));

// Índice completo en un solo pedido. Cuando la currícula crezca, este árbol
// tiene que cargarse por niveles (como NavegadorClient), no entero.
async function cargarIndice(): Promise<Pais[]> {
  const { data, error } = await supabase
    .from('paises')
    .select(`
      id, nombre,
      curriculas (
        id, nombre,
        niveles (
          id, nombre, orden,
          anios (
            id, nombre, orden,
            materias (
              id, nombre, orden,
              unidades (
                id, nombre, orden,
                temas (
                  id, nombre, orden,
                  ubicaciones_curriculares ( orden, estado, lecciones ( id, titulo, estado ) )
                )
              )
            )
          )
        )
      )
    `);
  if (error) throw new Error(`No se pudo cargar el índice: ${error.message}`);
  const paises = (data ?? []) as unknown as Pais[];
  return ordenar(paises).map((p) => ({
    ...p,
    curriculas: ordenar(p.curriculas).map((c) => ({
      ...c,
      niveles: ordenar(c.niveles).map((n) => ({
        ...n,
        anios: ordenar(n.anios).map((a) => ({
          ...a,
          materias: ordenar(a.materias).map((m) => ({
            ...m,
            unidades: ordenar(m.unidades).map((u) => ({
              ...u,
              temas: ordenar(u.temas),
            })),
          })),
        })),
      })),
    })),
  }));
}

function Nodo({ titulo, count, nivel, children }: { titulo: string; count: number; nivel: number; children: React.ReactNode }) {
  const vacio = count === 0;
  return (
    <details className="mt-2 border-l-2 border-gray-300 pl-3">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-md py-2 pr-2 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
        <span className={`font-semibold ${vacio ? 'text-gray-600' : 'text-gray-900'} ${nivel === 0 ? 'text-xl' : 'text-base'}`}>
          {titulo}
        </span>
        <span className="shrink-0 text-sm text-gray-700">
          {count === 1 ? '1 lección' : `${count} lecciones`}
        </span>
      </summary>
      <div className="pb-2">{children}</div>
    </details>
  );
}

function IndiceCompleto({ paises }: { paises: Pais[] }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Currícula</h1>
        {paises.map((p) => (
          <Nodo key={p.id} titulo={p.nombre} count={contarPais(p)} nivel={0}>
            {p.curriculas.map((c) => (
              <Nodo key={c.id} titulo={c.nombre} count={contarCurricula(c)} nivel={1}>
                {c.niveles.map((n) => (
                  <Nodo key={n.id} titulo={n.nombre} count={contarNivel(n)} nivel={2}>
                    {n.anios.map((a) => (
                      <Nodo key={a.id} titulo={a.nombre} count={contarAnio(a)} nivel={3}>
                        {a.materias.map((m) => (
                          <Nodo key={m.id} titulo={m.nombre} count={contarMateria(m)} nivel={4}>
                            {m.unidades.map((u) => (
                              <Nodo key={u.id} titulo={u.nombre} count={contarUnidad(u)} nivel={5}>
                                {u.temas.map((t) => {
                                  const lecciones = leccionesDe(t);
                                  return (
                                    <Nodo key={t.id} titulo={t.nombre} count={lecciones.length} nivel={6}>
                                      <ul className="space-y-1">
                                        {lecciones.map((l) => (
                                          <li key={l.id}>
                                            <Link
                                              href={`/leccion/${l.id}`}
                                              className="block min-h-12 rounded-md py-3 px-2 text-blue-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                                            >
                                              {l.titulo}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </Nodo>
                                  );
                                })}
                              </Nodo>
                            ))}
                          </Nodo>
                        ))}
                      </Nodo>
                    ))}
                  </Nodo>
                ))}
              </Nodo>
            ))}
          </Nodo>
        ))}
        {paises.length === 0 && <p className="text-gray-700">No hay currícula cargada.</p>}
      </div>
    </div>
  );
}

export default async function EstudiarPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  if (slug && slug.length > 0) {
    return <NavegadorClient slug={slug} />;
  }
  const paises = await cargarIndice();
  return <IndiceCompleto paises={paises} />;
}
