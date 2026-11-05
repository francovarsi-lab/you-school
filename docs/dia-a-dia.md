# Un día de clase, una lección

Fecha: 2026-11-05. Idea: cada día de clase del año tiene una lección directa, comprimida y lógica, para cada materia. No videos de charla de 10 minutos.

## Qué tiene que cumplir cada lección

- **Un concepto.** Se dice en 2 o 3 frases, en un título que lo nombra.
- **Un ejemplo resuelto.** Antes de los ejercicios, el alumno ve cómo se hace.
- **De 4 a 6 ejercicios** que hacen pensar: problemas, comparaciones, "¿quién tiene razón?", completar, ordenar.
- **Corta.** Se completa en unos 10 a 15 minutos.
- **Entendible sola.** No depende de haber visto otro video.

## Cuánto es

Ejemplo de tu cuenta: 1.er grado con 10 materias y 240 días de clase.

- 10 materias × 240 días = **2 400 lecciones por grado**.
- Primaria 1.º a 6.º = 6 grados × 2 400 = **14 400 lecciones**, más Secundaria.
- Hoy hay 30 de Matemática de Primaria, y están como borrador.

Escribir 14 400 lecciones de calidad no entra en una sesión. Hay que ir por grado, por materia y por mes, con revisión.

## Decisiones que necesito de vos

1. **¿Cuántas materias tiene 1.er grado?** Hoy la base tiene 8 (Ciencias Naturales, Ciencias Sociales, Artística, Física, Tecnológica, Formación Ética, Lengua y Matemática). Tu ejemplo dice 10.
2. **¿Cuántos días de clase?** Tu ejemplo dice 240. Lo ideal es el calendario real de tu provincia o de tu escuela.
3. **¿Cómo se guarda el número de día?** Hay dos caminos:
   - **A. Sin cambiar el esquema:** usar el campo `orden` que ya existe en la ubicación de cada lección. Es rápido, pero "día 37" queda escondido.
   - **B. Con un campo nuevo `dia` en las lecciones.** Es lo correcto para mostrar "Día 37 de 240". Requiere un cambio de esquema, y por las reglas del proyecto necesito tu autorización explícita, con respaldo antes.
4. **¿Por dónde empezamos?** Propongo 1.er grado, Matemática, días 1 a 40 (el primer mes), y lo revisás antes de seguir.

## Orden propuesto de trabajo

1. Confirmar materias, días y el camino A o B.
2. Escribir un mes completo de una materia (unas 8 a 10 lecciones) y revisarlo en el localhost.
3. Si te gusta el formato, seguir con el resto de las materias de 1.er grado, un mes por vez.
4. Recién después, pasar a 2.º grado.

## Lo que no hay que hacer

- No publicar nada sin revisión tuya.
- No inventar fechas oficiales ni decir que una lección "es la de tal día de tal provincia" si no lo verificamos.
- No cambiar el esquema sin tu autorización.
