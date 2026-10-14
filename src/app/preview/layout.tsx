import type { Metadata } from 'next';
import { bloquearEnProduccion } from '@/lib/preview';

export const metadata: Metadata = {
  title: 'Vista previa',
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  bloquearEnProduccion();
  return children;
}
