# Estilo visual de las ilustraciones (plan futuro)

Estado: solo plan. No se construyó nada. Hoy las claves usan emojis (`src/lib/ilustraciones.ts`).

Cuando se hagan SVG propios, cada clave de ilustración apunta a un archivo SVG. Las lecciones no cambian.

## Reglas

- **Formas planas y simples.** Sin degradados, sombras ni detalles finos.
- **Paleta corta y fija, de alto contraste.** Un solo set de colores para todas las ilustraciones.
- **Nunca distinguir solo por color.** Cada objeto se reconoce también por forma.
- **Sin texto dentro del dibujo.** El texto va en la lección.
- **Menos de 2 KB cada SVG.**
- **viewBox cuadrado.**
- **Título y descripción** dentro del SVG (`<title>` y `<desc>`) para lectores de pantalla.
- **Un solo set coherente:** mismo trazo, mismo tamaño de referencia, mismo estilo de forma.

## Cómo se conecta

- Cada SVG tiene una clave (por ejemplo `manzana.svg` → clave `manzana`).
- `src/lib/ilustraciones.ts` apunta la clave al archivo. Si el archivo no existe, se muestra el emoji y luego la descripción del bloque.
- Las lecciones solo guardan la clave.
