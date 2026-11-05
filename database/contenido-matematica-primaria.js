// Contenido propio de Matemática, Primaria 1.º a 6.º: 5 lecciones por grado, en borrador.
// Cada lección tiene una explicación corta para el alumno y 5 o 6 ejercicios que hacen pensar
// (problemas, comparaciones, "¿quién tiene razón?", completar y ordenar).
// Lo carga database/cargar-matematica-primaria.js por la API de Directus.
// Cada respuesta correcta se verificó al escribirla. Los textos aún no los revisó un docente.

// Arma un ejercicio de opciones: la correcta queda en la posición `pos` entre las opciones.
function ej(pregunta, correcta, distractores, explicacion, pos = 0) {
  const opciones = [...distractores];
  opciones.splice(pos, 0, correcta);
  return { tipo: 'ejercicio_opciones', pregunta, opciones, correcta: pos, explicacion };
}
const texto = (contenido) => ({ tipo: 'texto', contenido });
const ordenar = (consigna, elementos) => ({ tipo: 'ejercicio_ordenar', consigna, elementos });

const LECCIONES = [
  // ---------- 1.er grado ----------
  {
    grado: '1er grado', unidad: 'Números y conteo', tema: 'Números hasta 20',
    slug: 'mate-1-antes-y-despues', titulo: 'Antes y después',
    descripcion: 'El número que viene después y el que va antes.',
    bloques: [
      texto('Los números van en fila, uno detrás del otro. El que viene después de otro es su siguiente (14 → 15). El que va antes es su anterior (15 → 14). Y si un número está entre otros dos, es el que va en el medio.'),
      ej('Ana está contando y se olvidó el número que sigue al 17. ¿Cuál es?', '18', ['16', '17', '71'], 'Después del 17 viene el 18.', 0),
      ej('¿Qué número va justo antes del 13?', '12', ['14', '31', '11'], 'Antes del 13 va el 12.', 2),
      ej('Entre el 8 y el 10 hay un número. ¿Cuál es?', '9', ['7', '11', '18'], 'El 9 está justo en el medio de 8 y 10.', 1),
      ej('Empezás en el 6 y contás 3 números para adelante. ¿En qué número caés?', '9', ['3', '8', '10'], '6, 7, 8, 9: caés en el 9.', 0),
      ej('El anterior de un número es el 19. ¿Cuál es ese número?', '20', ['18', '19', '10'], 'Si el 19 va antes, el número es el 20.', 3),
      texto('Truco: para el siguiente, sumá 1. Para el anterior, restá 1.'),
    ],
  },
  {
    grado: '1er grado', unidad: 'Números y conteo', tema: 'Números hasta 20',
    slug: 'mate-1-ordenar-hasta-20', titulo: 'Ordenar números hasta 20',
    descripcion: 'Ordenamos los números de menor a mayor.',
    bloques: [
      texto('Un número es más grande que otro si aparece después en la fila de números. El 15 es mayor que el 9 porque viene después. Para ordenar, buscá primero el más chico.'),
      ordenar('Ordená los vagones del tren de menor a mayor.', ['7', '9', '12', '15']),
      ej('Tenés 14 figuritas y tu amigo tiene 17. ¿Quién tiene menos?', 'Vos', ['Tu amigo', 'Tienen lo mismo', 'No se puede saber'], '14 es menos que 17, así que vos tenés menos.', 0),
      ej('¿Qué número está más cerca del 20: 13 o 18?', '18', ['13', 'Están a la misma distancia', 'No se puede saber'], '18 está a 2 del 20. El 13 está a 7.', 0),
      ej('¿Cuántos números hay entre el 5 y el 9 (sin contar el 5 y el 9)?', '3', ['4', '2', '5'], 'Son el 6, el 7 y el 8: tres números.', 1),
      ordenar('Ordená de mayor a menor.', ['20', '17', '14', '10']),
      ej('¿Cuál de estas frases es verdadera?', '18 es más grande que 12', ['12 es más grande que 18', '18 y 12 son iguales', 'Ninguna es verdadera'], '18 viene después del 12, así que es más grande.', 0),
    ],
  },
  {
    grado: '1er grado', unidad: 'Números y conteo', tema: 'Números hasta 20',
    slug: 'mate-1-mas-menos-igual', titulo: 'Más, menos o igual',
    descripcion: 'Comparamos cantidades: cuál tiene más, cuál tiene menos o si son iguales.',
    bloques: [
      texto('Para comparar dos grupos, contá cada uno. El que tiene más objetos tiene más. Si tienen la misma cantidad, son iguales. Lo que importa es cuántos son, no qué tan juntos están.'),
      ej('Hay 5 perros y 5 gatos. ¿Qué pasa?', 'Son iguales', ['Hay más perros', 'Hay más gatos', 'No se puede saber'], 'Cinco y cinco son iguales.', 2),
      ej('Tenés 9 bolitas y tu hermana tiene 6. ¿Quién tiene más?', 'Vos', ['Tu hermana', 'Son iguales', 'No se puede saber'], 'Nueve es más que seis.', 0),
      ej('En el grupo A hay 4 estrellas separadas. En el grupo B hay 3 estrellas apretadas. ¿Cuál tiene más?', 'El grupo A', ['El grupo B', 'Son iguales', 'Depende de cómo estén'], 'Cuatro es más que tres. Lo apretado o separado no cambia la cantidad.', 0),
      ej('Tenés 6 figuritas y querés tener tantas como tu amigo, que tiene 9. ¿Cuántas te faltan?', '3', ['15', '4', '6'], '9 menos 6 es 3.', 1),
      ej('Juli tiene más caramelos que Pedro. Pedro tiene más que Lu. ¿Quién tiene menos?', 'Lu', ['Juli', 'Pedro', 'Los tres tienen lo mismo'], 'Lu tiene menos que Pedro, y Pedro menos que Juli.', 0),
    ],
  },
  {
    grado: '1er grado', unidad: 'Números y conteo', tema: 'Restas y patrones',
    slug: 'mate-1-quitar-para-restar', titulo: 'Quitar para restar',
    descripcion: 'Restar es quitar: si te sacan algo, te quedan menos.',
    bloques: [
      texto('Restar es quitar. Si tenías algo y te sacan una parte, te queda lo que sobra. Ejemplo: tenés 8 caramelos, comés 3 y te quedan 5 (8 − 3 = 5).'),
      ej('Tenés 9 caramelos y comés 4. ¿Cuántos quedan?', '5', ['4', '6', '13'], '9 menos 4 es 5.', 0),
      ej('Había 7 pájaros en el árbol y se fueron 2. ¿Cuántos quedan?', '5', ['9', '2', '6'], '7 menos 2 es 5.', 2),
      ej('Tenés 6 figuritas y le das 2 a tu amigo. ¿Cuántas te quedan?', '4', ['8', '2', '6'], 'Quitás 2 de 6: quedan 4.', 0),
      ej('Hay 10 manzanas en el árbol y se caen 3. ¿Cuántas quedan en el árbol?', '7', ['13', '3', '10'], '10 menos 3 es 7.', 1),
      ej('Mirá: 8 − 5 = 3. ¿Cómo lo comprobás?', '3 + 5 = 8', ['8 + 5 = 3', '5 − 3 = 8', '3 − 5 = 8'], 'Si sumás lo que quedó con lo que sacaste, vuelve al número inicial: 3 + 5 = 8.', 2),
      texto('Truco: si no sabés cuánto es, contá hacia atrás desde el número grande.'),
    ],
  },
  {
    grado: '1er grado', unidad: 'Números y conteo', tema: 'Restas y patrones',
    slug: 'mate-1-patrones', titulo: 'Seguir un patrón',
    descripcion: 'Un patrón es algo que se repite con una regla.',
    bloques: [
      texto('Un patrón es una secuencia que sigue una regla. Puede ser de figuras (▲ ■ ▲ ■) o de números (2, 4, 6, 8). Para descubrirlo, preguntate: ¿qué se repite? ¿qué cambia cada vez?'),
      ej('▲ ■ ▲ ■ ▲ ¿Qué figura sigue?', '■', ['▲', '●', '★'], 'Alterna: triángulo, cuadrado, triángulo... Sigue el cuadrado.', 1),
      ej('2, 4, 6, 8, ¿qué número sigue?', '10', ['9', '12', '7'], 'Cada vez se suma 2: 8 más 2 es 10.', 0),
      ej('5, 10, 15, ¿qué número sigue?', '20', ['16', '25', '18'], 'Cada vez se suma 5: 15 más 5 es 20.', 2),
      ej('● ● ★ ● ● ★ ● ● ¿Qué sigue?', '★', ['●', '■', '▲'], 'El patrón es "dos círculos y una estrella", y se repite.', 0),
      ej('20, 18, 16, 14, ¿qué número sigue?', '12', ['10', '15', '13'], 'Ahora baja de a 2: 14 menos 2 es 12.', 1),
      texto('Un patrón bien hecho siempre tiene una regla. Si no la encontrás, mirá de a dos pasos.'),
    ],
  },

  // ---------- 2.do grado ----------
  {
    grado: '2do grado', unidad: 'Números y operaciones', tema: 'Números hasta 100',
    slug: 'mate-2-numeros-hasta-100', titulo: 'Decenas y unidades hasta 100',
    descripcion: 'Un número de dos cifras tiene decenas y unidades.',
    bloques: [
      texto('En 47 hay 4 decenas (40) y 7 unidades. Si tenés 4 paquetes de 10 caramelos y 7 sueltos, tenés 47 caramelos. Por eso el número se escribe con la decena a la izquierda.'),
      ej('Tenés 6 paquetes de 10 lápices y 3 sueltos. ¿Cuántos lápices son?', '63', ['36', '9', '603'], '6 decenas son 60, más 3 unidades: 63.', 1),
      ej('¿Cuántas decenas tiene el 80?', '8', ['80', '0', '18'], 'En el 80, el 8 indica las decenas.', 2),
      ej('¿Qué número forman 5 decenas y 2 unidades?', '52', ['25', '502', '7'], '50 más 2 es 52.', 1),
      ej('Un número tiene 9 unidades y 3 decenas. ¿Cuál es?', '39', ['93', '309', '12'], 'Tres decenas son 30; más 9 unidades, da 39.', 0),
      ej('¿Qué número está entre el 58 y el 60?', '59', ['57', '61', '60'], 'Entre 58 y 60 solo está el 59.', 0),
      ej('¿Qué significa tener 7 decenas y 0 unidades?', '70', ['7', '77', '700'], 'Siete decenas son setenta.', 0),
    ],
  },
  {
    grado: '2do grado', unidad: 'Números y operaciones', tema: 'Números hasta 100',
    slug: 'mate-2-ordenar-hasta-100', titulo: 'Ordenar números hasta 100',
    descripcion: 'Comparamos números de dos cifras y los ordenamos.',
    bloques: [
      texto('Para comparar números de dos cifras, mirá primero las decenas: el que tiene más decenas es mayor. Si tienen las mismas decenas, mirá las unidades.'),
      ordenar('Ordená los números de la colección de menor a mayor.', ['39', '45', '54', '61']),
      ej('¿Cuál es mayor: 70 o 65?', '70', ['65', '56', '7'], '70 tiene 7 decenas. El 65 tiene 6.', 0),
      ej('¿Cuál es mayor: 47 o 42?', '47', ['42', '52', '4'], 'Las dos tienen 4 decenas. Gana el que tiene más unidades: 7 contra 2.', 0),
      ej('¿Cuál de estos números es menor que 56?', '42', ['60', '58', '99'], '42 tiene 4 decenas. El 56 tiene 5.', 0),
      ej('¿Cuál es el anterior de 100?', '99', ['101', '90', '10'], 'Antes del 100 va el 99.', 1),
      texto('Si dudás, compará primero las decenas. Solo mirá las unidades si las decenas son iguales.'),
    ],
  },
  {
    grado: '2do grado', unidad: 'Números y operaciones', tema: 'Sumas y restas',
    slug: 'mate-2-sumas-sin-llevar', titulo: 'Sumar sin llevar',
    descripcion: 'Sumamos unidades con unidades y decenas con decenas.',
    bloques: [
      texto('Para sumar dos números de dos cifras, sumá primero las unidades y después las decenas. Ejemplo: 23 + 14. Unidades: 3 + 4 = 7. Decenas: 2 + 1 = 3. Resultado: 37.'),
      ej('23 + 14 = ?', '37', ['36', '38', '47'], '3 + 4 = 7 unidades. 2 + 1 = 3 decenas. Da 37.', 0),
      ej('41 + 35 = ?', '76', ['66', '86', '75'], '1 + 5 = 6 unidades. 4 + 3 = 7 decenas. Da 76.', 2),
      ej('52 + 16 = ?', '68', ['58', '78', '69'], '2 + 6 = 8 unidades. 5 + 1 = 6 decenas. Da 68.', 1),
      ej('Juan tiene 32 figuritas y compra 25 más. ¿Cuántas tiene ahora?', '57', ['47', '67', '52'], '2 + 5 = 7 unidades. 3 + 2 = 5 decenas. Da 57.', 2),
      ej('Un libro tiene 14 páginas el primer día y 13 el segundo. ¿Cuántas páginas leyó en total?', '27', ['1', '17', '28'], '14 + 13: 4 + 3 = 7 unidades y 1 + 1 = 2 decenas. Da 27.', 3),
      ej('¿Cuánto es 30 + 45?', '75', ['65', '85', '15'], '0 + 5 = 5 unidades. 3 + 4 = 7 decenas. Da 75.', 0),
    ],
  },
  {
    grado: '2do grado', unidad: 'Números y operaciones', tema: 'Sumas y restas',
    slug: 'mate-2-restas-sin-llevar', titulo: 'Restar sin llevar',
    descripcion: 'Restamos unidades con unidades y decenas con decenas.',
    bloques: [
      texto('Para restar, empezá por las unidades y después seguí con las decenas. Ejemplo: 86 − 32. Unidades: 6 − 2 = 4. Decenas: 8 − 3 = 5. Resultado: 54.'),
      ej('86 − 32 = ?', '54', ['52', '64', '58'], '6 − 2 = 4 unidades. 8 − 3 = 5 decenas. Da 54.', 1),
      ej('78 − 45 = ?', '33', ['43', '23', '34'], '8 − 5 = 3 unidades. 7 − 4 = 3 decenas. Da 33.', 0),
      ej('99 − 20 = ?', '79', ['69', '89', '78'], '9 − 0 = 9 unidades. 9 − 2 = 7 decenas. Da 79.', 2),
      ej('Tenés 58 pesos y gastás 30. ¿Cuánto te queda?', '28', ['88', '38', '18'], '8 − 0 = 8 unidades. 5 − 3 = 2 decenas. Da 28.', 1),
      ej('¿Qué suma sirve para comprobar que 64 − 21 = 43?', '43 + 21 = 64', ['21 + 43 = 34', '64 + 21 = 43', '43 + 64 = 21'], 'Si sumás lo que restaste con el resultado, vuelve a 64.', 0),
      ej('¿Cuánto es 40 − 10?', '30', ['50', '20', '40'], '4 decenas menos 1 decena son 3 decenas.', 2),
    ],
  },
  {
    grado: '2do grado', unidad: 'Números y operaciones', tema: 'Problemas',
    slug: 'mate-2-problemas-cuanto-falta', titulo: 'Problemas: ¿cuánto falta?',
    descripcion: 'Resolvemos problemas de juntar, quitar y completar.',
    bloques: [
      texto('En un problema, primero buscá qué te piden. Preguntate: ¿tengo que juntar, quitar o comparar? Si te falta algo para llegar a un número, restá lo que tenés del que querés.'),
      ej('Tenés 35 figuritas y querés 50. ¿Cuántas te faltan?', '15', ['85', '25', '5'], '50 menos 35 es 15.', 0),
      ej('En una bolsa hay 24 bolitas y agregás 13. ¿Cuántas hay?', '37', ['27', '47', '11'], '24 más 13 es 37.', 3),
      ej('Juan tiene 60 pesos y gasta 25. ¿Cuánto le queda?', '35', ['45', '85', '25'], '60 menos 25 es 35.', 1),
      ej('Un colectivo tiene 42 pasajeros. En la parada se bajan 15. ¿Cuántos quedan?', '27', ['57', '33', '17'], '42 menos 15 es 27.', 0),
      ej('Lu tiene 40 caramelos, le da 12 a su hermano y después compra 5. ¿Cuántos tiene?', '33', ['28', '45', '52'], '40 − 12 = 28. Después 28 + 5 = 33.', 2),
      ej('¿Qué cuenta resuelve "tengo 30 y quiero llegar a 50"?', '50 − 30', ['30 + 50', '30 − 50', '30 × 2'], 'Lo que falta es lo que querés menos lo que tenés.', 0),
    ],
  },

  // ---------- 3.er grado ----------
  {
    grado: '3er grado', unidad: 'Números y operaciones', tema: 'Multiplicación y división',
    slug: 'mate-3-multiplicar-como-sumas', titulo: 'Multiplicar es sumar muchas veces',
    descripcion: 'Una multiplicación es una suma repetida.',
    bloques: [
      texto('3 × 4 quiere decir 3 grupos de 4: es lo mismo que 4 + 4 + 4 = 12. Podés pensarlo como filas y columnas: 3 filas de 4 cuadraditos tienen 12 cuadraditos.'),
      ej('Hay 5 cajas con 3 manzanas cada una. ¿Cuántas manzanas hay?', '15', ['8', '53', '10'], '3 + 3 + 3 + 3 + 3 = 15.', 2),
      ej('¿Qué suma es igual a 4 × 3?', '3 + 3 + 3 + 3', ['4 + 3', '3 + 4 + 1', '4 + 4'], 'Son 4 veces el 3: 12.', 0),
      ej('¿Cuánto es 2 × 6?', '12', ['8', '26', '6'], '6 + 6 = 12.', 0),
      ej('Tenés 4 bolsas con 4 caramelos cada una. ¿Cuántos caramelos son?', '16', ['8', '44', '20'], '4 + 4 + 4 + 4 = 16.', 1),
      ej('Un dibujo tiene 3 filas de 5 cuadraditos. ¿Cuántos cuadraditos hay?', '15', ['8', '35', '3'], '5 + 5 + 5 = 15.', 2),
      ej('¿Cuál NO es igual a 5 × 2?', '5 + 5 + 5', ['5 + 5', '2 + 8', '10 + 0'], '5 + 5 + 5 = 15. Los otros dan 10.', 2),
    ],
  },
  {
    grado: '3er grado', unidad: 'Números y operaciones', tema: 'Multiplicación y división',
    slug: 'mate-3-tablas-del-2-y-5', titulo: 'Tablas del 2 y del 5',
    descripcion: 'Practicamos las tablas del 2 y del 5 con ejemplos.',
    bloques: [
      texto('Las tablas tienen patrones. En la del 2 sumás 2 cada vez: 2, 4, 6, 8... En la del 5, los resultados terminan en 0 o en 5: 5, 10, 15, 20... Truco: 5 × un número par siempre termina en 0.'),
      ordenar('Ordená los resultados de la tabla del 5, de menor a mayor.', ['5', '10', '15', '20']),
      ej('¿Cuánto es 2 × 7?', '14', ['12', '9', '21'], '7 + 7 = 14.', 1),
      ej('¿Cuánto es 5 × 6?', '30', ['11', '35', '24'], '5 seis veces: 30.', 0),
      ej('¿Cuánto es 5 × 9?', '45', ['40', '54', '59'], 'Son 5 veces 9: 9 + 9 + 9 + 9 + 9 = 45.', 2),
      ej('¿Cuánto es 2 × 9?', '18', ['16', '20', '19'], 'El doble de 9 es 18.', 2),
      ej('Juli dice: "5 × 4 termina en 5 porque el 4 es par". ¿Tiene razón?', 'No: 5 × 4 = 20, termina en 0', ['Sí, termina en 5', 'Sí, da 9', 'No, da 45'], 'Con un número par, el 5 da resultado que termina en 0.', 0),
    ],
  },
  {
    grado: '3er grado', unidad: 'Números y operaciones', tema: 'Multiplicación y división',
    slug: 'mate-3-dobles-y-mitades', titulo: 'Dobles y mitades',
    descripcion: 'El doble es multiplicar por 2. La mitad es dividir por 2.',
    bloques: [
      texto('El doble de un número es ese número más él mismo. La mitad es partirlo en dos partes iguales. Son ideas opuestas: el doble de 8 es 16 y la mitad de 16 es 8.'),
      ej('¿Cuál es el doble de 12?', '24', ['6', '22', '14'], '12 + 12 = 24.', 2),
      ej('¿Cuál es la mitad de 18?', '9', ['36', '8', '19'], '18 partido en dos partes iguales es 9.', 0),
      ej('¿Cuál es el doble de 25?', '50', ['45', '55', '40'], '25 + 25 = 50.', 1),
      ej('Tenés 14 figuritas y las repartís en partes iguales con tu amigo. ¿Cuántas le tocan a cada uno?', '7', ['28', '12', '4'], 'La mitad de 14 es 7.', 0),
      ej('Tenés 16 caramelos y tu hermana tiene el doble que vos. ¿Cuántos tiene ella?', '32', ['8', '18', '26'], 'El doble de 16 es 32.', 1),
      ej('¿Cuál es la mitad de 30?', '15', ['13', '60', '3'], '30 partido en dos es 15.', 2),
    ],
  },
  {
    grado: '3er grado', unidad: 'Números y operaciones', tema: 'Multiplicación y división',
    slug: 'mate-3-dividir-partes-iguales', titulo: 'Repartir en partes iguales',
    descripcion: 'Dividir es repartir en partes iguales o armar grupos iguales.',
    bloques: [
      texto('Dividir es repartir algo en partes iguales o armar grupos iguales. Podés preguntarte: ¿cuánto le toca a cada uno? (repartir) o ¿cuántos grupos puedo armar? (agrupar). Si sobra algo, no es un reparto exacto.'),
      ej('Repartí 12 caramelos entre 3 amigos. ¿Cuántos le toca a cada uno?', '4', ['3', '9', '36'], '12 dividido 3 es 4.', 0),
      ej('Tenés 15 galletitas y las ponés en bolsas de 5. ¿Cuántas bolsas armás?', '3', ['5', '10', '20'], '15 dividido 5 es 3 bolsas.', 2),
      ej('Repartí 8 caramelos entre 2 amigos. ¿Cuántos le toca a cada uno?', '4', ['2', '6', '16'], '8 dividido 2 es 4.', 1),
      ej('Tenés 10 caramelos y querés armar bolsas de 3. ¿Cuántas bolsas completas podés armar?', '3', ['10', '7', '1'], 'Caben 3 bolsas completas de 3, y sobra 1.', 0),
      ej('Juan dice: "Si reparto 10 entre 2, a cada uno le tocan 4". ¿Tiene razón?', 'No: 10 ÷ 2 = 5', ['Sí', 'No, da 20', 'No, da 12'], '10 dividido 2 es 5. A cada uno le tocan 5.', 0),
      ej('¿Cuántos grupos de 6 se pueden armar con 18 cosas?', '3', ['12', '6', '108'], '18 dividido 6 es 3.', 0),
    ],
  },
  {
    grado: '3er grado', unidad: 'Números y operaciones', tema: 'Multiplicación y división',
    slug: 'mate-3-problemas-de-multiplicar', titulo: 'Problemas para multiplicar',
    descripcion: 'Usamos la multiplicación para resolver situaciones de todos los días.',
    bloques: [
      texto('En muchos problemas hay grupos iguales: cajas, filas, bolsas, mesas. Si tenés cantidad de grupos × cantidad en cada grupo, multiplicás. Pensá primero: ¿cuántos grupos hay? ¿cuántas cosas tiene cada grupo?'),
      ej('En cada caja hay 6 huevos y hay 4 cajas. ¿Cuántos huevos hay?', '24', ['10', '18', '30'], '4 veces 6 es 24.', 1),
      ej('Una fila tiene 5 sillas y hay 3 filas. ¿Cuántas sillas hay?', '15', ['8', '35', '53'], '3 veces 5 es 15.', 0),
      ej('Hay 7 bolsas con 2 naranjas cada una. ¿Cuántas naranjas hay?', '14', ['9', '12', '72'], '7 veces 2 es 14.', 3),
      ej('Una heladería vende 8 conos por hora durante 4 horas. ¿Cuántos conos vende?', '32', ['12', '24', '40'], '4 veces 8 es 32.', 2),
      ej('Se reparten 20 lápices en 5 cajas iguales. ¿Cuántos lápices hay en cada caja?', '4', ['100', '15', '25'], '20 dividido 5 es 4.', 0),
      ej('Juan compra 3 paquetes de figuritas con 6 cada uno y regala 4. ¿Cuántas le quedan?', '14', ['18', '22', '6'], '3 × 6 = 18. Después 18 − 4 = 14.', 0),
    ],
  },

  // ---------- 4.to grado ----------
  {
    grado: '4to grado', unidad: 'Geometría y medida', tema: 'Triángulos',
    slug: 'mate-4-lados-de-poligonos', titulo: 'Lados de los polígonos',
    descripcion: 'Un polígono es una figura cerrada con lados rectos. Contamos sus lados.',
    bloques: [
      texto('Un polígono es una figura cerrada, hecha solo con lados rectos. Se llama según sus lados: triángulo (3), cuadrilátero (4), pentágono (5), hexágono (6), heptágono (7), octógono (8). Los lados se unen en las puntas, que se llaman vértices.'),
      ej('¿Cuántos lados tiene un hexágono?', '6', ['5', '8', '4'], 'Hexágono viene de seis: tiene 6 lados.', 0),
      ej('¿Cuántos lados tiene un pentágono?', '5', ['4', '6', '50'], 'Pentágono: cinco lados.', 1),
      ej('¿Qué polígono tiene 4 lados iguales y 4 ángulos rectos?', 'Cuadrado', ['Triángulo', 'Pentágono', 'Hexágono'], 'Con esas dos condiciones es un cuadrado.', 2),
      ej('Un triángulo tiene un ángulo de 90°. ¿Cómo se llama?', 'Triángulo rectángulo', ['Triángulo equilátero', 'Triángulo isósceles', 'Cuadrilátero'], 'El que tiene un ángulo recto se llama rectángulo.', 0),
      ej('¿Cuál de estas figuras NO es un polígono?', 'Círculo', ['Cuadrado', 'Triángulo', 'Hexágono'], 'El círculo tiene una línea curva, no lados rectos.', 0),
      ej('¿Cuántos lados tiene un octógono?', '8', ['6', '7', '9'], 'Octo quiere decir ocho.', 3),
    ],
  },
  {
    grado: '4to grado', unidad: 'Geometría y medida', tema: 'Perímetro y área',
    slug: 'mate-4-perimetro', titulo: 'Perímetro: cuánto mide el contorno',
    descripcion: 'El perímetro es la suma de todos los lados de una figura.',
    bloques: [
      texto('El perímetro es el contorno de una figura: lo que mediría si recorrieras todos sus lados. Se calcula sumando todos los lados. En un rectángulo también puede calcularse como 2 × (largo + ancho).'),
      ej('Un rectángulo mide 3 cm de ancho y 5 cm de largo. ¿Cuál es su perímetro?', '16 cm', ['15 cm', '8 cm', '13 cm'], '3 + 5 + 3 + 5 = 16 cm.', 0),
      ej('Un cuadrado tiene lados de 4 cm. ¿Cuál es su perímetro?', '16 cm', ['8 cm', '12 cm', '4 cm'], '4 + 4 + 4 + 4 = 16 cm.', 2),
      ej('Un triángulo tiene lados de 3, 4 y 5 cm. ¿Cuál es su perímetro?', '12 cm', ['10 cm', '15 cm', '7 cm'], '3 + 4 + 5 = 12 cm.', 1),
      ej('Un patio rectangular mide 10 m de largo y 4 m de ancho. ¿Cuánto alambre hace falta para cercarlo?', '28 m', ['14 m', '40 m', '20 m'], 'Son dos largos (10 + 10) y dos anchos (4 + 4): 28 m.', 2),
      ej('Dos figuras tienen perímetro de 12 cm. ¿Pueden tener formas distintas?', 'Sí, por ejemplo un rectángulo de 5 y 1 cm, y un cuadrado de 3 cm', ['No, siempre tienen la misma forma', 'Sí, pero solo si son triángulos', 'No, el perímetro depende del color'], 'Un rectángulo de 5 × 1 da 12 cm, y un cuadrado de 3 también.', 0),
      ej('Si a cada lado de un cuadrado de 4 cm le agregás 1 cm, ¿cuánto aumenta el perímetro?', '4 cm', ['1 cm', '8 cm', '5 cm'], 'Son 4 lados y cada uno crece 1 cm: 4 cm más.', 1),
    ],
  },
  {
    grado: '4to grado', unidad: 'Números y operaciones', tema: 'Fracciones',
    slug: 'mate-4-fracciones-partes-iguales', titulo: 'Fracciones: partes iguales',
    descripcion: 'Una fracción indica en cuántas partes iguales dividimos un entero y cuántas tomamos.',
    bloques: [
      texto('Una fracción divide un entero en partes iguales. El de abajo (denominador) dice en cuántas partes se dividió. El de arriba (numerador) dice cuántas partes tomamos. Ejemplo: 3/4 son tres de cuatro partes iguales.'),
      ej('Una pizza se corta en 8 partes iguales y comés 3. ¿Qué fracción comiste?', '3/8', ['8/3', '3/5', '1/8'], 'Comiste 3 de las 8 partes: 3/8.', 0),
      ej('En la fracción 5/6, ¿cuál es el numerador?', '5', ['6', '11', '1'], 'El numerador es el de arriba: 5.', 1),
      ej('Una torta se divide en 4 partes iguales y te toca una. ¿Qué fracción es?', '1/4', ['4/1', '1/2', '4/4'], 'Cada parte es un cuarto: 1/4.', 0),
      ej('Pintás 2 de las 6 partes de un dibujo. ¿Qué fracción está pintada?', '2/6', ['6/2', '2/4', '1/6'], 'Son 2 partes de 6: 2/6.', 2),
      ej('¿Cuál de estas fracciones es la mitad?', '2/4', ['2/3', '1/3', '3/4'], '2 de 4 partes es la mitad del entero.', 0),
      ej('Un chocolate tiene 5 partes iguales. Ana come 2 y Juan 1. ¿Qué fracción comieron juntos?', '3/5', ['2/5', '1/5', '5/3'], 'Juntos comieron 2 + 1 = 3 partes de 5: 3/5.', 3),
    ],
  },
  {
    grado: '4to grado', unidad: 'Números y operaciones', tema: 'Fracciones',
    slug: 'mate-4-comparar-fracciones', titulo: 'Comparar fracciones con igual denominador',
    descripcion: 'Si las fracciones tienen el mismo denominador, gana la de mayor numerador.',
    bloques: [
      texto('Si dos fracciones tienen el mismo denominador, las partes miden lo mismo. Entonces gana la que tiene más partes, es decir, la de mayor numerador. Ejemplo: 3/8 es menor que 5/8.'),
      ej('¿Cuál es mayor: 3/8 o 5/8?', '5/8', ['3/8', 'Son iguales', 'No se puede saber'], 'Son octavos. Cinco octavos es más que tres octavos.', 0),
      ej('¿Cuál es menor: 2/5 o 4/5?', '2/5', ['4/5', 'Son iguales', 'No se puede saber'], 'Dos quintos es menos que cuatro quintos.', 1),
      ej('Juan comió 1/4 de torta y María 3/4. ¿Quién comió más?', 'María', ['Juan', 'Comieron lo mismo', 'No se sabe'], 'Tres cuartos es más que un cuarto.', 0),
      ej('¿Cuánto es 1/6 + 2/6?', '3/6', ['3/12', '2/6', '1/6'], 'Con el mismo denominador, sumás los numeradores: 1 + 2 = 3.', 2),
      ej('María dice que 1/8 es mayor que 1/4 porque el 8 es más grande. ¿Tiene razón?', 'No: 1/4 es mayor', ['Sí, porque el 8 es más grande', 'Son iguales', 'No se puede saber'], 'Con más partes, cada parte es más chica. Un cuarto es más que un octavo.', 0),
      ordenar('Ordená de menor a mayor.', ['1/4', '2/4', '3/4']),
    ],
  },
  {
    grado: '4to grado', unidad: 'Números y operaciones', tema: 'Multiplicación',
    slug: 'mate-4-multiplicar-por-10-y-por-2', titulo: 'Multiplicar por 10 y por 2',
    descripcion: 'Trucos para multiplicar por 10 y por 2 sin cuenta larga.',
    bloques: [
      texto('Para multiplicar por 10, agregás un cero al final: 7 × 10 = 70. Para multiplicar por 2, podés calcular el doble. Con estos trucos armás cuentas más grandes: 14 × 4 = 28 + 28 = 56.'),
      ej('¿Cuánto es 12 × 10?', '120', ['102', '12', '1 200'], 'Al agregar un cero: 120.', 0),
      ej('¿Cuánto es 15 × 2?', '30', ['25', '35', '20'], 'El doble de 15 es 30.', 2),
      ej('¿Cuánto es 13 × 3?', '39', ['36', '33', '42'], '13 + 13 + 13 = 39.', 1),
      ej('Un libro cuesta 25 pesos. ¿Cuánto cuestan 10 libros?', '250 pesos', ['2 500 pesos', '25 pesos', '205 pesos'], '25 × 10 = 250.', 0),
      ej('¿Cuánto es 14 × 4?', '56', ['54', '64', '46'], '14 × 2 = 28, y 28 × 2 = 56.', 2),
      ej('Si 6 × 10 = 60, ¿cuánto es 6 × 20?', '120', ['60', '600', '26'], 'El doble de 60 es 120.', 1),
    ],
  },

  // ---------- 5.to grado ----------
  {
    grado: '5to grado', unidad: 'Números y operaciones', tema: 'Sistema de numeración',
    slug: 'mate-5-numeros-grandes', titulo: 'Números grandes y su valor',
    descripcion: 'Cada cifra vale distinto según el lugar donde está.',
    bloques: [
      texto('Cada cifra vale según su lugar. En 2 345: el 5 vale 5 (unidades), el 4 vale 40 (decenas), el 3 vale 300 (centenas) y el 2 vale 2 000 (unidades de mil). Para leer números grandes, se separan los miles con un espacio: 2 345.'),
      ej('¿Cuántas centenas tiene 3 400?', '34', ['3', '340', '4'], '3 400 son 34 centenas.', 2),
      ej('¿Cuál es el valor del 5 en 25 000?', '5 000', ['500', '50', '5'], 'El 5 está en el lugar de los miles: vale 5 000.', 0),
      ej('¿Cómo se lee 1 040?', 'Mil cuarenta', ['Cien cuarenta', 'Mil cuatro', 'Diez cuarenta'], 'Es mil cuarenta: mil, más cuarenta.', 0),
      ordenar('Ordená de menor a mayor.', ['980', '1 050', '1 200']),
      ej('¿Cuántas decenas de mil tiene 200 000?', '20', ['200', '2', '2 000'], 'Cada decena de mil es 10 000. 200 000 tiene 20 de esas.', 1),
      ej('¿Qué número es 3 000 + 400 + 5?', '3 405', ['3 450', '3 045', '34 005'], 'Tres mil, cuatrocientos y cinco.', 0),
    ],
  },
  {
    grado: '5to grado', unidad: 'Números y operaciones', tema: 'Múltiplos y divisores',
    slug: 'mate-5-multiplos-y-divisores', titulo: 'Múltiplos y divisores',
    descripcion: 'Los múltiplos se obtienen multiplicando. Los divisores dividen en partes exactas.',
    bloques: [
      texto('Los múltiplos de un número se obtienen multiplicándolo por 1, 2, 3... Múltiplos de 3: 3, 6, 9, 12... Un divisor de un número lo divide en partes exactas (sin resto): 12 ÷ 3 = 4, exacto. Divisores de 12: 1, 2, 3, 4, 6 y 12.'),
      ej('¿Cuál NO es múltiplo de 4?', '10', ['8', '12', '20'], '4, 8, 12, 16, 20... El 10 no está.', 1),
      ej('¿Cuál de estos es divisor de 12?', '4', ['5', '7', '8'], '12 dividido 4 es 3, exacto.', 0),
      ej('¿Cuántos divisores tiene el 6?', '4', ['2', '3', '6'], 'Son 1, 2, 3 y 6.', 2),
      ej('¿Cuál es el menor número que es múltiplo de 2 y de 3 a la vez?', '6', ['4', '9', '12'], 'Los múltiplos de 2 son 2, 4, 6... y los de 3 son 3, 6... El primero que coincide es 6.', 0),
      ej('Si 9 es divisor de 27, ¿27 es múltiplo de 9?', 'Sí', ['No', 'Solo si es par', 'No se puede saber'], 'Son la misma relación: 27 = 9 × 3.', 0),
      ej('¿Cuál de estos números es divisible por 5?', '35', ['32', '43', '12'], 'Un número es divisible por 5 si termina en 0 o 5. El 35 termina en 5.', 2),
    ],
  },
  {
    grado: '5to grado', unidad: 'Números y operaciones', tema: 'Fracciones',
    slug: 'mate-5-fracciones-equivalentes', titulo: 'Fracciones equivalentes',
    descripcion: 'Fracciones distintas que representan la misma cantidad.',
    bloques: [
      texto('1/2 = 2/4 = 4/8: son fracciones equivalentes, aunque se vean distintas. Para encontrar una equivalente, multiplicá arriba y abajo por el mismo número: 1/2 × 2/2 = 2/4.'),
      ej('¿Cuál es equivalente a 1/2?', '4/8', ['2/3', '1/3', '3/5'], 'Multiplicando por 4 arriba y abajo: 4/8.', 1),
      ej('¿Cuál es equivalente a 2/3?', '4/6', ['3/4', '2/5', '3/2'], 'Multiplicando por 2 arriba y abajo: 4/6.', 2),
      ej('¿Cuál es equivalente a 3/4?', '6/8', ['3/8', '4/6', '9/4'], 'Por 2 arriba y abajo: 6/8.', 1),
      ej('¿Cuál NO es equivalente a 1/3?', '2/3', ['2/6', '3/9', '4/12'], '2/6, 3/9 y 4/12 valen 1/3. El 2/3 no.', 0),
      ej('Ana dice que 2/4 y 1/2 son distintas. ¿Tiene razón?', 'No: son la misma cantidad', ['Sí, porque los números son distintos', 'Sí, porque 2/4 es más grande', 'No se puede saber'], '2/4 es la mitad de un entero, igual que 1/2.', 0),
      ej('¿Cuál es 3/5 escrito con denominador 10?', '6/10', ['3/10', '9/10', '5/10'], 'Por 2 arriba y abajo: 6/10.', 1),
    ],
  },
  {
    grado: '5to grado', unidad: 'Números y operaciones', tema: 'Fracciones',
    slug: 'mate-5-sumar-fracciones', titulo: 'Sumar y restar fracciones con igual denominador',
    descripcion: 'Si el denominador es igual, sumamos o restamos solo los numeradores.',
    bloques: [
      texto('Si las fracciones tienen el mismo denominador, sumás o restás solo los numeradores y dejás el denominador igual. Ejemplo: 2/7 + 3/7 = 5/7. Si los denominadores son distintos, primero hay que igualarlos.'),
      ej('1/5 + 2/5 = ?', '3/5', ['3/10', '2/5', '1/5'], '1 + 2 = 3 quintos.', 0),
      ej('3/8 + 4/8 = ?', '7/8', ['7/16', '1/8', '12/8'], '3 + 4 = 7 octavos.', 1),
      ej('5/6 − 2/6 = ?', '3/6', ['7/6', '3/12', '2/6'], '5 − 2 = 3 sextos.', 2),
      ej('Julia comió 2/9 de una torta y Tomás 4/9. ¿Cuánto comieron juntos?', '6/9', ['6/18', '2/9', '4/9'], '2 + 4 = 6 novenos.', 0),
      ej('Un camino tiene 7/10 de asfalto y ya hicieron 3/10. ¿Cuánto falta?', '4/10', ['10/10', '3/10', '7/3'], '7 − 3 = 4 décimos.', 1),
      ej('Juan dice que 1/4 + 1/4 = 2/8. ¿Tiene razón?', 'No: 1/4 + 1/4 = 2/4', ['Sí, se suman los denominadores', 'Sí, es lo mismo', 'No se puede sumar'], 'Se suman los numeradores: 1 + 1 = 2, y el denominador queda 4.', 0),
    ],
  },
  {
    grado: '5to grado', unidad: 'Geometría y medida', tema: 'Ángulos',
    slug: 'mate-5-tipos-de-angulos', titulo: 'Tipos de ángulos',
    descripcion: 'Recto, agudo, obtuso y llano: cómo se reconocen por su medida.',
    bloques: [
      texto('Un ángulo se forma cuando dos líneas salen de un mismo punto. Se mide en grados (°). Recto: 90°. Agudo: menos de 90°. Obtuso: entre 90° y 180°. Llano: 180° (es una línea recta).'),
      ej('¿Qué tipo de ángulo mide 90°?', 'Recto', ['Agudo', 'Obtuso', 'Llano'], 'Noventa grados es el ángulo recto, como la esquina de una hoja.', 0),
      ej('Un ángulo mide 130°. ¿De qué tipo es?', 'Obtuso', ['Agudo', 'Recto', 'Llano'], '130 es más de 90 y menos de 180: obtuso.', 2),
      ej('¿Cuánto mide un ángulo llano?', '180°', ['90°', '360°', '45°'], 'El llano es media vuelta: 180°.', 1),
      ej('Un ángulo mide 45°. ¿De qué tipo es?', 'Agudo', ['Recto', 'Obtuso', 'Llano'], 'Es menos de 90: agudo.', 0),
      ej('Una vuelta completa mide 360°. ¿Cuánto mide media vuelta?', '180°', ['90°', '270°', '360°'], 'La mitad de 360 es 180.', 2),
      ej('¿Cuál de estos ángulos es recto?', '90°', ['45°', '120°', '180°'], 'Solo el de 90° es recto.', 0),
    ],
  },

  // ---------- 6.to grado ----------
  {
    grado: '6to grado', unidad: 'Resolución de problemas', tema: 'Números enteros',
    slug: 'mate-6-numeros-enteros', titulo: 'Números positivos y negativos',
    descripcion: 'Los negativos están a la izquierda del cero en la recta numérica.',
    bloques: [
      texto('Los números negativos están a la izquierda del cero: −1, −2, −3... Sirven para temperaturas, deudas o pisos de un edificio con subsuelo. Mientras más lejos del cero, menor es el número: −7 es menor que −3.'),
      ej('¿Cuál es mayor: −3 o −7?', '−3', ['−7', 'Son iguales', 'No se puede saber'], '−3 está más cerca del cero, así que es mayor.', 0),
      ej('¿Cuál es mayor: −2 o 1?', '1', ['−2', '−3', 'Son iguales'], 'Cualquier positivo es mayor que cualquier negativo.', 1),
      ej('Hace −4 °C y sube 6 grados. ¿Cuánto marca ahora?', '2 °C', ['−10 °C', '−2 °C', '10 °C'], 'De −4 subís 4 para llegar a 0, y 2 más: queda 2 °C.', 3),
      ej('Un ascensor está en el piso −2 (subsuelo) y sube 5 pisos. ¿En qué piso queda?', '3', ['−7', '−3', '7'], '−2 + 5 = 3.', 0),
      ej('¿Qué número entero está entre −1 y 1?', '0', ['−2', '2', '−1'], 'Entre −1 y 1 solo está el 0.', 0),
      ordenar('Ordená de menor a mayor.', ['−5', '−1', '0', '2']),
    ],
  },
  {
    grado: '6to grado', unidad: 'Resolución de problemas', tema: 'Porcentajes',
    slug: 'mate-6-porcentajes', titulo: 'Porcentajes: de cada 100',
    descripcion: 'El porcentaje es una cuenta de cada 100. Ej.: 50 % es la mitad.',
    bloques: [
      texto('Porcentaje significa "de cada 100". 50 % es la mitad. 25 % es la cuarta parte. 10 % es la décima parte. Para calcular un 10 %, dividí por 10. Para un 50 %, dividí por 2.'),
      ej('¿Cuánto es el 50 % de 80?', '40', ['30', '8', '160'], 'La mitad de 80 es 40.', 0),
      ej('¿Cuánto es el 25 % de 200?', '50', ['25', '75', '20'], 'La cuarta parte de 200 es 50.', 2),
      ej('¿Cuánto es el 10 % de 350?', '35', ['45', '25', '3,5'], 'La décima parte de 350 es 35.', 1),
      ej('Un celular cuesta 40 000 pesos y tiene 25 % de descuento. ¿Cuánto es el descuento?', '10 000 pesos', ['25 000 pesos', '4 000 pesos', '15 000 pesos'], '25 % es la cuarta parte: 40 000 ÷ 4 = 10 000.', 0),
      ej('De 60 alumnos, el 50 % aprobó. ¿Cuántos aprobaron?', '30', ['20', '60', '15'], 'La mitad de 60 es 30.', 2),
      ej('¿Cuál es mayor: el 10 % o el 5 % de 200?', 'El 10 %', ['El 5 %', 'Son iguales', 'No se puede saber'], 'El 10 % de 200 es 20; el 5 % es 10.', 0),
    ],
  },
  {
    grado: '6to grado', unidad: 'Resolución de problemas', tema: 'Situaciones problemáticas',
    slug: 'mate-6-razon-y-proporcion', titulo: 'Proporcionalidad en problemas',
    descripcion: 'Si se compra más de algo, el precio total crece en la misma proporción.',
    bloques: [
      texto('En la proporcionalidad directa, si una cantidad se multiplica, la otra también. Si 2 kilos cuestan 100 pesos, 1 kilo cuesta 50. Entonces 6 kilos cuestan 6 × 50 = 300 pesos.'),
      ej('Si 3 cuadernos cuestan 900 pesos, ¿cuánto cuesta 1?', '300', ['600', '250', '3'], '900 dividido 3 es 300.', 2),
      ej('Cuatro cuadernos cuestan 300 pesos cada uno. ¿Cuánto cuestan los cuatro?', '1 200', ['400', '1 000', '1 500'], '4 × 300 = 1 200.', 0),
      ej('Para 2 personas se usan 200 g de harina. ¿Cuántos gramos para 6 personas?', '600 g', ['400 g', '300 g', '800 g'], '6 personas son tres veces 2: 3 × 200 = 600.', 1),
      ej('Un auto recorre 120 km en 2 horas a la misma velocidad. ¿Cuántos km recorre en 5 horas?', '300 km', ['250 km', '600 km', '200 km'], 'En 1 hora recorre 60 km. En 5 horas: 5 × 60 = 300 km.', 2),
      ej('Con 4 entradas se pagan 2 000 pesos. ¿Cuánto se paga por 2 entradas?', '1 000 pesos', ['500 pesos', '2 500 pesos', '4 000 pesos'], 'La mitad de las entradas cuesta la mitad: 1 000.', 1),
      ej('Una receta usa 3 huevos para 6 personas. ¿Cuántos huevos para 2 personas?', '1', ['2', '6', '3'], '6 personas son 3 veces 2, así que 3 ÷ 3 = 1 huevo.', 0),
    ],
  },
  {
    grado: '6to grado', unidad: 'Resolución de problemas', tema: 'Áreas',
    slug: 'mate-6-area-del-triangulo', titulo: 'Área del triángulo',
    descripcion: 'El área del triángulo es base por altura, dividido 2.',
    bloques: [
      texto('El área de un triángulo es (base × altura) ÷ 2. ¿Por qué? Porque un triángulo es la mitad de un rectángulo con la misma base y la misma altura. La altura se mide en forma perpendicular a la base.'),
      ej('Base 6 cm y altura 4 cm. ¿Cuál es el área?', '12 cm²', ['24 cm²', '10 cm²', '8 cm²'], '6 × 4 = 24, y 24 ÷ 2 = 12.', 0),
      ej('Base 10 cm y altura 5 cm. ¿Cuál es el área?', '25 cm²', ['50 cm²', '15 cm²', '5 cm²'], '10 × 5 = 50, y 50 ÷ 2 = 25.', 2),
      ej('Un triángulo tiene base 8 cm y altura 7 cm. ¿Cuál es el área?', '28 cm²', ['56 cm²', '15 cm²', '7 cm²'], '8 × 7 = 56, y 56 ÷ 2 = 28.', 1),
      ej('Un rectángulo mide 6 × 4 cm. Dibujás un triángulo con esa misma base y altura. ¿Qué área tiene?', '12 cm²', ['24 cm²', '6 cm²', '10 cm²'], 'El rectángulo tiene 24 cm². El triángulo es la mitad: 12 cm².', 2),
      ej('Un triángulo tiene área 20 cm² y base 10 cm. ¿Cuál es su altura?', '4 cm', ['2 cm', '40 cm', '5 cm'], 'Como área = base × altura ÷ 2: 20 = 10 × altura ÷ 2, entonces altura = 4.', 0),
      ej('Juan dice que el área de un triángulo es base × altura. ¿Tiene razón?', 'No, falta dividir por 2', ['Sí, siempre', 'Sí, si la base es par', 'No, se suma la altura'], 'El área del triángulo es la mitad del rectángulo: hay que dividir por 2.', 0),
    ],
  },
  {
    grado: '6to grado', unidad: 'Resolución de problemas', tema: 'Situaciones problemáticas',
    slug: 'mate-6-ecuaciones-simples', titulo: 'Averiguar un número: ecuaciones simples',
    descripcion: 'Una letra puede esconder un número. Lo averiguamos con una cuenta.',
    bloques: [
      texto('Una ecuación es una igualdad con una letra que no conocemos. Para averiguarla, hacé la operación contraria en los dos lados. Ejemplo: x + 5 = 12 → x = 12 − 5 = 7. Y 3 × x = 18 → x = 18 ÷ 3 = 6.'),
      ej('x + 5 = 12. ¿Cuánto vale x?', '7', ['17', '6', '8'], 'Restamos 5 de los dos lados: x = 7.', 1),
      ej('3 × x = 18. ¿Cuánto vale x?', '6', ['15', '21', '9'], 'Dividimos 18 por 3: x = 6.', 0),
      ej('x − 4 = 10. ¿Cuánto vale x?', '14', ['6', '40', '4'], 'Sumamos 4 de los dos lados: x = 14.', 0),
      ej('2 × x + 1 = 9. ¿Cuánto vale x?', '4', ['5', '3', '8'], 'Primero restás 1: 2 × x = 8. Después dividís por 2: x = 4.', 2),
      ej('Un número más su doble da 27. ¿Cuál es el número?', '9', ['3', '27', '18'], 'Es x + 2x = 3x = 27, entonces x = 9.', 1),
      ej('Juan dice que x = 5 es solución de 2x = 12. ¿Tiene razón?', 'No: 2 × 5 = 10, no 12', ['Sí, porque 5 es impar', 'Sí, 5 es el número del medio', 'No se puede saber'], 'Para comprobarlo, reemplazás la x por 5: 2 × 5 = 10, y no da 12.', 0),
    ],
  },
];

// Temas nuevos que hace falta crear (el resto ya existe en Directus).
const UNIDADES_NUEVAS = [{ grado: '2do grado', nombre: 'Números y operaciones' }];
const TEMAS_NUEVOS = [
  { grado: '1er grado', unidad: 'Números y conteo', nombre: 'Números hasta 20' },
  { grado: '1er grado', unidad: 'Números y conteo', nombre: 'Restas y patrones' },
  { grado: '2do grado', unidad: 'Números y operaciones', nombre: 'Números hasta 100' },
  { grado: '2do grado', unidad: 'Números y operaciones', nombre: 'Sumas y restas' },
  { grado: '2do grado', unidad: 'Números y operaciones', nombre: 'Problemas' },
  { grado: '3er grado', unidad: 'Números y operaciones', nombre: 'Multiplicación y división' },
  { grado: '5to grado', unidad: 'Números y operaciones', nombre: 'Sistema de numeración' },
  { grado: '5to grado', unidad: 'Números y operaciones', nombre: 'Múltiplos y divisores' },
  { grado: '6to grado', unidad: 'Resolución de problemas', nombre: 'Números enteros' },
  { grado: '6to grado', unidad: 'Resolución de problemas', nombre: 'Porcentajes' },
  { grado: '6to grado', unidad: 'Resolución de problemas', nombre: 'Áreas' },
];

module.exports = { LECCIONES, UNIDADES_NUEVAS, TEMAS_NUEVOS };
