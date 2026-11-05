# Plan para tener todo el colegio subido

Fecha: 2026-11-05. Estado tomado de `docs/cobertura.md` (regenerado hoy con `database/reporte-cobertura.js`, solo lectura).

## Dónde estamos

- **38 lecciones publicadas** y **34 en borrador**, en total.
- **Primaria (1.º a 6.º grado):** 45 de 48 casilleros materia-grado sin contenido publicado. Casi todo está en borrador o vacío.
- **Secundaria (1.er a 5.to año):** solo **Biología** tiene contenido. Faltan las demás materias de cada año.
- **Estructura:** los niveles, años, grados y materias ya existen en Directus. Por eso casi todo el trabajo que falta es de contenido, no de estructura.
- **Ojo:** existe un "7mo grado" en Primaria, sin contenido. Hay que decidir si se queda o se borra (es decisión tuya).

## Qué significa "todo subido"

Son muchas lecciones. Un orden realista, de a una materia por vez, cerrando cada una antes de pasar a la siguiente:

1. **Matemática, Primaria 1.º a 6.º.** Es la materia donde más se entiende el "ejercicio práctico, sencillo y lógico" (contar, sumar, completar, armar). Va primero.
2. **Lengua, Primaria 1.º a 6.º.**
3. **Ciencias Naturales y Ciencias Sociales, Primaria.**
4. **Matemática, Secundaria 1.er a 5.to año** (hoy no hay nada).
5. **Lengua y demás materias de Secundaria.**
6. **Educación Artística, Física, Tecnológica y Formación Ética**, con criterio para cada una.

Por cada materia y grado propongo: **5 lecciones** (una por tema), con 3 a 6 ejercicios cada una. Todo en **borrador** hasta que vos lo revises en el navegador.

## Qué sale de Educ.ar y qué es propio

- **Videos de Educ.ar:** siguen el camino del importador (`database/import-educar.js`). Siempre con simulacro primero y con atribución en la lección.
- **Ejercicios propios:** se cargan como bloques (`docs/bloques.md`) por API de Directus, con respaldo antes.

## Decisiones que te toca tomar

1. ¿Arrancamos por Matemática de 1.º a 6.º, con 5 lecciones por grado, en borrador?
2. ¿El "7mo grado" de Primaria se queda o se borra?
3. ¿Los ejercicios de la primera tanda son solo propios, o también buscamos videos de Educ.ar?

## Cómo se va a controlar

- Un reporte de cobertura después de cada materia: `node database/reporte-cobertura.js`.
- Un respaldo JSON antes de cada carga, en `database/backups/`.
- Nada se da por hecho hasta que vos lo veas en `/preview/leccion/...`.
