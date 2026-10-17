# Bloques de contenido de las lecciones propias

Estado: formato acordado; el visor todavía no lo lee. Campos nuevos de la colección `lecciones` (ver "Campos de la lección"): pendientes de aplicar hasta que Franco confirme el cambio de esquema.

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
{ "tipo": "imagen", "url": "manzana", "descripcion": "Una manzana roja con una hoja verde." }
```

- `url`: en realidad es la **clave de ilustración** (por ejemplo `manzana`). Hoy se muestra su emoji. Más adelante, un SVG propio.
- `descripcion`: **obligatoria** (accesibilidad). Si la clave no existe, se muestra solo esta descripción.

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
