# Cómo importar videos de Educ.ar

Este importador suma lecciones de video de Educ.ar a partir de una lista de links. Solo entra contenido con licencia abierta. Nunca copia ni descarga los videos: guarda solo la referencia al archivo de Educ.ar.

## 1. Armar la lista

Abrí el archivo `database/importar/lista.txt` y agregá una línea por lección con este formato:

```
URL_ficha | Año | Materia | Unidad | Tema | Conocimiento
```

Ejemplo:

```
https://www.educ.ar/recursos/155961/la-pizza-y-sus-porciones | 4to grado | Matemática | Números | Fracciones | Fracciones
```

- La URL tiene que ser una ficha de **www.educ.ar** (la dirección empieza con `https://www.educ.ar/recursos/`).
- Año y Materia tienen que existir en Directus. Si no, la línea se rechaza.
- Unidad, Tema y Conocimiento: si no existen, el importador los crea.
- Las líneas que empiezan con `#` y las vacías se ignoran.

## 2. Correr el simulacro

El simulacro no escribe nada. Solo muestra qué haría con cada línea.

1. Abrí una terminal en la carpeta `you-school`.
2. Ejecutá:

```bash
node database/import-educar.js
```

3. Leé la tabla que aparece. Cada línea tiene un resultado:
   - **creada (simulacro)**: se importaría.
   - **saltada**: ya existe una lección con esa ficha o ese slug.
   - **rechazada**: no cumple algo (licencia, formato, año, materia o video). El motivo aparece al lado.
   - **excluida**: el título o la descripción dice "recorte" o "fragmento". No se importa; aparece en una lista aparte al final.
   - **a revisar**: la audiencia de la ficha no incluye "Estudiantes" ni "General" (solo "Docentes", o no indica audiencia). No se importa hasta que alguien lo decida; aparece en una lista aparte.
   - **otro formato**: la ficha no es un video (Interactivo, Juego, Libro electrónico, etc.). No se importa; aparece en una lista aparte.

Además:
- **a revisar (formato TV):** el título o la descripción habla de conductores, programa, entrevista, charla, capítulo, episodio o "conversan". Una lección es una clase de teoría.
- **a revisar (largo):** el video dura más de 10 minutos. La duración se lee del encabezado del MP4, sin descargarlo.
- **excluida (programa):** el video dura más de 20 minutos.

Solo se importan fichas de **video**, con audiencia **Estudiantes** o **General**, y sin "recorte" ni "fragmento".

Van también a **a revisar** las fichas que:
- tienen el aviso "Archivo educ.ar" (recurso desactualizado; el aviso también aparece como etiqueta),
- recomiendan mirar solo un tramo del video ("mirá especialmente desde 5 min 43 s…").

### Fuente y atribución

- La fuente de toda lección importada es **Educ.ar**.
- Si el autor es una persona (no el Ministerio), la atribución va en la descripción de la lección: "Autor: Nombre, vía Educ.ar."
- El modelo de datos no tiene un campo de atribución. Por eso queda en la descripción, que **no se muestra en la página pública**. Para verla en el sitio hace falta un cambio de esquema o de la página, y eso necesita tu autorización.

### Ajustes por ficha

`database/importar/ajustes.json` fija el título y la descripción de una ficha. La clave es el número de la ficha de Educ.ar:

```json
{
  "125633": {
    "titulo": "Fracciones: suma y resta",
    "descripcion": "Video para repasar las fracciones, con la suma y la resta."
  }
}
```

- Si hay `fuente` (por ejemplo, "Khan Academy"), la lección usa esa fuente en vez de Educ.ar. Si la fuente ya existe con otra licencia que la ficha, la línea se rechaza: no se mezclan licencias. `fuenteUrl` es opcional y fija la dirección de una fuente nueva.
- Si hay `descripcion`, reemplaza la de Educ.ar. La descripción final queda así: esa frase, y al final "Autor: Nombre, vía Educ.ar.".
- Si no hay `descripcion` y la de Educ.ar menciona juegos o actividades ("juego", "poné a prueba", "actividades interactivas"), el simulacro muestra una **ADVERTENCIA**. Conviene agregar una descripción aprobada antes de aplicar.
- `"aprobada": true` salta los controles de formato TV y de duración. Se usa para fichas que ya se revisaron a mano (las seis publicadas el 15 de octubre). Los demás controles siguen.
- Las cinco lecciones del lote de Matemática ya tienen su descripción aprobada en este archivo, para que una reimportación no la pise.
