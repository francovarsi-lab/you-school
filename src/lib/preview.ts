import { notFound } from 'next/navigation';

// La vista previa de borradores no existe en producción.
export function bloquearEnProduccion() {
  if (process.env.NODE_ENV === 'production') notFound();
}
