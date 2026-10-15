# Importar un lote manual (contenido que no viene de Educ.ar)

Para videos de YouTube que no vienen de Educ.ar, por ejemplo Khan Academy. Lo hace `database/importar-lote-externo.js`. El de Educ.ar es otro script: `database/import-educar.js`.

## 1. Armar el archivo

Creá `database/importar/lote-externo.json` con una lista de objetos:

```json
[
  {
    "url": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
    "titulo": "Suma de fracciones con igual denominador",
    "descripcion": "Video para repasar la suma de fracciones con igual denominador.",
    "fuente": "Khan Academy",
    "grado": "5to grado",
    "materia": "Matemática",
    "unidad": "Números y operaciones",
    "tema": "Fracciones",
    "conocimiento": "Suma de fracciones",
    "duracion_min": 4
  }
]
```

- Todos los campos son obligatorios, menos `duracion_min`.
- `materia` se agregó a la lista original: hace falta para ubicar la unidad, porque cada unidad pertenece a una materia.
- `duracion_min` es la duración del video en minutos. YouTube no la da por la vía que usamos, así que hay que cargarla a mano. Sin ese dato, la entrada queda en **a revisar**.
- `fuente` tiene que existir en Directus. Hoy están "Khan Academy" y "Educ.ar".

Hay un archivo de ejemplo con dos entradas inventadas: `database/importar/lote-externo.ejemplo.json`.

## 2. Simulacro (por defecto, no escribe nada)

```bash
node database/importar-lote-externo.js --archivo=database/importar/lote-externo.ejemplo.json
```

Cada entrada tiene un resultado y un motivo:

- **creada (simulacro):** se importaría. El motivo muestra el canal, la fuente y su licencia, la duración, y qué se crearía.
- **rechazada:** falta un campo, la URL no es de YouTube, el video no existe (YouTube no lo devuelve), la fuente o el grado no existen.
- **a revisar:** formato TV (conductores, programa, entrevista, charla, capítulo, episodio, conversan); duración de más de 10 minutos; sin duración verificada; o el canal no es de Khan Academy cuando la fuente es Khan.
- **excluida:** duración de más de 20 minutos.
- **saltada:** ya existe una lección con ese video o con ese slug.

Verifica cada video con el endpoint oEmbed de YouTube, que confirma que existe y devuelve el canal.

## 3. Aplicar (solo con confirmación)

```bash
node database/importar-lote-externo.js --archivo=database/importar/lote-externo.json --aplicar
```

- Antes de escribir, hace un respaldo de Directus en `database/backups/` (ignorado por git).
- Todas las lecciones quedan en **borrador**. Se publican a mano en Directus, como las demás.
- Crea, si faltan, la unidad, el tema y el conocimiento.

## Reglas que aplica

- Solo videos de YouTube verificados con oEmbed.
- Para Khan Academy: el canal tiene que ser el de Khan Academy (no videos de socios).
- Formato TV y duración: los mismos filtros que Educ.ar.
- No publica nada.
