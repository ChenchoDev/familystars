# 🌟 FamilyStars

Una aplicación web colaborativa que visualiza árboles genealógicos como constelaciones estelares. Cada persona es una estrella; cada familia, una constelación con su propio color.

**Proyecto**: Regalo para el padre de Chencho, apasionado por la genealogía.
**Estado**: MVP - Fase 2 (Constelación Visual) - Listo para deploy
**Tecnología**: React + Vite, Node.js + Express, PostgreSQL/Neon, Cloudinary

---

## 📚 Documentación

- **[CLAUDE.md](./CLAUDE.md)** — Guía de desarrollo, principios, arquitectura
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Instrucciones para deploy en Vercel + Render
- **[SPEC.md](./SPEC.md)** — Especificación técnica: modelo de datos, API, flujos

---

## ⚡ Quick Start

### Requisitos
- Node.js 18+
- npm/yarn

### Desarrollo Local

1. **Backend**
   ```bash
   cd apps/backend
   npm install
   npm start           # Inicia en puerto 3003
   ```

2. **Frontend**
   ```bash
   cd apps/frontend
   npm install
   npm run dev         # Inicia en http://localhost:5173
   ```

La app usará datos mock si el backend no está disponible.
- Cuenta Resend (free tier)

### 1. Clonar y Setup Inicial

```bash
git clone <repo-url>
cd familystars

# Crear estructura monorepo
mkdir -p apps/{frontend,backend}

# Backend
cd apps/backend
npm init -y
npm install express dotenv pg axios cors helmet
npm install --save-dev nodemon jest @types/node

# Frontend
cd ../frontend
npm create vite@latest . -- --template react
npm install react-router-dom zustand lucide-react axios
```

### 2. Variables de Entorno

#### Backend (`.env`)

```env
# Database
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

# JWT
JWT_SECRET=tu-secreto-muy-largo-y-aleatorio-minimo-64-caracteres
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Resend (emails)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@familystars.app

# App
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=chencho@example.com
NODE_ENV=development
```

#### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=familystars-preset
```

### 3. Base de Datos (Supabase)

Ejecutar en el SQL Editor de Supabase:

```sql
-- Crear tablas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Familias/Constelaciones
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  color_hex CHAR(6) NOT NULL,
  description TEXT,
  admin_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'collaborator',
  family_id UUID REFERENCES families(id),
  invite_token VARCHAR(255),
  invite_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Personas
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE,
  death_date DATE,
  birth_place VARCHAR(255),
  current_location VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),
  family_id UUID NOT NULL REFERENCES families(id),
  status VARCHAR(50) DEFAULT 'pending',
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Relaciones
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_a_id UUID NOT NULL REFERENCES persons(id),
  person_b_id UUID NOT NULL REFERENCES persons(id),
  type VARCHAR(50) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fotos
CREATE TABLE person_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES persons(id),
  cloudinary_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  year INT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Redes Sociales
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES persons(id),
  platform VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  label VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_persons_family ON persons(family_id);
CREATE INDEX idx_persons_status ON persons(status);
CREATE INDEX idx_relationships_persons ON relationships(person_a_id, person_b_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_person_photos_person ON person_photos(person_id);
```

### 4. Iniciar Desarrollo Local

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev

# Abre http://localhost:5173
```

---

## 📁 Estructura del Proyecto

```
familystars/
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── constellation/    # Canvas D3.js
│   │   │   │   ├── profile/          # Panel perfil
│   │   │   │   ├── search/           # Buscador
│   │   │   │   ├── admin/            # Panel admin
│   │   │   │   └── common/           # Shared
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   ├── store/                # Zustand state
│   │   │   ├── pages/
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── backend/
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.js
│       │   │   ├── persons.js
│       │   │   ├── families.js
│       │   │   ├── admin.js
│       │   │   └── index.js
│       │   ├── controllers/
│       │   ├── middleware/
│       │   │   ├── auth.js
│       │   │   ├── roleCheck.js
│       │   │   └── validate.js
│       │   ├── services/
│       │   │   ├── cloudinary.js
│       │   │   ├── email.js
│       │   │   └── jwt.js
│       │   ├── db/
│       │   │   ├── index.js
│       │   │   └── queries.js
│       │   ├── app.js
│       │   └── server.js
│       ├── .env
│       ├── package.json
│       └── .eslintrc.js
│
├── docs/
│   └── API.md
├── CLAUDE.md
├── SPEC.md
├── README.md
└── .gitignore
```

---

## 🎯 Plan de Desarrollo

### Fase 1 — Fundamentos (semanas 1–3)
- [x] Repo setup + ESLint/Prettier
- [ ] BD PostgreSQL en Supabase
- [ ] Express backend MVC
- [ ] Autenticación JWT
- [ ] Magic links (Resend)
- [ ] Endpoints CRUD + tests
- **Entrega**: Endpoints funcionales, auth funcionando

### Fase 2 — Constelación Visual (semanas 4–6)
- [ ] React + Vite setup
- [ ] Canvas D3.js
- [ ] Nodos + líneas de conexión
- [ ] Zoom/pan
- [ ] Buscador
- [ ] Panel perfil
- [ ] Deploy Vercel + Render
- **Entrega**: URL pública con constelación visual

### Fase 3 — Colaboración (semanas 7–8)
- [ ] Sistema de invitaciones
- [ ] Formulario sugerir persona
- [ ] Panel admin moderación
- [ ] Notificaciones email
- [ ] Protección rutas por rol
- **Entrega**: Puedo invitar a tío, él sugiere persona, yo apruebo

### Fase 4 — Perfiles Ricos (semanas 9–10)
- [ ] Cloudinary integration
- [ ] Upload fotos
- [ ] Galería + lightbox
- [ ] Redes sociales
- [ ] Edición perfil
- [ ] Optimización móvil
- **Entrega**: App con perfiles hermosos, responsive

### Fase 5 — Extras (semanas 11–12)
- [ ] Cron job cumpleaños
- [ ] Línea de tiempo
- [ ] Backup al NAS
- [ ] Performance tuning
- [ ] Documentación final
- **Entrega**: MVP completo, ready para familia

---

## 🎨 Diseño Visual

### Paleta de Colores

| Familia | Color | Hex |
|---------|-------|-----|
| Paterna | Lila/Púrpura | `#9B59B6` |
| Materna | Azul Celeste | `#3498DB` |
| Política 1 | Naranja Dorado | `#F39C12` |
| Política 2 | Verde Esmeralda | `#27AE60` |
| Canvas | Azul Noche | `#080C18` |

### Componentes Principales

1. **Canvas Constelación**: D3.js + Canvas API, fondo oscuro con estrellas flotantes
2. **Buscador**: Top bar, búsqueda en tiempo real
3. **Panel Perfil**: Lateral derecho (desktop) / modal inferior (móvil)
4. **Panel Admin**: Vista de pendientes, aprobaciones con un clic
5. **Sistema Invitaciones**: Email + token único por familiar

---

## 🔐 Seguridad

- ✅ Magic links en lugar de contraseñas
- ✅ JWT con expiración 7 días
- ✅ Rate limiting en endpoints críticos
- ✅ Middleware de autorización por rol
- ✅ Fotos subidas directo a Cloudinary
- ✅ CORS restringido a Vercel
- ✅ HTTPS en producción

---

## 📞 Contacto y Colaboración

- **Propietario**: Chencho García
- **Email**: chencho@example.com
- **Rol**: Propietario del proyecto, toma decisiones de UX/diseño
- **Decisiones críticas**: Alinear con Chencho antes de cambios visuales

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Docs](https://react.dev)
- [D3.js Documentation](https://d3js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudinary API](https://cloudinary.com/documentation)

---

## 📝 Licencia

Proyecto privado para uso familiar. © 2026 Chencho García.

---

## 🎉 ¿Por Dónde Empezar?

1. Lee [CLAUDE.md](./CLAUDE.md) para entender la visión
2. Revisa [SPEC.md](./SPEC.md) para detalles técnicos
3. Sigue la sección **Quick Start** arriba
4. Comienza con Fase 1 (setup + BD)
5. En cada sesión: revisa CLAUDE.md para contexto

**¡Vamos a hacer esto hermoso!** ✨
