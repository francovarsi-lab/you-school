@AGENTS.md

## YOU SCHOOL

Plataforma educativa: Next.js (frontend público) + Supabase/Postgres (fuente de verdad) + Directus (panel de administración). Se publica en Vercel: https://you-school.vercel.app

Principios:
- La currícula organiza el conocimiento; no define qué existe.
- Una lección es contenido reutilizable. Su ubicación curricular es una relación, no una propiedad.
- El sitio crece agregando contenido, no modificando código.
- El contenido se administra sin tocar el frontend.

Usuario: no es programador y habla español rioplatense. Explicar brevemente antes de ejecutar. No dar nada por resuelto hasta que lo confirme en el navegador. Nunca pedir ni mostrar contraseñas.

Dónde vive cada cosa:
- Frontend: Next.js en Vercel. Rutas públicas: `/`, `/estudiar`, `/aprender`, `/leccion/[id]`.
- Datos: Supabase/Postgres. Esquema y migraciones en `database/` (`schema.sql`, `migrations/`).
- Admin: Directus en Docker, carpeta `directus-admin/`, puerto 8055. Credenciales en `directus-admin/.env` (no versionado).
- Video: se guarda como referencia abstracta `youtube:ID` en `bloques_contenido`. Solo `src/lib/video.ts` sabe de YouTube.
- Keepalive: `src/app/api/keepalive/route.ts` + cron diario en `vercel.json`, para que Supabase free no se pause.

Reglas:
- El contenido se carga SIEMPRE por la API de Directus o por su panel. Nunca SQL directo a Supabase para contenido.
- Cambios de esquema: van en `database/migrations/` con respaldo y reversa, y requieren autorización explícita del usuario.
- Tablas públicas nuevas necesitan `GRANT SELECT` para `anon` y política RLS de lectura.
- La clave secreta/service key nunca va al frontend. Solo la clave pública `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- No commitear `.env*` ni `database/backups/` (ya están en `.gitignore`).
- Sin credenciales ni claves en archivos versionados. Los scripts leen `directus-admin/.env` sin imprimirlo.

Lo aprendido (gotchas):
- El entorno es Windows, con Claude Code en la app de escritorio. Los comandos se ejecutan con Git Bash.
- Supabase free se pausa por inactividad. Por eso existe el cron de keepalive.
- Session pooler de Supabase: puerto 5432. Requiere `DB_SSL__REJECT_UNAUTHORIZED=false` en Directus.
- `docker restart` NO relee el `.env`. Para tomar cambios de `.env` hay que borrar y recrear el contenedor con el `docker run` de siempre, parado en `directus-admin/`.
- Directus ignora tablas sin PK de una sola columna. Las tablas de unión se migraron a `id uuid` como PK (`database/migrations/001-junction-ids.sql`).
- `POST /relations` falla si la FK ya existe en la base. Las relaciones M2M se registraron insertando metadatos directamente en `directus_relations` (`database/migrations/003-directus-relations.sql`, reversa en `003-rollback.sql`). Los campos alias M2M en `lecciones` y `temas` se crearon por API.
- Directus cachea el esquema: después de cambios de metadatos o de FKs hay que reiniciar el contenedor.

Estado y pendientes:
- Contenido de prueba: Argentina > NAP Argentina > Primaria > 4to grado > Matemática > Números > Fracciones, con dos lecciones (una de texto y una con video de YouTube).
- Pendiente de confirmar en Vercel: despliegue automático desde master, variables de entorno y el cron de keepalive.
- Pendiente de confirmar en Directus: el selector de Conocimientos y Etiquetas en el formulario de la lección.
- Directus solo corre mientras la PC y Docker estén encendidos. Las lecciones públicas no dependen de Directus: se leen de Supabase.
