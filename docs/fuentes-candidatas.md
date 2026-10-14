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
