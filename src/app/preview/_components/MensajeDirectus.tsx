import Link from 'next/link';
import { DirectusNoDisponible, DirectusSinConfigurar } from '@/lib/directus';

// Qué mostrar cuando no se puede leer Directus.
export default function MensajeDirectus({ error }: { error: unknown }) {
  const sinConfigurar = error instanceof DirectusSinConfigurar;
  const noDisponible = error instanceof DirectusNoDisponible;
  const texto = noDisponible
    ? 'Directus no está encendido. Encendelo (Docker y el contenedor de Directus) y recargá esta página.'
    : sinConfigurar
      ? (error as Error).message
      : 'No se pudo leer la información desde Directus.';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 rounded-lg bg-amber-100 p-4 font-semibold text-amber-900">VISTA PREVIA - solo en este equipo</div>
        <div className="rounded-lg border border-amber-500 bg-amber-50 p-6 text-amber-900">
          <p className="mb-4">{texto}</p>
          <Link href="/preview" className="inline-flex min-h-11 items-center text-blue-800 underline">
            Volver a la lista de borradores
          </Link>
        </div>
      </div>
    </div>
  );
}
