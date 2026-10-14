import Link from 'next/link';
import { directus } from '@/lib/directus';
import MensajeDirectus from './_components/MensajeDirectus';

export const dynamic = 'force-dynamic';

type LeccionBorrador = { id: string; titulo: string };

export default async function PreviewLista() {
  let lecciones: LeccionBorrador[];
  try {
    lecciones = await directus<LeccionBorrador[]>(
      '/items/lecciones?limit=-1&filter[estado][_eq]=borrador&fields=id,titulo&sort=titulo'
    );
  } catch (error) {
    return <MensajeDirectus error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 rounded-lg bg-amber-100 p-4 font-semibold text-amber-900">VISTA PREVIA - solo en este equipo</div>
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Borradores</h1>

        {lecciones.length === 0 ? (
          <p className="text-gray-700">No hay lecciones en borrador.</p>
        ) : (
          <ul className="space-y-3">
            {lecciones.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/preview/leccion/${l.id}`}
                  className="block min-h-11 rounded-lg border border-gray-300 bg-white p-4 font-semibold text-blue-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 break-words"
                >
                  {l.titulo}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
