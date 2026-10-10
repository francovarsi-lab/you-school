# Cómo cargar una lección con video

Esta guía es para cargar contenido en YOU SCHOOL desde el panel de Directus. No hace falta programar.

Antes de empezar, la PC tiene que estar prendida y Docker Desktop abierto.

## 1. Abrir Directus

1. Abrí **Docker Desktop** y esperá a que diga que está funcionando.
2. Abrí el navegador y entrá a **http://localhost:8055**.
3. Iniciá sesión con el email y la contraseña de administrador.

## 2. Elegir o crear el Conocimiento

Un Conocimiento es un tema de estudio que puede aparecer en muchas lecciones (por ejemplo, "Fracciones").

1. En el menú, entrá a **conocimientos**.
2. Si ya existe, anotá su nombre y seguí al paso 3.
3. Si no existe, tocá **Crear** y completá el nombre y la descripción.

## 3. Crear la Lección

1. Entrá a **lecciones** y tocá **Crear**.
2. Completá:
   - **titulo**: el título que va a ver el alumno.
   - **slug**: el mismo título en minúsculas, sin tildes y con guiones (por ejemplo `tipos-de-fracciones`). Tiene que ser único.
   - **idioma**: elegí **Español**.
   - **estado**: elegí **publicado** para que se vea en el sitio. Si está en **borrador**, no se muestra.
   - **fuente**: elegí la fuente del paso 7 (si todavía no existe, volvé acá después).
3. Guardá.

## 4. Agregar el bloque de video

Un bloque es una pieza de contenido dentro de la lección. Para un video de YouTube:

1. Entrá a **bloques_contenido** y tocá **Crear**.
2. Completá:
   - **leccion**: elegí la lección del paso 3.
   - **tipo**: **video**.
   - **orden**: **1** (o el número que corresponda si hay más bloques).
   - **referencia**: `youtube:` seguido del código del video. El código es lo que está después de `v=` en el link. Ejemplo: si el link es `https://www.youtube.com/watch?v=7Xvlv3SCA4c`, la referencia es `youtube:7Xvlv3SCA4c`.
3. Guardá.

Para texto, creá otro bloque con **tipo** = **texto** y el texto en **referencia**.

## 5. Asociar Conocimientos y Etiquetas

1. Abrí la lección en **lecciones**.
2. En el campo **conocimientos**, tocá **Agregar** y elegí el Conocimiento del paso 2.
3. En el campo **etiquetas**, agregá las palabras clave que ayudan a encontrar la lección (por ejemplo, "fracciones", "primaria").
4. Guardá.

## 6. Ubicar la lección en un Tema, con su orden

La ubicación dice dónde aparece la lección en la currícula (país, año, materia, unidad y tema). Una misma lección puede estar en más de un tema.

1. Entrá a **ubicaciones_curriculares** y tocá **Crear**.
2. Completá:
   - **leccion**: la lección del paso 3.
   - **tema**: el tema donde va (por ejemplo, "Fracciones").
   - **orden**: el número de posición dentro del tema. La primera lección es **1**, la siguiente **2**, y así.
   - **estado**: **publicado**.
3. Guardá.

## 7. Registrar la fuente

La fuente dice de dónde sale el contenido. Es importante para respetar la licencia.

1. Entrá a **fuentes** y tocá **Crear**.
2. Completá:
   - **nombre**: el autor o el canal (por ejemplo, "Daniel Carreón").
   - **tipo**: **externo** si es de un tercero.
   - **url**: el link original.
   - **licencia**: lo que permite el autor (por ejemplo, "YouTube estándar: solo embebido, sin permiso de reutilización").
3. Guardá y volvé a la lección del paso 3 para elegir la fuente.

## 8. Verificar en el sitio

1. Abrí **https://you-school.vercel.app/estudiar**.
2. Recorré el camino hasta el tema donde cargaste la lección, o buscala en **https://you-school.vercel.app/aprender**.
3. Confirmá que:
   - aparece el título de la lección,
   - el video se reproduce,
   - el breadcrumb (la ruta arriba) muestra el país, el año, la materia, la unidad y el tema.

Si algo no aparece, revisá que la lección esté en **publicado**, que el bloque de video tenga la referencia bien escrita y que la ubicación esté en **publicado**.
