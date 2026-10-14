import Link from 'next/link';
import { notFound } from 'next/navigation';
import { directus } from '@/lib/directus';
import { resolveVideoReference } from '@/lib/video';
import MensajeDirectus from '../../_components/MensajeDirectus';

export const dynamic = 'force-dynamic';

type Leccion = {
  id: string;
  titulo: string;
  descripcion: string | null;
  estado: string;
  url_origen: string | null;
  fuente_id: { nombre: string; licencia: string | null } | null;
};
type Bloque = { orden: number; tipo: string; referencia: string };
type Ubicacion = {
  tema_id: {
    nombre: string;
    unidad_id: { nombre: string; materia_id: { nombre: string; anio_id: { nombre: string } } };
  };
};

export default async function PreviewLeccion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  let leccion: Leccion | undefined;
  let bloques: Bloque[];
  let ubicaciones: Ubicacion[];
  try {
    const encontradas = await directus<Leccion[]>(
      `/items/lecciones?filter[id][_eq]=${id}&limit=1&fields=id,titulo,descripcion,estado,url_origen,fuente_id.nombre,fuente_id.licencia`
    );
    leccion = encontradas[0];
    if (!leccion) notFound();
    bloques = await directus<Bloque[]>(
      `/items/bloques_contenido?filter[leccion_id][_eq]=${id}&sort=orden&fields=orden,tipo,referencia`
    );
    ubicaciones = await directus<Ubicacion[]>(
      `/items/ubicaciones_curriculares?filter[leccion_id][_eq]=${id}&limit=1&fields=tema_id.nombre,tema_id.unidad_id.nombre,tema_id.unidad_id.materia_id.nombre,tema_id.unidad_id.materia_id.anio_id.nombre`
    );
  } catch (error) {
    // notFound() lanza una excepción propia: no se debe capturar.
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return <MensajeDirectus error={error} />;
  }

  const u = ubicaciones[0]?.tema_id;
  const origen = leccion.url_origen ?? null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-[70ch]">
        <div className="mb-6 rounded-lg bg-amber-100 p-4 font-semibold text-amber-900">VISTA PREVIA - borrador</div>
        <Link href="/preview" className="mb-6 inline-flex min-h-11 items-center text-blue-800 underline">
          Volver a los borradores
        </Link>

        {u && (
          <nav aria-label="Ubicación curricular" className="mb-8">
            <p className="text-sm text-gray-700 break-words">
              {u.unidad_id.materia_id.anio_id.nombre} &gt; {u.unidad_id.materia_id.nombre} &gt; {u.unidad_id.nombre} &gt; {u.nombre}
            </p>
          </nav>
        )}

        <article className="bg-white rounded-lg shadow-lg p-4 md:p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 break-words">{leccion.titulo}</h1>

          <div className="space-y-6">
            {bloques.map((b, i) => {
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
                  return (
                    <video
                      key={i}
                      className="block w-[calc(100%+2rem)] -mx-4 max-w-none rounded-none bg-black md:w-full md:mx-0 md:rounded-lg"
                      controls
                      preload="none"
                      playsInline
                      src={embed.src}
                      aria-label={`Video: ${leccion.titulo}`}
                    />
                  );
                }
                return (
                  <div key={i} className="relative -mx-4 md:mx-0 aspect-video md:rounded-lg overflow-hidden bg-black">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={embed.src}
                      title={`Video: ${leccion.titulo}`}
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                );
              }
              return (
                <p key={i} className="leading-relaxed text-gray-800 whitespace-pre-wrap break-words">
                  {b.referencia}
                </p>
              );
            })}
            {bloques.length === 0 && <p className="text-gray-700">Esta lección todavía no tiene contenido.</p>}
          </div>

          {leccion.descripcion && (
            <p className="mt-6 pt-4 border-t border-gray-300 text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
              {leccion.descripcion}
            </p>
          )}

          {leccion.fuente_id && (
            <p className={`${leccion.descripcion ? 'mt-3' : 'mt-6 pt-4 border-t border-gray-300'} text-sm text-gray-800 break-words`}>
              Fuente:{' '}
              {origen ? (
                <a
                  href={origen}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-blue-800 underline hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 rounded-sm"
                >
                  {leccion.fuente_id.nombre}
                </a>
              ) : (
                leccion.fuente_id.nombre
              )}
              {leccion.fuente_id.licencia && <>. Licencia: {leccion.fuente_id.licencia}</>}
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
