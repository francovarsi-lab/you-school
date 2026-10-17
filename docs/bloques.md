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

### audio

```json
{ "tipo": "audio", "texto": "Las plantas fabrican su alimento con luz." }
```

- En esta etapa se lee con la voz del navegador (SpeechSynthesis, idioma es-AR). Es gratis.
- El texto siempre queda visible como respaldo.
- Más adelante puede ser un archivo de audio.

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
