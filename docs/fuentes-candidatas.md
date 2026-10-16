# Fuentes candidatas de video

Fecha: 2026-10-13. Investigación de solo lectura. No se importó nada. Cada fuente indica qué se verificó en su página oficial y qué no.

## Educ.ar: robots.txt y términos de uso

- **robots.txt** (https://www.educ.ar/robots.txt): `User-agent: *` con `Disallow:` vacío. No bloquea ningún rastreador. Esto es técnico: no alcanza para decir que un descubridor automático está permitido.
- **Términos y condiciones** (https://www.educ.ar/terminos-y-condiciones), verificados en la página oficial:
  - El contenido "pertenece exclusivamente a Educ.ar, salvo que se explicite lo contrario".
  - Autoriza el "libre uso y disposición de los contenidos del portal", "excepto para cualquier uso comercial".
  - La página **no menciona Creative Commons**. La licencia real de cada recurso está en su ficha.
  - Menciona que el material "expresamente publicado bajo licencias abiertas" queda exento de "las restricciones de scraping y reutilización". Eso indica que el scraping sin licencia abierta está restringido. Un descubridor automático queda en zona gris: conviene consultar a Educ.ar antes de automatizarlo.
- **Uso sin fines de lucro:** YOU SCHOOL es gratuito y sin fines de lucro (ver `/creditos`). Eso encaja con la excepción de uso comercial, pero no es un permiso explícito.

## Fuentes candidatas

| Fuente | Licencia (dónde se verificó) | Qué cubre | Enseñanza directa al alumno | Riesgo |
|---|---|---|---|---|
| **Khan Academy en español** | CC BY-NC-SA. Según la ayuda oficial en inglés (resultado de búsqueda; la página devolvió 403 al abrirla): https://support.khanacademy.org/hc/en-us/articles/202262954-Can-I-use-Khan-Academy-s-videos-name-materials-links-in-my-project | Matemática y otras materias, de todos los niveles. | Sí, es su propósito. | Requiere atribución, enlace a khanacademy.org y el aviso antes del login. El uso "no comercial" excluye publicidad. Algunos videos de socios tienen otros términos. No pude abrir la página oficial. |
| **Canal Encuentro** | No verificada en su sitio oficial (encuentro.gov.ar no resuelve desde acá). Las fichas que Educ.ar publica de Canal Encuentro indican **CC BY-NC-SA** (ejemplo: https://www.educ.ar/recursos/50794/proporcionalidad). | Documentales y programas de todas las áreas. | Mayormente no: son programas y documentales, no lecciones. | La licencia está en la ficha de Educ.ar, no en el sitio de Canal Encuentro. Cada programa puede tener sus propios términos. |
| **Pakapaka** | **No verificada.** Su sitio oficial no resolvió desde acá y no encontré su licencia en las búsquedas. | Programas infantiles, sobre todo de primera infancia y primaria temprana. | Poco: son programas, no clases de matemática. | Sin licencia verificada, no conviene usarla hasta confirmarla. |
| **Conectar Igualdad / Educ.ar para Secundaria** | CC BY-NC-SA, verificada en las fichas de Educ.ar: https://www.educ.ar/recursos/117949/conectar-igualdad-maria-teresa-lugo | Secundaria (ciclo básico y orientado). | Poco: son entrevistas y tutoriales de formación docente. | Varias fichas son solo para docentes o directivos. Hay que revisar la audiencia de cada una antes de importarla. |

## Notas

- Para Pakapaka y Canal Encuentro, la licencia real queda pendiente hasta poder abrir sus páginas oficiales o recibir una respuesta de la fuente.
- Para Khan Academy, antes de importar un video hay que verificar la página oficial en khanacademy.org, porque la ayuda pide el aviso y el enlace.
- Para cualquier fuente que no sea Educ.ar, los videos no pasan por el importador actual: solo sabe leer fichas de educ.ar.


## Educ.ar: colección 128372 "Videos para aprender, actividades para repasar"

Fecha: 2026-10-16. Solo lectura. Simulacro con `database/import-educar.js` sobre las 19 fichas de la colección. No se escribió nada.

- Ficha de la colección: https://www.educ.ar/recursos/128372. Nivel "Primario", audiencia "Estudiantes", autor "Educ.ar", licencia CC BY-NC-SA. Dice "si estás en los últimos años de la escuela primaria".
- **Ninguna de las 19 fichas es un video.** 18 son "Texto" (un texto con actividades) y 1 es "Interactivo" (La Constitución Nacional). Por eso el importador no las toma.
- Algunas fichas de texto hablan de videos o capítulos de otras series (Zamba, Horizontes Matemática, "La Célula 3D"). Si esos videos tienen ficha propia en Educ.ar, habría que buscarla aparte; no están en esta colección.
- Grado propuesto: "últimos años de primaria" no alcanza para ubicar la ficha. Ninguna se propone para un grado, porque no hay videos que importar.

| Ficha | Título propuesto (concepto) | Formato | Materia (según la ficha) | Duración | Audiencia | Veredicto |
|---|---|---|---|---|---|---|
| 127259 | La noticia | Texto | Lengua | — | Estudiantes | otro formato |
| 127785 | Los triángulos | Texto | Matemática | — | Estudiantes | otro formato |
| 127170 | La célula | Texto | Ciencias Naturales | — | Estudiantes | excluida: dice "fragmento" |
| 127175 | Espacios rurales, urbanos y periurbanos | Texto | Ciencias Sociales | — | Estudiantes | otro formato |
| 127787 | Ángulos | Texto | Matemática | — | Estudiantes | otro formato |
| 127678 | El sistema circulatorio | Texto | Ciencias Naturales | — | Estudiantes | otro formato |
| 127707 | El modelo agroexportador | Texto | Ciencias Sociales | — | Estudiantes | otro formato |
| 127818 | Los cuentos de terror | Texto | Lengua | — | Estudiantes | otro formato |
| 127683 | Alimentación saludable | Texto | Ciencias Naturales | — | Estudiantes | otro formato |
| 127788 | Medición de área de figuras geométricas | Texto | Matemática | — | Estudiantes | otro formato |
| 126867 | Los derechos de los niños, niñas y adolescentes | Texto | Ciencias Sociales (y Formación Ética) | — | Estudiantes | otro formato |
| 127710 | El cuento policial | Texto | Lengua | — | Estudiantes | otro formato |
| 127261 | Los cuadriláteros | Texto | Matemática | — | Estudiantes | otro formato |
| 127871 | La Constitución Nacional: derechos y obligaciones | Interactivo | Ciencias Sociales (y Formación Ética) | — | Estudiantes | otro formato |
| 127260 | El sistema digestivo | Texto | Ciencias Naturales | — | Estudiantes | otro formato |
| 127836 | El texto explicativo | Texto | Lengua | — | Estudiantes | otro formato |
| 127688 | El ciclo del agua | Texto | Ciencias Naturales | — | Estudiantes | otro formato |
| 127839 | Los adjetivos calificativos | Texto | Lengua | — | Estudiantes | otro formato |
| 127841 | Actos de habla | Texto | Lengua | — | Estudiantes | otro formato |

Materia según el área que figura en la ficha. En varias fichas el área no aparece, y la materia sale del título o de la descripción.

**Conteo de la colección:** Lengua 6, Matemática 4, Ciencias Sociales 4 (una es interactivo), Ciencias Naturales 5. Total 19. **Videos que pasan: 0.**

## Educ.ar: serie "Claves en un minuto - Biología" (150959)

Fecha: 2026-10-16. Solo lectura. Fichas leídas una por una y simulacro con el importador.

- La ficha de la serie no enlaza otras series ni otras materias. Todas las fichas enlazadas son de Biología.
- Nivel en Educ.ar: "Secundario". Audiencia: "Estudiantes" en 29 videos y "Docentes" en 1 (ficha 40770).
- 30 de las 32 fichas son video. Duración leída del MP4 (sin descargarlo): entre 0,8 y 2,0 minutos. Todas están dentro del límite de 10 minutos.
- Las fichas 40659 ("La mitosis") y 40763 ("Respuesta inflamatoria") responden error 500 desde Educ.ar. No se pudieron leer ni verificar.
- No se puede importar todavía. El importador rechaza cualquier año que no exista en Directus, y Secundaria no existe (ver abajo). Para ver formato y duración, el simulacro se corrió con "4to grado / Ciencias Naturales" como valor de prueba. Ese grado no es una propuesta.

| Ficha | Título | Audiencia | Duración | Veredicto (simulacro) |
|---|---|---|---|---|
| 40653 | Duplicación del ADN | Estudiantes | 1,4 min | creada (simulacro) |
| 40654 | Traducción del ADN | Estudiantes | 1,8 min | creada (simulacro) |
| 40655 | Fotosíntesis | Estudiantes | 1,2 min | creada (simulacro) |
| 40656 | La conducción del agua en las plantas | Estudiantes | 1,2 min | creada (simulacro) |
| 40657 | Transporte pasivo | Estudiantes | 1,3 min | creada (simulacro) |
| 40658 | Transporte activo | Estudiantes | 1,4 min | creada (simulacro) |
| 40659 | La mitosis | — | — | error 500 en Educ.ar |
| 40660 | La meiosis: etapas y función en la reproducción celular | Estudiantes | 1,1 min | creada (simulacro) |
| 40661 | Crossing over | Estudiantes | 0,8 min | creada (simulacro) |
| 40662 | La ovulación | Estudiantes | 1,5 min | creada (simulacro) |
| 40663 | Hemostasia | Estudiantes | 1,5 min | creada (simulacro) |
| 40671 | Las hormonas esteroides | Estudiantes | 1,3 min | creada (simulacro) |
| 40678 | El cuerpo como construcción histórica | Estudiantes | 1,3 min | creada (simulacro) |
| 40683 | La biodiversidad | Estudiantes | 1,5 min | creada (simulacro) |
| 40715 | Hidratos de carbono | Estudiantes | 1,1 min | creada (simulacro) |
| 40716 | Funciones enzimáticas | Estudiantes | 1,6 min | creada (simulacro) |
| 40717 | Transformaciones al cocinar | Estudiantes | 1,5 min | creada (simulacro) |
| 40756 | Los lípidos | Estudiantes | 1,4 min | creada (simulacro) |
| 40759 | Biomateriales | Estudiantes | 1,1 min | creada (simulacro) |
| 40762 | Transcripción del ADN | Estudiantes | 1,9 min | creada (simulacro) |
| 40763 | Respuesta inflamatoria | — | — | error 500 en Educ.ar |
| 40764 | La fecundación | Estudiantes | 1,7 min | creada (simulacro) |
| 40765 | El impulso nervioso | Estudiantes | 1,7 min | creada (simulacro) |
| 40766 | La sinapsis | Estudiantes | 1,6 min | creada (simulacro) |
| 40767 | Las hormonas peptídicas | Estudiantes | 1,2 min | creada (simulacro) |
| 40769 | La comunicación hormonal | Estudiantes | 1,5 min | creada (simulacro) |
| 40770 | El ciclo del agua | Docentes | 1,7 min | saltada: ya existe una lección con el slug "el-ciclo-del-agua". Además, la audiencia es solo docentes: no debe publicarse |
| 40771 | El ciclo del carbono | Estudiantes | 1,4 min | creada (simulacro) |
| 40776 | La clonación | Estudiantes | 1,6 min | creada (simulacro) |
| 40779 | La coevolución | Estudiantes | 1,8 min | creada (simulacro) |
| 40780 | Florentino Ameghino: la evolución humana | Estudiantes | 1,4 min | creada (simulacro) |
| 40781 | El ciclo menstrual | Estudiantes | 2,0 min | creada (simulacro) |

**Conteo de la serie:** 30 videos. 29 son para Estudiantes y pasan audiencia y duración (en el simulacro salen "creada"). 1 es solo para docentes (40770). 2 no se pudieron leer.

### Qué nivel, años y materias de Secundaria habría que crear (propuesta, no creada)

- **Nivel:** Secundaria (la ficha dice "Secundario"). Hoy Directus solo tiene Primaria.
- **Años:** la ficha no indica el año. Propuesta: 1.er a 6.to año, o 1.er a 5.to si se toma la estructura de la provincia. Esto lo decide Franco.
- **Materia:** Biología. Los temas (ADN, meiosis, hormonas, fotosíntesis, transporte, evolución) suelen darse en los últimos años, pero el año exacto de cada tema es una decisión curricular.
- Antes de importar, hay que crear el nivel, sus años, la materia, y las unidades y temas. Nada de eso se creó.

## Pendientes detectados

- La auditoría de contenido (`database/auditoria-contenido.js`) da "pasa" a lecciones con audiencia **Docentes** (17 de las 27 "pasa"). Esto contradice la regla de CLAUDE.md: solo se publica lo que es para Estudiantes o General. Conviene corregir el veredicto antes de publicar. No se cambió en esta tarea.
- La ficha 40770 ("El ciclo del agua", Claves) tiene el mismo slug que una lección ya existente. Hay que ver cuál es antes de importarla.
- Las fichas 40659 y 40763 dan error 500 en Educ.ar. Conviene reintentar más tarde.
