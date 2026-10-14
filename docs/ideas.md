# Ideas

Ideas para el futuro. Ninguna está implementada.

## "Ir al colegio"

Además de navegar por materia y año, un modo que arma **días de clase**: lecciones de todas las materias de un grado, en secuencia lineal, para avanzar en automático como en la escuela.

- Se mantienen el buscador y la navegación libre por materia.
- **Notas de diseño:**
  - Un día es una relación ordenada de lecciones. Hace falta una tabla nueva, lo que requiere **cambio de esquema** con respaldo y autorización de Franco.
  - Empezar con días generados automáticamente desde el orden curricular, sin cargarlos a mano.
  - El progreso se guarda en el dispositivo, sin cuentas.
  - Piloto con **un grado completo**.
  - `/estudiar` pasaría a ofrecer dos caminos: "Ir al colegio" y "Elegir una materia".
- **Requisito previo:** tener contenido de varias materias en el mismo grado. Hoy no lo hay (ver [docs/cobertura.md](cobertura.md)).
