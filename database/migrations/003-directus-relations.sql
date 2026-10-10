-- Registra los metadatos M2M de las tablas de unión en directus_relations.
-- No modifica tablas de YOU SCHOOL ni FKs; las FKs ya existen en la base.

BEGIN;

INSERT INTO directus_relations
  (many_collection, many_field, one_collection, one_field, one_collection_field, one_allowed_collections, junction_field, sort_field, one_deselect_action)
VALUES
  ('lecciones_conocimientos', 'leccion_id',      'lecciones',      'conocimientos', NULL, NULL, 'conocimiento_id', NULL, 'nullify'),
  ('lecciones_conocimientos', 'conocimiento_id', 'conocimientos',  NULL,            NULL, NULL, 'leccion_id',      NULL, 'nullify'),
  ('lecciones_etiquetas',     'leccion_id',      'lecciones',      'etiquetas',     NULL, NULL, 'etiqueta_id',     NULL, 'nullify'),
  ('lecciones_etiquetas',     'etiqueta_id',     'etiquetas',      NULL,            NULL, NULL, 'leccion_id',      NULL, 'nullify'),
  ('temas_conocimientos',     'tema_id',         'temas',          'conocimientos', NULL, NULL, 'conocimiento_id', NULL, 'nullify'),
  ('temas_conocimientos',     'conocimiento_id', 'conocimientos',  NULL,            NULL, NULL, 'tema_id',         NULL, 'nullify');

COMMIT;
