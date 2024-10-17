CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- UUID como ID único
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    status BOOLEAN DEFAULT TRUE,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,  -- Referencia al rol
    photo TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- UUID como ID único
    name VARCHAR(50) UNIQUE NOT NULL,               -- Ejemplo: 'admin', 'student', 'family'
    permissions UUID[],                             -- IDs de permisos asociados
    access_scope VARCHAR(20) NOT NULL,              -- 'all' o 'own'
    is_default BOOLEAN DEFAULT FALSE,               -- Rol por defecto si aplica
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),                     -- UUID como ID único
    name VARCHAR(50) NOT NULL,                                          -- Path de la API
    method VARCHAR(50) NOT NULL,                                        -- Ejemplo: get, put, post, delete
    users UUID[],                                                       -- IDs de usuarios asociados a este permiso
    is_default BOOLEAN DEFAULT FALSE,                                   -- Permiso por defecto si aplica
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE student_family (
    id_user_student UUID REFERENCES users(id) ON DELETE CASCADE,  -- Estudiante
    id_user_familiar UUID REFERENCES users(id) ON DELETE CASCADE, -- Familiar
    is_ruc BOOLEAN DEFAULT FALSE,  -- Si es responsable de facturación
    is_facturar BOOLEAN DEFAULT FALSE,  -- Si va a facturar
    PRIMARY KEY (id_user_student, id_user_familiar)
);

CREATE TABLE student_pensions (
    id_user_student UUID REFERENCES users(id) ON DELETE CASCADE,  -- Estudiante
    id_school_cycle UUID REFERENCES school_cycles(id) ON DELETE CASCADE,  -- Ciclo escolar relacionado
    id_pension UUID REFERENCES pensions(id) ON DELETE CASCADE,     -- Pensión
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id_user_student, id_pension, id_school_cycle)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- UUID como ID único
    total NUMERIC(10, 2) NOT NULL,                  -- Monto total del pago
    id_user_student UUID REFERENCES users(id),      -- Estudiante relacionado al pago
    status VARCHAR(50) NOT NULL,                    -- Estado del pago (‘registrado’, ‘emitido’.)
    id_user_familiar UUID REFERENCES users(id),     -- Familiar al que se le facturó el pago
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- UUID como ID único
    amount NUMERIC(10, 2) NOT NULL,                  -- Monto pagado
    is_partial BOOLEAN DEFAULT FALSE,                -- Si es un abono parcial
    status VARCHAR(50) NOT NULL,                     -- Estado del pago (‘atrasado’, ‘a tiempo’, ‘anticipado’, etc.)
    id_payment UUID REFERENCES payments(id) ON DELETE CASCADE,  -- Referencia al pago
    id_pension UUID REFERENCES pensions(id),         -- Pensión relacionada
    id_rubro UUID REFERENCES rubros(id),             -- Rubro relacionado
    id_scholarship UUID REFERENCES scholarships(id), -- Beca relacionada
    id_school_cycle UUID REFERENCES school_cycles(id), -- Ciclo escolar relacionado
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- UUID como ID único
    amount NUMERIC(10, 2) NOT NULL,                 -- Monto total del documento
    balance NUMERIC(10, 2) NOT NULL,                -- Saldo pendiente
    deposit_account VARCHAR(100),                   -- Cuenta de depósito
    deposit_date DATE NOT NULL,                     -- Fecha del depósito
    description TEXT,                               -- Descripción del documento
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE document_payment_details (
    id_document UUID REFERENCES documents(id) ON DELETE CASCADE,      -- Documento relacionado
    id_payment_detail UUID REFERENCES payment_details(id) ON DELETE CASCADE,  -- Detalle de pago relacionado
    PRIMARY KEY (id_document, id_payment_detail)
);

 
CREATE TABLE school_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- UUID como ID único
    name VARCHAR(100) NOT NULL,                     -- Nombre del ciclo escolar
    modality VARCHAR(50),                           -- Modalidad (presencial, virtual, etc.)
    start_date DATE NOT NULL,                       -- Fecha de inicio
    end_date DATE NOT NULL,                         -- Fecha de fin
    base_name VARCHAR(100) NOT NULL,    -- Nombre de la base de datos sin espacios y minúsculas para el TRIGGER
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);







--BASE DE DATOS DE CICLOS ESCOLARES
CREATE TABLE rubros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- UUID como ID único
    amount NUMERIC(10, 2) NOT NULL,                 -- Monto del rubro
    due_date DATE NOT NULL,                         -- Fecha de cobro
    isn_scholarships BOOLEAN DEFAULT FALSE,  -- Si no se puede becar
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY       --Incremental para saber a qué curso va el próximo ciclo escolar
    name VARCHAR(100) NOT NULL,                                         -- Nombre del curso (Ej: "Matemáticas", "Ciencias")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE parallels (
    id SERIAL PRIMARY KEY --Incremental para saber a qué paralelo mandarlo en caso de que allá un máximo
    id_course UUID REFERENCES courses(id) ON DELETE CASCADE,            -- Curso relacionado
    name VARCHAR(50) NOT NULL,                                          -- Nombre del paralelo (Ej: "A", "B")
    max_capacity INT NOT NULL,                                          -- Capacidad máxima de estudiantes en este paralelo
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),                     -- UUID como ID único
    id_user_student UUID REFERENCES users(id) ON DELETE CASCADE,        -- Estudiante relacionado
    id_course UUID REFERENCES courses(id) ON DELETE CASCADE,            -- Curso en el que está inscrito
    id_parallel UUID REFERENCES parallels(id) ON DELETE CASCADE,        -- Paralelo relacionado
    status VARCHAR(50) NOT NULL,                                        -- Estado de la pensión (activo, inactivo)
    disabled_date DATE,                                                -- Fecha de desactivación (si aplica)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scholarships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- UUID como ID único
    id_pension UUID REFERENCES pensions(id) ON DELETE CASCADE,    -- Pensión relacionada
    id_rubro UUID REFERENCES rubros(id) ON DELETE CASCADE,        -- Rubro relacionado
    amount NUMERIC(10, 2) NOT NULL,                              -- Monto de la beca
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
