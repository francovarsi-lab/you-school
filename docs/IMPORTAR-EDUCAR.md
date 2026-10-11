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

## 3. Aplicar

Cuando el simulacro esté bien, ejecutá:

```bash
node database/import-educar.js --aplicar
```

Eso crea las lecciones en Directus. Todas quedan en **borrador**, así que no aparecen en el sitio público.

## 4. Revisar y publicar en Directus

1. Abrí **http://localhost:8055** (Directus tiene que estar corriendo).
2. Entrá a **lecciones**.
3. Revisá título, descripción, conocimiento y ubicación de cada lección nueva.
4. Para publicar varias a la vez: marcá las casillas de las lecciones, elegí **cambiar estado** y poné **publicado**.
5. Confirmá en **https://you-school.vercel.app/estudiar** que aparecen en el tema correcto.

## 5. Publicar con el comando

Hay un comando para publicar lecciones por su número de ficha (el ID que aparece en el link de Educ.ar, por ejemplo `155979`). Antes de publicar, revisa cada lección: fuente, licencia, ubicación, conocimiento y que el video responda. Si algo falla, no publica esa lección y dice el motivo.

Simulacro (no escribe nada):

```bash
node database/publicar-lecciones.js --ids=155979,155971
```

Publicar de verdad:

```bash
node database/publicar-lecciones.js --ids=155979,155971 --aplicar
```

Volver a borrador (para ocultar lecciones):

```bash
node database/publicar-lecciones.js --ids=155979 --revertir --aplicar
```

Solo cambian las lecciones indicadas. El resto no se toca.

## Riesgo

Los videos viven en los servidores de Educ.ar. Si Educ.ar cambia la dirección de un video, esa lección deja de reproducirse. El sitio no lo detecta solo: hay que revisar las lecciones de educ.ar de vez en cuando y, si un video no anda, corregir su referencia o despublicar la lección.
