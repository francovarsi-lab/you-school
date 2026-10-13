import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test de conexión',
  description: 'Prueba interna de conexión con la base de datos.',
  robots: { index: false, follow: false },
};

export default function TestConexionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
