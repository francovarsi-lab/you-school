# Guía para revisar y publicar una lección

Esta guía sirve para revisar una lección que está en **borrador** y, si está bien, publicarla. Las lecciones en borrador no se ven en el sitio público.

## Antes de empezar

1. **Directus tiene que estar encendido.** Es el panel de administración. Si Docker no está corriendo, la vista previa te va a decir "Directus no está encendido".
2. **Abrí la carpeta `you-school` en una terminal** y corré:

   ```bash
   npm run dev
   ```

3. Esperá a que diga que está listo. La vista previa queda en `http://localhost:3000/preview`.

> Si la vista previa dice que faltan credenciales, pedí que te agreguen las dos líneas `DIRECTUS_EMAIL` y `DIRECTUS_PASSWORD` en `.env.local`. Son las mismas de Directus.

## Paso 1: abrir la vista previa

1. Entrá a `http://localhost:3000/preview`.
2. Vas a ver la lista de **todos los borradores**. Tocá el título de la lección que querés revisar.
3. Arriba de todo hay un cartel amarillo que dice **"VISTA PREVIA - borrador"**. Eso indica que la lección no está publicada.

La vista previa solo funciona en tu computadora. En el sitio público no existe.

## Paso 2: qué mirar

Revisá estos puntos en orden. Si alguno no cumple, no publiques todavía.

| Qué mirar | Cómo saber si está bien |
|---|---|
| **Título** | Dice el concepto con claridad. Por ejemplo, "Tipos de triángulos y triángulo rectángulo". Un alumno tiene que entender de qué trata sin leer más. |
| **Se entiende sola** | Se puede seguir sin haber visto otra lección. No menciona juegos o actividades que no están en el sitio. |
| **Grado y unidad** | Las migas de pan arriba (año > materia > unidad > tema) son las correctas para ese contenido. |
| **Video** | El video se reproduce al tocar play. Si dice "No se puede mostrar el video", hay un problema con el enlace: no la publiques. |
| **Descripción** | La frase de arriba describe el contenido, y abajo aparece "Autor: …, vía Educ.ar." |
| **Fuente y licencia** | Debajo del texto dice "Fuente: Educ.ar. Licencia: CC BY-NC-SA" (o la que corresponda). |

Si todo está bien, seguí al paso 3. Si no, anotá qué hay que cambiar y avisale a quien mantiene el sitio.

## Paso 3: publicar en Directus

1. Abrí **http://localhost:8055** en el navegador y entrá con tu usuario de Directus.
2. Entrá a **lecciones**.
3. Buscá la lección por su título.
4. Abrila y cambiá el campo **estado** de **borrador** a **publicado**.
5. Guardá.

Para publicar varias a la vez: marcá sus casillas en la lista, elegí **cambiar estado** y poné **publicado**.

> Solo cambiá el estado. No borres la lección, y no cambies el título ni la descripción sin revisarlo.

## Paso 4: confirmar en el sitio de producción

1. Esperá un minuto.
2. Abrí `https://you-school.vercel.app/leccion/` seguido del **id** de la lección. El id está en la dirección de la lección en Directus, o en la lista de la vista previa.
3. Revisá lo mismo que en el paso 2: que el video reproduzca, que la fuente y la licencia se vean y que la lección aparezca en el tema correcto, en **https://you-school.vercel.app/estudiar**.

Si algo no aparece, volvé a Directus y revisá que el estado sea **publicado** y que la ubicación esté en el tema correcto.

## Si algo sale mal

- **La lección no aparece en el sitio:** revisá que el estado sea "publicado" y esperá un minuto.
- **El video no reproduce:** no publiques. Anotá el título y avisá.
- **Dice "Directus no está encendido":** abrí Docker y el contenedor de Directus, y recargá la página.
- **Querés volver atrás:** volvé a poner el estado en **borrador**. Así la lección deja de verse en el sitio, sin borrarla.
