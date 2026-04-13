import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const migrations = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Families (Constelaciones)
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  color_hex CHAR(6) NOT NULL,
  description TEXT,
  admin_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'collaborator' CHECK (role IN ('admin', 'collaborator', 'viewer')),
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  invite_token VARCHAR(255) UNIQUE,
  invite_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Persons
CREATE TABLE IF NOT EXISTS persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE,
  death_date DATE,
  birth_place VARCHAR(255),
  current_location VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Relationships
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_a_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  person_b_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('parent', 'child', 'partner', 'sibling', 'cousin', 'other')),
  verified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Person Photos
CREATE TABLE IF NOT EXISTS person_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  cloudinary_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  year INT,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Social Links
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'facebook', 'linkedin', 'twitter', 'other')),
  url VARCHAR(500) NOT NULL,
  label VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Magic Link Tokens
CREATE TABLE IF NOT EXISTS magic_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_persons_family ON persons(family_id);
CREATE INDEX IF NOT EXISTS idx_persons_status ON persons(status);
CREATE INDEX IF NOT EXISTS idx_persons_created_by ON persons(created_by);
CREATE INDEX IF NOT EXISTS idx_relationships_person_a ON relationships(person_a_id);
CREATE INDEX IF NOT EXISTS idx_relationships_person_b ON relationships(person_b_id);
CREATE INDEX IF NOT EXISTS idx_relationships_verified ON relationships(verified);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users(invite_token);
CREATE INDEX IF NOT EXISTS idx_person_photos_person ON person_photos(person_id);
CREATE INDEX IF NOT EXISTS idx_person_photos_approved ON person_photos(approved);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_email ON magic_tokens(email);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_token ON magic_tokens(token);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_expires ON magic_tokens(expires_at);
`;

async function runMigrations() {
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('🔄 Running migrations...');
    await client.query(migrations);
    console.log('✅ Migrations completed successfully');

    // Insert initial families
    const initialFamilies = [
      { name: 'Paterna', color: '9B59B6', description: 'Familia del padre (apellido paterno)' },
      { name: 'Materna', color: '3498DB', description: 'Familia de la madre (apellido materno)' },
      { name: 'Política 1', color: 'F39C12', description: 'Familia de la esposa' },
      { name: 'Política 2', color: '27AE60', description: 'Familia de cuñados' },
    ];

    // Create system admin user first
    const SYSTEM_ADMIN_ID = '00000000-0000-0000-0000-000000000000';
    await client.query(
      'INSERT INTO users (id, email, name, role) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
      [SYSTEM_ADMIN_ID, 'system@familystars.app', 'System Admin', 'admin']
    );

    console.log('🔄 Inserting initial families...');
    for (const family of initialFamilies) {
      const result = await client.query(
        'INSERT INTO families (name, color_hex, description, admin_id) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id',
        [family.name, family.color, family.description, SYSTEM_ADMIN_ID]
      );
      if (result.rows.length > 0) {
        console.log(`  ✅ Created family: ${family.name}`);
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
