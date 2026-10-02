-- YOU SCHOOL - Row Level Security (RLS) Policies for Public Access
-- These policies enable read-only public access to the curriculum and content

-- ============================================================
-- GRANT SELECT to anon role (required for public access)
-- ============================================================

GRANT SELECT ON idiomas TO anon;
GRANT SELECT ON paises TO anon;
GRANT SELECT ON curriculas TO anon;
GRANT SELECT ON niveles TO anon;
GRANT SELECT ON anios TO anon;
GRANT SELECT ON materias TO anon;
GRANT SELECT ON unidades TO anon;
GRANT SELECT ON temas TO anon;
GRANT SELECT ON conocimientos TO anon;
GRANT SELECT ON bloques_contenido TO anon;
GRANT SELECT ON lecciones_conocimientos TO anon;
GRANT SELECT ON temas_conocimientos TO anon;
GRANT SELECT ON etiquetas TO anon;
GRANT SELECT ON lecciones_etiquetas TO anon;
GRANT SELECT ON fuentes TO anon;
GRANT SELECT ON lecciones TO anon;
GRANT SELECT ON ubicaciones_curriculares TO anon;

-- ============================================================
-- Enable RLS on all tables (should already be enabled)
ALTER TABLE idiomas ENABLE ROW LEVEL SECURITY;
ALTER TABLE paises ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE niveles ENABLE ROW LEVEL SECURITY;
ALTER TABLE anios ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conocimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloques_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecciones_conocimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE temas_conocimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecciones_etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE ubicaciones_curriculares ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: Public Read Access (no restriction)
-- ============================================================

-- idiomas: Public read
DROP POLICY IF EXISTS "Public read idiomas" ON idiomas;
CREATE POLICY "Public read idiomas" ON idiomas
    FOR SELECT USING (true);

-- paises: Public read
DROP POLICY IF EXISTS "Public read paises" ON paises;
CREATE POLICY "Public read paises" ON paises
    FOR SELECT USING (true);

-- curriculas: Public read
DROP POLICY IF EXISTS "Public read curriculas" ON curriculas;
CREATE POLICY "Public read curriculas" ON curriculas
    FOR SELECT USING (true);

-- niveles: Public read
DROP POLICY IF EXISTS "Public read niveles" ON niveles;
CREATE POLICY "Public read niveles" ON niveles
    FOR SELECT USING (true);

-- anios: Public read
DROP POLICY IF EXISTS "Public read anios" ON anios;
CREATE POLICY "Public read anios" ON anios
    FOR SELECT USING (true);

-- materias: Public read
DROP POLICY IF EXISTS "Public read materias" ON materias;
CREATE POLICY "Public read materias" ON materias
    FOR SELECT USING (true);

-- unidades: Public read
DROP POLICY IF EXISTS "Public read unidades" ON unidades;
CREATE POLICY "Public read unidades" ON unidades
    FOR SELECT USING (true);

-- temas: Public read
DROP POLICY IF EXISTS "Public read temas" ON temas;
CREATE POLICY "Public read temas" ON temas
    FOR SELECT USING (true);

-- conocimientos: Public read
DROP POLICY IF EXISTS "Public read conocimientos" ON conocimientos;
CREATE POLICY "Public read conocimientos" ON conocimientos
    FOR SELECT USING (true);

-- bloques_contenido: Public read
DROP POLICY IF EXISTS "Public read bloques_contenido" ON bloques_contenido;
CREATE POLICY "Public read bloques_contenido" ON bloques_contenido
    FOR SELECT USING (true);

-- lecciones_conocimientos: Public read
DROP POLICY IF EXISTS "Public read lecciones_conocimientos" ON lecciones_conocimientos;
CREATE POLICY "Public read lecciones_conocimientos" ON lecciones_conocimientos
    FOR SELECT USING (true);

-- temas_conocimientos: Public read
DROP POLICY IF EXISTS "Public read temas_conocimientos" ON temas_conocimientos;
CREATE POLICY "Public read temas_conocimientos" ON temas_conocimientos
    FOR SELECT USING (true);

-- etiquetas: Public read
DROP POLICY IF EXISTS "Public read etiquetas" ON etiquetas;
CREATE POLICY "Public read etiquetas" ON etiquetas
    FOR SELECT USING (true);

-- lecciones_etiquetas: Public read
DROP POLICY IF EXISTS "Public read lecciones_etiquetas" ON lecciones_etiquetas;
CREATE POLICY "Public read lecciones_etiquetas" ON lecciones_etiquetas
    FOR SELECT USING (true);

-- fuentes: Public read
DROP POLICY IF EXISTS "Public read fuentes" ON fuentes;
CREATE POLICY "Public read fuentes" ON fuentes
    FOR SELECT USING (true);

-- ============================================================
-- POLICIES: Public Read - ONLY if estado = 'publicado'
-- ============================================================

-- lecciones: Only public if estado = 'publicado'
DROP POLICY IF EXISTS "Public read lecciones publicadas" ON lecciones;
CREATE POLICY "Public read lecciones publicadas" ON lecciones
    FOR SELECT USING (estado = 'publicado');

-- ubicaciones_curriculares: Only public if estado = 'publicado'
DROP POLICY IF EXISTS "Public read ubicaciones curriculares publicadas" ON ubicaciones_curriculares;
CREATE POLICY "Public read ubicaciones curriculares publicadas" ON ubicaciones_curriculares
    FOR SELECT USING (estado = 'publicado');
