-- FamilyStars Seed Data
-- Tu familia García/Marín/Talavera

-- 1. Create Families (or get existing)
INSERT INTO families (id, name, color_hex, description, admin_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Paterna', '9B59B6', 'Familia Marín Iniesta', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Materna', '3498DB', 'Familia Talavera Pérez', 'ffffffff-ffff-ffff-ffff-ffffffffffff')
ON CONFLICT (name) DO NOTHING;

-- 2. Create Admin User (Chencho)
INSERT INTO users (id, email, name, role, family_id) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'chencho@example.com', 'Chencho', 'admin', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (email) DO NOTHING;

-- 3. Create Persons - PATERNA (Abuelos)
INSERT INTO persons (id, first_name, last_name, birth_date, birth_place, family_id, status, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'Fulgencio', 'Marín', '1935-03-15', 'Granada', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'), -- Abuelo paterno
  ('550e8400-e29b-41d4-a716-446655440011', 'Isabel', 'Iniesta', '1940-06-20', 'Málaga', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'), -- Abuela paterna
  ('550e8400-e29b-41d4-a716-446655440012', 'Eliseo', 'Marín', '1938-01-10', 'Granada', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'), -- Tío Eliseo
  ('550e8400-e29b-41d4-a716-446655440013', 'Juan Francisco', 'Marín', '1945-09-05', 'Granada', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'); -- Tío Juan Francisco

-- 4. Create Persons - PATERNA (Padres)
INSERT INTO persons (id, first_name, last_name, birth_date, birth_place, family_id, status, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440014', 'Fulgencio', 'Marín', '1960-05-12', 'Granada', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'); -- Tu padre

-- 5. Create Persons - MATERNA (Abuelos)
INSERT INTO persons (id, first_name, last_name, birth_date, birth_place, family_id, status, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440020', 'Manuel', 'Talavera', '1938-02-14', 'Córdoba', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'), -- Abuelo materno
  ('550e8400-e29b-41d4-a716-446655440021', 'Carmen', 'Pérez', '1942-08-30', 'Córdoba', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'), -- Abuela materna
  ('550e8400-e29b-41d4-a716-446655440022', 'María Elena', 'Talavera', '1955-11-22', 'Córdoba', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'), -- Tía María Elena
  ('550e8400-e29b-41d4-a716-446655440023', 'María Fuensanta', 'Talavera', '1958-04-08', 'Córdoba', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'); -- Tía María Fuensanta

-- 6. Create Persons - MATERNA (Madre)
INSERT INTO persons (id, first_name, last_name, birth_date, birth_place, family_id, status, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440024', 'Marisol', 'Talavera', '1962-07-19', 'Córdoba', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'); -- Tu madre

-- 7. Create Persons - TUS HERMANOS (Paterna)
INSERT INTO persons (id, first_name, last_name, birth_date, birth_place, family_id, status, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440030', 'Isabel', 'Marín', '1982-03-25', 'Granada', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'), -- Isabel (hermana)
  ('550e8400-e29b-41d4-a716-446655440031', 'Chencho', 'Marín', '1985-09-10', 'Granada', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'), -- TÚ
  ('550e8400-e29b-41d4-a716-446655440032', 'Andrés', 'Marín', '1988-12-02', 'Granada', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'), -- Andrés (hermano)
  ('550e8400-e29b-41d4-a716-446655440033', 'Marisol', 'Marín', '1992-06-18', 'Granada', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'ffffffff-ffff-ffff-ffff-ffffffffffff'); -- Marisol (hermana)

-- 8. Create Relationships - PATERNA ABUELOS
INSERT INTO relationships (person_a_id, person_b_id, type) VALUES
  -- Fulgencio Marín Piña + Isabel Iniesta = matrimonio
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440011', 'partner'),
  -- Fulgencio Marín Piña es padre de Fulgencio Marín Iniesta
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440014', 'parent'),
  -- Isabel Iniesta es madre de Fulgencio Marín Iniesta
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440014', 'parent'),
  -- Hermanos en paterna
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440012', 'sibling'),
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440013', 'sibling');

-- 9. Create Relationships - MATERNA ABUELOS
INSERT INTO relationships (person_a_id, person_b_id, type) VALUES
  -- Manuel Talavera + Carmen Pérez = matrimonio
  ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440021', 'partner'),
  -- Manuel es padre de Marisol Talavera
  ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440024', 'parent'),
  -- Carmen es madre de Marisol Talavera
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440024', 'parent'),
  -- Hermanas en materna
  ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440022', 'sibling'),
  ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440023', 'sibling');

-- 10. Create Relationships - TUS PADRES (matrimonio)
INSERT INTO relationships (person_a_id, person_b_id, type) VALUES
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440024', 'partner');

-- 11. Create Relationships - TUS PADRES con sus hijos
INSERT INTO relationships (person_a_id, person_b_id, type) VALUES
  -- Fulgencio es padre de sus 4 hijos
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440030', 'parent'),
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440031', 'parent'),
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440032', 'parent'),
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440033', 'parent'),
  -- Marisol es madre de sus 4 hijos
  ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440030', 'parent'),
  ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440031', 'parent'),
  ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440032', 'parent'),
  ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440033', 'parent');

-- 12. Create Relationships - TUS HERMANOS entre si
INSERT INTO relationships (person_a_id, person_b_id, type) VALUES
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440031', 'sibling'), -- Isabel + Chencho
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440032', 'sibling'), -- Isabel + Andrés
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440033', 'sibling'), -- Isabel + Marisol
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440032', 'sibling'), -- Chencho + Andrés
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440033', 'sibling'), -- Chencho + Marisol
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440033', 'sibling'); -- Andrés + Marisol
