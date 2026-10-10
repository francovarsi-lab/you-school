-- Reversa de 003-directus-relations.sql: borra exactamente las 6 filas insertadas.

BEGIN;

DELETE FROM directus_relations
WHERE (many_collection, many_field) IN (
  ('lecciones_conocimientos', 'leccion_id'),
  ('lecciones_conocimientos', 'conocimiento_id'),
  ('lecciones_etiquetas',     'leccion_id'),
  ('lecciones_etiquetas',     'etiqueta_id'),
  ('temas_conocimientos',     'tema_id'),
  ('temas_conocimientos',     'conocimiento_id')
);

COMMIT;
