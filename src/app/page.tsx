import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">YOU SCHOOL</h1>
        <p className="text-lg text-gray-600 mb-12">Plataforma educativa para explorar y aprender</p>

        <div className="space-y-4">
          <Link
            href="/estudiar"
            className="block w-full py-4 px-6 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors"
          >
            Estudiar
          </Link>

          <Link
            href="/aprender"
            className="block w-full py-4 px-6 bg-indigo-600 text-white font-semibold text-lg rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Aprender
          </Link>
        </div>
      </div>
    </div>
  );
}
