# 004: columna `url_origen` en `lecciones`

**Qué cambia:** se agrega una columna opcional `url_origen` (texto) a la tabla `lecciones`. Es un cambio aditivo: no modifica filas existentes ni otras tablas.

**Cómo se aplicó:** por la API de Directus, `POST /fields/lecciones` con `type: text` y `schema.is_nullable: true`. Directus crea la columna y registra el campo.

**Valores cargados:**
- "La pizza y sus porciones": `https://www.educ.ar/recursos/155961/la-pizza-y-sus-porciones`
- "Las porciones de pizza y sus equivalencias": `https://www.educ.ar/recursos/155962/las-porciones-de-pizza-y-sus-equivalencias`
- "TIPOS DE FRACCIONES Super fácil | Para principiantes": `https://www.youtube.com/watch?v=7Xvlv3SCA4c`

**Verificación:** antes y después se comparó la tabla `lecciones` (4 filas). Solo cambiaron `url_origen` y el `estado` de la lección de Daniel Carreón (pasó a borrador). El respaldo previo está en `database/backups/lecciones-before-004.json` (no versionado).

**Reversa:** quitar el campo por API, `DELETE /fields/lecciones/url_origen`. Directus elimina la columna. Si se quiere borrar solo el contenido, `PATCH /items/lecciones/{id}` con `url_origen: null`.
