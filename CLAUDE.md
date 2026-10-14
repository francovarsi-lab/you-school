@AGENTS.md

## YOU SCHOOL

Plataforma educativa: Next.js (frontend público) + Supabase/Postgres (fuente de verdad) + Directus (panel de administración). Se publica en Vercel: https://you-school.vercel.app

Principios:
- La currícula organiza el conocimiento; no define qué existe.
- Una lección es contenido reutilizable. Su ubicación curricular es una relación, no una propiedad.
- El sitio crece agregando contenido, no modificando código.
- El contenido se administra sin tocar el frontend.
- YOU SCHOOL se construye para el alumno que quiere estudiar, no para el docente. Una lección pública debe: 1) estar dirigida al alumno, 2) enseñar un concepto concreto y tener un título que lo diga, 3) entenderse sola, 4) encajar en un tema del currículo. El material pensado para docentes no va (para eso existe Educ.ar).

Usuario: no es programador y habla español rioplatense. Explicar brevemente antes de ejecutar. No dar nada por resuelto hasta que lo confirme en el navegador. Nunca pedir ni mostrar contraseñas.

Dónde vive cada cosa:
- Frontend: Next.js en Vercel. Rutas públicas: `/`, `/estudiar`, `/aprender`, `/leccion/[id]`.
- Datos: Supabase/Postgres. Esquema y migraciones en `database/` (`schema.sql`, `migrations/`).
- Admin: Directus en Docker, carpeta `directus-admin/`, puerto 8055. Credenciales en `directus-admin/.env` (no versionado).
- Video: se guarda como referencia abstracta en `bloques_contenido.referencia`. Formatos: `youtube:ID` (iframe) y `educar:URL` (MP4 de educ.ar, solo host `educar.arsat.com.ar`, reproductor nativo). Solo `src/lib/video.ts` conoce los proveedores.
- Keepalive: `src/app/api/keepalive/route.ts` + cron diario en `vercel.json`, para que Supabase free no se pause.
- Vista previa de borradores: `/preview` y `/preview/leccion/[id]`. Solo local: en producción dan 404. Leen de Directus desde el servidor con `DIRECTUS_EMAIL` y `DIRECTUS_PASSWORD` de `.env.local` (sin prefijo `NEXT_PUBLIC_`).

Reglas:
- El contenido se carga SIEMPRE por la API de Directus o por su panel. Nunca SQL directo a Supabase para contenido.
- Cambios de esquema: van en `database/migrations/` con respaldo y reversa, y requieren autorización explícita del usuario.
- Tablas públicas nuevas necesitan `GRANT SELECT` para `anon` y política RLS de lectura.
- La clave secreta/service key nunca va al frontend. Solo la clave pública `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- No commitear `.env*` ni `database/backups/` (ya están en `.gitignore`).
- Sin credenciales ni claves en archivos versionados. Los scripts leen `directus-admin/.env` sin imprimirlo.
- Khan Academy (fuente preparada, sin videos importados): solo videos hechos por Khan Academy, no los de socios; sin publicidad ni cobro; sin sugerir aval de Khan Academy; con atribución y enlace a www.khanacademy.org (la lección lo muestra junto a la fuente). Licencia CC BY-NC-SA.
- Importador de Educ.ar (`database/import-educar.js`): solo entran fichas de video con audiencia Estudiantes o General, sin "recorte" ni "fragmento" en título o descripción. Docentes-only o sin audiencia van a "a revisar"; otros formatos (Interactivo, Juego, Libro electrónico) quedan aparte sin importarse.
- Ajustes por ficha (`database/importar/ajustes.json`): título y descripción aprobados, por número de ficha. Si la descripción de Educ.ar menciona juegos o actividades y no hay ajuste, el simulacro advierte.
- Chequeo de videos: `node database/chequear-videos.js` (solo lectura). Reporte en `docs/reporte-videos.md`.
- Guía para revisar y publicar lecciones: `docs/GUIA-REVISION.md`. Pendientes de decisión: `docs/revision-pendiente.md`. Fuentes candidatas con licencias verificadas: `docs/fuentes-candidatas.md`.

Lo aprendido (gotchas):
- El entorno es Windows, con Claude Code en la app de escritorio. Los comandos se ejecutan con Git Bash.
- Supabase free se pausa por inactividad. Por eso existe el cron de keepalive.
- Session pooler de Supabase: puerto 5432. Requiere `DB_SSL__REJECT_UNAUTHORIZED=false` en Directus.
- `docker restart` NO relee el `.env`. Para tomar cambios de `.env` hay que borrar y recrear el contenedor con el `docker run` de siempre, parado en `directus-admin/`.
- Directus ignora tablas sin PK de una sola columna. Las tablas de unión se migraron a `id uuid` como PK (`database/migrations/001-junction-ids.sql`).
- `POST /relations` falla si la FK ya existe en la base. Las relaciones M2M se registraron insertando metadatos directamente en `directus_relations` (`database/migrations/003-directus-relations.sql`, reversa en `003-rollback.sql`). Los campos alias M2M en `lecciones` y `temas` se crearon por API.
- Directus cachea el esquema: después de cambios de metadatos o de FKs hay que reiniciar el contenedor.

Estado y pendientes:
- Confirmado: despliegue en Vercel desde master, variables de entorno, cron de keepalive y selector de Conocimientos en Directus.
- Contenido: Argentina > NAP Argentina > Primaria (7 años con sus áreas) > materias de cada año. Lecciones de educ.ar (CC BY-NC-SA, MP4 del reproductor de educ.ar), cargadas desde `database/importar/lista.txt` y publicadas con `database/publicar-lecciones.js`.
- Conteos al cierre: 35 lecciones publicadas y 1 en borrador (la de prueba de Daniel Carreón, de un tercero, que queda en borrador).
- Navegación: "Anterior" y "Siguiente" siguen el orden del curso (orden de lección, tema y unidad dentro de la materia), con `?tema=<id>` en el enlace. Al final de la materia el enlace es "Volver a <Materia>".
- Matemática 4to tiene dos unidades de números: "Números y operaciones" (Fracciones, Multiplicación, Proporcionalidad) y "Geometría y medida". La unidad "Números" se eliminó.
- Lección "Introducción a las fracciones" (texto de prueba) quedó en borrador.
- Reporte de revisión: `database/reporte-revision.js` lee audiencia, ciclo y duración de cada ficha de educ.ar y marca las lecciones solo para docentes o con recorte/fragmento. No despublica nada: la decisión es del usuario.
- Página `/creditos` con enlace al pie de todas las páginas (en el layout). El mail de contacto sale de `NEXT_PUBLIC_CONTACT_EMAIL`; si no existe, la sección se oculta.
- Pendiente: el diseño de /estudiar al llegar a un tema lo revisa el usuario.
- Directus solo corre mientras la PC y Docker estén encendidos. Las lecciones públicas no dependen de Directus: se leen de Supabase.
