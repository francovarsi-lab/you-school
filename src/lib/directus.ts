// Lectura de Directus desde el servidor. Solo para la vista previa local:
// nunca se importa desde componentes de cliente.
const URL_BASE = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const EMAIL = process.env.DIRECTUS_EMAIL;
const PASSWORD = process.env.DIRECTUS_PASSWORD;

// Directus apagado o inaccesible.
export class DirectusNoDisponible extends Error {}
// Falta configurar credenciales en .env.local o el login falló.
export class DirectusSinConfigurar extends Error {}

let sesion: { token: string; hasta: number } | null = null;

async function obtenerToken(): Promise<string> {
  if (!EMAIL || !PASSWORD) {
    throw new DirectusSinConfigurar('Faltan DIRECTUS_EMAIL o DIRECTUS_PASSWORD en .env.local');
  }
  if (sesion && sesion.hasta > Date.now()) return sesion.token;

  let r: Response;
  try {
    r = await fetch(`${URL_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      cache: 'no-store',
    });
  } catch {
    throw new DirectusNoDisponible();
  }
  if (!r.ok) throw new DirectusSinConfigurar(`El login en Directus falló (${r.status})`);
  const { data } = await r.json();
  sesion = { token: data.access_token, hasta: Date.now() + (data.expires ?? 600000) - 60000 };
  return sesion.token;
}

export async function directus<T>(ruta: string): Promise<T> {
  const token = await obtenerToken();
  let r: Response;
  try {
    r = await fetch(`${URL_BASE}${ruta}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    throw new DirectusNoDisponible();
  }
  if (r.status === 404) return null as T;
  if (!r.ok) throw new Error(`Directus ${ruta} respondió ${r.status}`);
  return (await r.json()).data as T;
}
