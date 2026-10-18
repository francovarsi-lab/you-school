# Bloques de contenido de las lecciones propias

Estado: formato acordado; el visor todavía no lo lee. Los campos `bloques`, `tipo_de_contenido` y `autor` de `lecciones` ya están creados (16 de octubre, respaldo en database/backups/pre-bloques-2026-10-17.json).

Una lección propia es una lista ordenada de bloques. Cada bloque es un objeto con `tipo`. El visor muestra los bloques en el orden de la lista.

## Reglas generales

- **Cada bloque puede sumar campos opcionales sin romper los anteriores.** El visor ignora campos que no conoce.
- Los textos se muestran siempre. Ningún bloque depende solo de la voz, de una imagen ni de un color.
- Las ilustraciones se guardan por clave, no por emoji ni URL (ver `src/lib/ilustraciones.ts`).
- Sin rachas, puntos ni vidas. En los ejercicios hay devolución inmediata: se dice si la respuesta está bien y se muestra la explicación.

## Tipos de bloque

### texto

```json
{ "tipo": "texto", "contenido": "Las plantas fabrican su alimento con luz, agua y aire." }
```

### imagen

```json
{ "tipo": "imagen", "url": "manzana", "cantidad": 3, "descripcion": "Tres manzanas" }
```

- `url`: en realidad es la **clave de ilustración** (por ejemplo `manzana`). Hoy se muestra su emoji. Más adelante, un SVG propio.
- `cantidad` (opcional, por defecto 1): cuántas veces se dibuja la ilustración. Entre 1 y 20.
- `descripcion`: **obligatoria** (accesibilidad). Se lee como nombre de la imagen. Si la clave no existe, se muestra solo esta descripción.
- Es interactivo: cada objeto se toca, hace un pequeño salto, dice su número en voz y suma al contador "Contados: 2 de 3". Con "prefers-reduced-motion" activo, no hay salto.

### audio

```json
{ "tipo": "audio", "texto": "Las plantas fabrican su alimento con luz." }
```

- Si el bloque tiene `audio` (clave del archivo pregrabado, por ejemplo `"audio": "frase-despues-del-6"`), el botón "Escuchar" suena `public/audio/frase-despues-del-6.mp3`. Si no hay archivo, usa la voz del navegador (SpeechSynthesis, es-AR; si no hay voz en español, el botón no aparece).
- El texto siempre queda visible como respaldo.
- Más adelante puede ser un archivo de audio.

### numero

```json
{ "tipo": "numero", "valor": 7, "objeto": "estrella" }
```

- `valor`: entero de 0 a 20. Se muestra grande.
- Al tocarlo suena su nombre (`public/audio/numero-7.mp3`, "siete") y aparecen 7 objetos, que también se tocan de a uno (salto, número en voz, contador).
- `objeto` (opcional, por defecto `estrella`): clave de ilustración de los objetos.
- Con `valor` 0, aparece "No hay objetos."

### ejercicio_opciones

```json
{
  "tipo": "ejercicio_opciones",
  "pregunta": "¿Qué necesita una planta para fabricar su alimento?",
  "opciones": ["Luz, agua y aire", "Solo tierra", "Azúcar"],
  "correcta": 0,
  "explicacion": "Con luz, agua y aire, la planta produce su alimento."
}
```

- `correcta`: índice (desde 0) de la opción correcta en `opciones`.
- `audio` (opcional): clave del archivo pregrabado de la explicación. Aparece el botón "Escuchar" después del acierto.

### ejercicio_contar

```json
{
  "tipo": "ejercicio_contar",
  "pregunta": "¿Cuántas manzanas hay?",
  "objeto": "manzana",
  "cantidad": 4
}
```

- `objeto`: clave de ilustración que se repite en pantalla.
- `cantidad`: número correcto.

### ejercicio_ordenar

```json
{
  "tipo": "ejercicio_ordenar",
  "consigna": "Ordená los pasos del ciclo del agua.",
  "elementos": ["Evaporación", "Condensación", "Precipitación"]
}
```

- `elementos`: van **en el orden correcto**. El visor los mezcla al mostrarlos.

## Cómo se muestran (visor)

- Una pantalla por bloque, con "Atrás" y "Siguiente" y el indicador "3 de 8". Al final, una pantalla de cierre con fuente, autor y licencia, y el enlace a la clase siguiente si existe.
- Las flechas del teclado también sirven para avanzar y retroceder.
- Ningún avance se bloquea por fallar. Ni puntos, ni rachas, ni vidas, ni animaciones de premio.
- `ejercicio_contar`: el alumno toca los objetos de a uno. Al terminar, aparece "¿Cuántos hay?" con tres opciones: la correcta y dos cercanas.
- `ejercicio_ordenar`: los elementos aparecen mezclados. El alumno los toca en orden. Un toque incorrecto da "Probá de nuevo" y no penaliza.
- `audio` y `texto`: el botón "Escuchar" aparece solo si el dispositivo tiene una voz en español. El texto siempre queda visible.
- Un bloque con datos incompletos o desconocidos no rompe la lección: se muestra un aviso en su lugar.
- Todavía no se guarda progreso. El visor tiene un único punto para enchufarlo después (`alResponder` en `src/components/VisorBloques.tsx`).

## Audio y sonidos

- **Archivos pregrabados** en `public/audio/`, con nombre por clave: `numero-0.mp3` a `numero-20.mp3` (los nombres de los números), y las frases con su clave (`frase-....mp3`). Se generan una sola vez en local con `database/generar-audio.py` (Piper, voz es_AR).
- Al abrir una lección se precargan los archivos que usa. Si falta un archivo, se usa la voz del navegador como respaldo.
- **Sonidos de acierto y error:** tonos generados en el navegador (sin archivos). Suenan en las opciones, en el conteo y en el orden.
- **Silenciar:** el botón "Silenciar sonidos" (visible arriba de cada pantalla) apaga todos los sonidos y los audios. Vuelve a activarse con "Activar sonidos".
- Cada toque de un objeto o de un número dice el número. En "ejercicio_ordenar", un acierto dice el número y un error suena el tono de error.

## Licencia de los audios

- Los audios de `public/audio/` están bajo **CC BY-SA 4.0**. Son la voz `daniela` (es_AR) del proyecto Piper (rhasspy), entrenada por larcanio a partir del dataset OpenSLR 61. Origen: https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_AR/daniela/high
- La atribución sale de `src/lib/atribucion.ts`: en `/creditos` (sección Audios) y en el cierre de cada lección con audio.
- Las lecciones propias siguen en CC BY-NC-SA 4.0. Cada audio conserva su propia licencia.
- Los audios se recortan de silencio al principio y al final (quedan 0,05 s de margen). Si se regeneran, repetir el recorte.

## Campos de la lección

| Campo | Tipo | Obligatorio | Por defecto | Qué es |
|---|---|---|---|---|
| `tipo_de_contenido` | desplegable: `video`, `bloques` | sí | `video` | Qué tipo de lección es. Las 71 existentes quedan en `video`. |
| `bloques` | JSON (lista de bloques) | no | vacío | Contenido de las lecciones propias. |
| `autor` | texto | no | vacío | Autor de la lección, si corresponde. |

### Fuente, autor y licencia

- **Lecciones de Educ.ar o Khan Academy:** la fuente es esa entidad y la licencia es la de la fuente (ver `fuentes`). El campo `autor` queda vacío salvo que sea una persona (ver `docs/IMPORTAR-EDUCAR.md`).
- **Lecciones propias:** fuente = "YOU SCHOOL", licencia = "CC BY-NC-SA 4.0". El `autor` se completa si corresponde.
- El visor y la página `/creditos` muestran fuente, autor y licencia en todas las lecciones, también en las propias.
