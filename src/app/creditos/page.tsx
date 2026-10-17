export const metadata = {
  title: 'Créditos',
  description: 'Qué es YOU SCHOOL, de dónde salen los videos y con qué licencia se publican.',
};

export default function CreditosPage() {
  const contacto = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-[70ch] space-y-8 text-gray-900 leading-relaxed">
        <h1 className="text-3xl font-bold">Créditos</h1>

        <section aria-labelledby="que-es" className="space-y-2">
          <h2 id="que-es" className="text-xl font-semibold">Qué es YOU SCHOOL</h2>
          <p className="text-lg">
            YOU SCHOOL es un proyecto educativo gratuito y sin fines de lucro. Organiza material abierto para que cualquiera pueda estudiar.
          </p>
        </section>

        <section aria-labelledby="aviso" className="space-y-2">
          <h2 id="aviso" className="text-xl font-semibold">Aviso</h2>
          <p className="text-lg">
            YOU SCHOOL no es un proyecto oficial, no entrega títulos oficiales y no está afiliado al Ministerio de Educación de la Nación ni a Educ.ar.
          </p>
        </section>

        <section aria-labelledby="fuentes" className="space-y-2">
          <h2 id="fuentes" className="text-xl font-semibold">Fuentes y licencias</h2>
          <p className="text-lg break-words">
            Los videos pertenecen al Ministerio de Educación de la Nación y/o Educ.ar, bajo licencia Creative Commons Atribución-NoComercial-CompartirIgual (CC BY-NC-SA). Más información en{' '}
            <a href="https://www.educ.ar" className="inline-flex min-h-11 items-center text-blue-900 underline underline-offset-4 hover:text-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded-sm">
              educ.ar
            </a>
            . Cada clase muestra su fuente y su licencia.
          </p>
        </section>

        <section aria-labelledby="propias" className="space-y-2">
          <h2 id="propias" className="text-xl font-semibold">Lecciones propias</h2>
          <p className="text-lg break-words">
            Las lecciones escritas por YOU SCHOOL tienen fuente YOU SCHOOL y se publican bajo licencia Creative Commons Atribución-NoComercial-CompartirIgual 4.0 (CC BY-NC-SA 4.0). Cada lección indica su autor al final.
          </p>
        </section>

        {contacto && (
          <section aria-labelledby="correcciones" className="space-y-2">
            <h2 id="correcciones" className="text-xl font-semibold">Correcciones y retiros</h2>
            <p className="text-lg">
              Si encontrás un error o querés pedir que se retire un contenido, escribinos a{' '}
              <a href={`mailto:${contacto}`} className="inline-flex min-h-11 items-center break-all text-blue-900 underline underline-offset-4 hover:text-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded-sm">
                {contacto}
              </a>
              .
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
