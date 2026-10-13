import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aprender',
  description: 'Buscá lecciones por título, conocimiento o etiqueta.',
};

export default function AprenderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
