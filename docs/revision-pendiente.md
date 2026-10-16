# Revisión pendiente

Fecha: 2026-10-13. Lista de lecciones que necesitan una decisión tuya. Ninguna lección se cambió para armar este documento.

## 1. Descripción con "fragmento" o "recorte"

La regla del importador excluye fichas con esas palabras. Estas seis ya están cargadas y todas están en **borrador**, así que no se ven en el sitio.

| Lección | id | Estado | Qué hay que decidir |
|---|---|---|---|
| Juego de roles | `31dfe2c6-497d-4afa-9a82-cdb3bb406f40` | borrador | La descripción dice "En este fragmento…". ¿Se corrige el texto, o se descarta la lección? |
| Visionado de imágenes | `448d7a65-b9d4-499e-92a4-6becad0258d5` | borrador | Dice "En el siguiente recorte…". ¿Se corrige el texto o se descarta? |
| Los fósiles | `52d46ff8-da9a-449a-8f7e-067d503a2b81` | borrador | Dice "En el siguiente recorte…". ¿Se corrige el texto o se descarta? |
| Estrafalario de Sandra Filippi | `53ad1a04-b3d7-45ad-88af-8a639340fba7` | borrador | Dice "Lectura de un fragmento". ¿Se corrige el texto o se descarta? |
| Retratos de familia | `5b9eb2a0-4948-459d-bc03-5511f2862134` | borrador | Dice "En el siguiente recorte…". ¿Se corrige el texto o se descarta? |
| "Choco encuentra una mamá" de Keiko Kasza | `db947f26-78e5-4c6b-aba9-b3cba5141503` | borrador | Dice "En el siguiente fragmento…". ¿Se corrige el texto o se descarta? |

## 2. Lecciones sin descripción

| Lección | id | Estado | Qué hay que decidir |
|---|---|---|---|
| Introducción a las fracciones | `2038f3b3-8834-4fef-8fed-c4a07edcb5e4` | borrador | Es un texto de prueba. ¿Se descarta o se completa? |
| TIPOS DE FRACCIONES Super fácil \| Para principiantes (video de YouTube) | `d398c798-ef23-4dbb-9378-44f83c7faa8c` | borrador | Es un video de YouTube, no de Educ.ar. ¿Se mantiene? Si se mantiene, falta una descripción y una fuente que lo justifique. |

## 3. Fichas de Educ.ar no importadas

| Ficha | Motivo | Qué falta para importarla |
|---|---|---|
| https://www.educ.ar/recursos/152995/la-clase-del-d%C3%ADa:-la-proporcionalidad-directa (La clase del día: La proporcionalidad directa) | **A revisar**: tiene el aviso "Archivo educ.ar" (recurso desactualizado) y recomienda mirar solo un tramo del video (desde 5 min 43 s hasta 12 min 36 s). Además, el importador no encuentra un MP4 en la ficha. | Decidir si el contenido sigue vigente y si el tramo alcanza. Después, revisar el MP4 y agregar la línea a una lista. |
| https://www.educ.ar/recursos/50794/proporcionalidad (Proporcionalidad, Canal Encuentro) | **Secundaria**: el año "1er año" no existía en Directus. (Nivel Secundaria y años 1.º a 5.º creados el 16 de octubre.) | Falta la materia Matemática en cada año de Secundaria. Se crea solo cuando caiga una lección de Matemática. Después, la unidad, el tema y el conocimiento. |

## 4. Decisiones nuevas (13 de octubre)

| Tema | Qué pasa | Qué hay que decidir |
|---|---|---|
| **Cuadriláteros** (ficha 127249, Horizontes Matemática) | Es un video distinto de "Mirá: cuadriláteros" (125632): otro archivo, otro autor (Educ.ar) y sin juegos. El contenido se superpone: los dos enseñan tipos de cuadriláteros. El simulacro la marca como "creada". | ¿Se importa como segunda lección del mismo tema, o se deja fuera para no repetir el concepto? |
| **Los ángulos y su medición** (cargada, borrador) | El autor de la ficha es Educ.ar, no una persona, así que la descripción no lleva la línea "Autor: …". | ¿Se agrega igual la atribución a Educ.ar, o se deja así? |
| **Fuentes candidatas** | Ver [docs/fuentes-candidatas.md](fuentes-candidatas.md). Pakapaka y Canal Encuentro quedaron sin licencia verificada. | ¿Se buscan más fuentes, o se contacta a Educ.ar sobre el scraping antes de automatizar el descubrimiento? |
| **Vista previa** | El servidor de desarrollo que ya estaba corriendo en el puerto 3000 no tiene las credenciales de Directus, así que `/preview` muestra el mensaje de "faltan credenciales". | Agregar `DIRECTUS_EMAIL` y `DIRECTUS_PASSWORD` en `.env.local` y reiniciar ese servidor. |

## 5. Decisiones del 14 de octubre

- **Cuadriláteros (ficha 127249): descartada.** Duplica el contenido de "Mirá: cuadriláteros" (125632), ya cargada. No se importa.
- **Descubridor automático de fichas de Educ.ar: no se hace** hasta tener permiso explícito de Educ.ar. Sus términos mencionan restricciones de scraping que solo exceptúan el material con licencia abierta.

## 6. Auditoría de contenido (15 de octubre)

Detalle en [docs/auditoria-contenido.md](auditoria-contenido.md). Se publicaron seis lecciones que pasaron el filtro (duración hasta 10 min, sin señales de TV, audiencia Estudiantes o General, un conocimiento y una ubicación).

- **Publicada que no pasa, no se despublicó:** "Áreas y perímetros de cuerpos y figuras planas" dura 15.6 min. ¿Se recorta, se reemplaza o se deja?
- **Probables programas (borrador):** "La receta de mazamorra…" y "Sentidos de la multiplicación…" dicen "conductores". ¿Se revisan a mano?
- **Borradores largos (10 a 15 min):** las que dan más de 10 min quedan a la espera de decisión.
- **Sin dato:** "TIPOS DE FRACCIONES" (YouTube) y "Introducción a las fracciones" (sin video).
- **Los ángulos y su medición** pasó con 9.95 min y su descripción aprobada. Su ficha original dice "capítulo", así que si se reimporta sin ajuste, el importador la marcaría como formato TV.

## 7. Áreas y perímetros pasó a borrador (15 de octubre)

- **Lección:** "Áreas y perímetros de cuerpos y figuras planas" (`18a7871e-998f-4c89-bef0-06d30c83d0f6`).
- **Motivo:** es una serie de TV de 15,6 min, más de los 10 min permitidos. Pasó a borrador por API de Directus, con respaldo previo en `database/backups/`.
- **Qué falta decidir:** si se recorta a una clase corta, si se reemplaza por otro video, o si se deja en borrador.

## 8. Claves en un minuto - Biología, Secundaria (16 de octubre)

Lote de la serie 150959 (Educ.ar, CC BY-NC-SA). Lista en `database/importar/lista-claves-biologia.txt`. Respaldo previo: `database/backups/pre-lote-claves-biologia-2026-10-16.json`.

- **Estructura creada en Directus:** nivel Secundaria en NAP Argentina y años 1er a 5to año, con Biología en cada uno (las lecciones caen en los cinco).
- **Publicadas (28):** fichas de video para Estudiantes, todas de 0,8 a 2,0 min. Pasan la auditoría.
- **En borrador (1):** 40678 "El cuerpo como construcción histórica". Pasa los filtros, pero su descripción habla de perspectivas políticas, económicas y culturales sobre el cuerpo, no de un concepto de Biología. Decidir si se reescribe, se cambia de materia o se descarta.
- **Excluidas (3):**
  - 40770 "El ciclo del agua": audiencia solo Docentes. Además, su slug ya lo usa otra lección.
  - 40659 "La mitosis": error 500 en Educ.ar.
  - 40763 "Respuesta inflamatoria": error 500 en Educ.ar.
- **Títulos cambiados con ajuste** (`database/importar/ajustes.json`): 40717 "Cambios físicos y químicos al cocinar los alimentos" y 40780 "Florentino Ameghino y la evolución humana". El resto usa el título de la ficha, porque ya dice el concepto.
- **Años propuestos (decisión de Franco):** 1er año: transporte celular, biomoléculas, alimentos y biomateriales. 2do: fotosíntesis, agua en las plantas y ciclo del carbono. 3ro: ADN y expresión génica, división celular, reproducción humana y clonación. 4to: biodiversidad y evolución. 5to: hormonas, sistema nervioso, sangre y el cuerpo.
- **Atribución:** en la descripción, "Autor: ..., vía Educ.ar", porque el autor es una persona (ver regla de atribución en `docs/IMPORTAR-EDUCAR.md`).

## 9. Auditoría: docentes nunca pasan (16 de octubre)

- `database/auditoria-contenido.js` ahora marca "no pasa: docentes" a toda lección con audiencia solo "Docentes". "Docentes + Estudiantes" sí puede pasar.
- Antes, 17 lecciones de solo docentes figuraban como "pasa". Se corrigió el veredicto, no el contenido. Ninguna se despublicó: las publicadas ya eran para Estudiantes.
- Después de la corrida, la auditoría dice: 71 lecciones, 39 pasan, 1 larga, 2 sin dato, 29 de docentes.
