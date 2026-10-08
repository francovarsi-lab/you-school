-- Directus ignora tablas sin PK de una sola columna. Estas tablas de relación
-- tenían PK compuesta; se reemplaza por una columna id uuid y se conserva la
-- unicidad del par de claves foráneas.

BEGIN;

ALTER TABLE lecciones_conocimientos DROP CONSTRAINT lecciones_conocimientos_pkey;
ALTER TABLE lecciones_conocimientos ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE lecciones_conocimientos ADD PRIMARY KEY (id);
ALTER TABLE lecciones_conocimientos ADD CONSTRAINT lecciones_conocimientos_par_unico UNIQUE (leccion_id, conocimiento_id);

ALTER TABLE temas_conocimientos DROP CONSTRAINT temas_conocimientos_pkey;
ALTER TABLE temas_conocimientos ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE temas_conocimientos ADD PRIMARY KEY (id);
ALTER TABLE temas_conocimientos ADD CONSTRAINT temas_conocimientos_par_unico UNIQUE (tema_id, conocimiento_id);

ALTER TABLE lecciones_etiquetas DROP CONSTRAINT lecciones_etiquetas_pkey;
ALTER TABLE lecciones_etiquetas ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE lecciones_etiquetas ADD PRIMARY KEY (id);
ALTER TABLE lecciones_etiquetas ADD CONSTRAINT lecciones_etiquetas_par_unico UNIQUE (leccion_id, etiqueta_id);

COMMIT;
