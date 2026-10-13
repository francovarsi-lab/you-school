import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lección',
  description: 'Lección de YOU SCHOOL con su video, su fuente y su licencia.',
};

export default function LeccionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
