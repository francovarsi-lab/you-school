-- YOU SCHOOL - Database Schema
-- Three-layer architecture: Knowledge, Curriculum, Connection

-- ============================================================
-- CAPA 1: CONOCIMIENTO (Knowledge Layer)
-- ============================================================

-- Idiomas
CREATE TABLE IF NOT EXISTS idiomas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fuentes (Sources)
CREATE TABLE IF NOT EXISTS fuentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),
    url TEXT,
    licencia VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conocimientos (Knowledge atoms)
CREATE TABLE IF NOT EXISTS conocimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lecciones (Lessons)
CREATE TABLE IF NOT EXISTS lecciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    idioma_id UUID NOT NULL REFERENCES idiomas(id) ON DELETE RESTRICT,
    duracion_estimada INTEGER,
    estado VARCHAR(50) DEFAULT 'borrador',
    slug VARCHAR(255) NOT NULL UNIQUE,
    fuente_id UUID REFERENCES fuentes(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bloques de Contenido (Content blocks)
CREATE TABLE IF NOT EXISTS bloques_contenido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leccion_id UUID NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL,
    orden INTEGER NOT NULL,
    referencia TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relación Lecciones <-> Conocimientos (Many-to-many)
CREATE TABLE IF NOT EXISTS lecciones_conocimientos (
    leccion_id UUID NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
    conocimiento_id UUID NOT NULL REFERENCES conocimientos(id) ON DELETE CASCADE,
    PRIMARY KEY (leccion_id, conocimiento_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CAPA 2: CURRICULAR (Curriculum Layer)
-- ============================================================

-- Países
CREATE TABLE IF NOT EXISTS paises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Currículas (Curricula/syllabus)
CREATE TABLE IF NOT EXISTS curriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pais_id UUID REFERENCES paises(id) ON DELETE SET NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Niveles (Grade levels)
CREATE TABLE IF NOT EXISTS niveles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curricula_id UUID NOT NULL REFERENCES curriculas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    orden INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Años (Years within levels)
CREATE TABLE IF NOT EXISTS anios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nivel_id UUID NOT NULL REFERENCES niveles(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    orden INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materias (Subjects)
CREATE TABLE IF NOT EXISTS materias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anio_id UUID NOT NULL REFERENCES anios(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    orden INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unidades (Units)
CREATE TABLE IF NOT EXISTS unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    orden INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Temas (Topics)
CREATE TABLE IF NOT EXISTS temas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    orden INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CAPA 3: CONEXIÓN (Connection Layer)
-- ============================================================

-- Relación Temas <-> Conocimientos (Many-to-many, optional)
CREATE TABLE IF NOT EXISTS temas_conocimientos (
    tema_id UUID NOT NULL REFERENCES temas(id) ON DELETE CASCADE,
    conocimiento_id UUID NOT NULL REFERENCES conocimientos(id) ON DELETE CASCADE,
    PRIMARY KEY (tema_id, conocimiento_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ubicaciones Curriculares (Curriculum placements for lessons)
CREATE TABLE IF NOT EXISTS ubicaciones_curriculares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leccion_id UUID NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
    tema_id UUID NOT NULL REFERENCES temas(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL,
    estado VARCHAR(50) DEFAULT 'borrador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Etiquetas (Tags)
CREATE TABLE IF NOT EXISTS etiquetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relación Lecciones <-> Etiquetas (Many-to-many)
CREATE TABLE IF NOT EXISTS lecciones_etiquetas (
    leccion_id UUID NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
    etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
    PRIMARY KEY (leccion_id, etiqueta_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ÍNDICES (Indexes for performance)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_lecciones_idioma_id ON lecciones(idioma_id);
CREATE INDEX IF NOT EXISTS idx_lecciones_fuente_id ON lecciones(fuente_id);
CREATE INDEX IF NOT EXISTS idx_lecciones_slug ON lecciones(slug);
CREATE INDEX IF NOT EXISTS idx_bloques_contenido_leccion_id ON bloques_contenido(leccion_id);
CREATE INDEX IF NOT EXISTS idx_lecciones_conocimientos_leccion_id ON lecciones_conocimientos(leccion_id);
CREATE INDEX IF NOT EXISTS idx_lecciones_conocimientos_conocimiento_id ON lecciones_conocimientos(conocimiento_id);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_curriculares_leccion_id ON ubicaciones_curriculares(leccion_id);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_curriculares_tema_id ON ubicaciones_curriculares(tema_id);
CREATE INDEX IF NOT EXISTS idx_temas_conocimientos_tema_id ON temas_conocimientos(tema_id);
CREATE INDEX IF NOT EXISTS idx_temas_conocimientos_conocimiento_id ON temas_conocimientos(conocimiento_id);
CREATE INDEX IF NOT EXISTS idx_lecciones_etiquetas_leccion_id ON lecciones_etiquetas(leccion_id);
CREATE INDEX IF NOT EXISTS idx_lecciones_etiquetas_etiqueta_id ON lecciones_etiquetas(etiqueta_id);
CREATE INDEX IF NOT EXISTS idx_niveles_curricula_id ON niveles(curricula_id);
CREATE INDEX IF NOT EXISTS idx_anios_nivel_id ON anios(nivel_id);
CREATE INDEX IF NOT EXISTS idx_materias_anio_id ON materias(anio_id);
CREATE INDEX IF NOT EXISTS idx_unidades_materia_id ON unidades(materia_id);
CREATE INDEX IF NOT EXISTS idx_temas_unidad_id ON temas(unidad_id);
