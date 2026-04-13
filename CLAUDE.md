# FamilyStars — Guía de Desarrollo para Claude

## 🌟 Resumen Ejecutivo

**FamilyStars** es una aplicación web colaborativa que visualiza árboles genealógicos como constelaciones estelares. Cada persona es una estrella; cada familia, una constelación con su propio color. El proyecto es un regalo del propietario (Chencho) a su padre, con intención de convertirse en una herramienta colaborativa familiar.

- **Stack**: React + Vite (frontend), Node.js + Express (backend), PostgreSQL + Supabase (BD)
- **Hosting**: Vercel (frontend), Render.com (backend), Cloudinary (fotos)
- **Estado**: MVP — Fase de desarrollo inicial
- **Propietario**: Chencho (chencho@familystars.app)
- **Plazo**: 12 semanas (3 meses)

## 🎯 Principios de Desarrollo

1. **Visual First**: la constelación es la interfaz principal, no un árbol de texto tradicional
2. **Colaborativo**: cualquier familiar puede sugerir cambios, pero nada se publica sin aprobación del admin
3. **Privacidad gradual**: datos públicos visibles para todos, datos sensibles solo para miembros verificados
4. **Mobile-first**: diseñado para compartir por WhatsApp y usable en móvil
5. **Costo cero MVP**: todo en tier gratuito hasta escalar
6. **Migración futura**: fácil de migrar al NAS Asustor doméstico cuando se necesite

## 🏗️ Arquitectura Global

```
Usuario
  ↓ (HTTPS/REST)
React + Vite (Vercel)
  ↓ REST API
Express + Node.js (Render)
  ↓ SQL
PostgreSQL (Supabase) + Cloudinary (fotos)
```

## 📊 Modelo de Datos Core

### Tablas principales:
- **persons**: toda la información de cada persona (nombre, fotos, bio, familia)
- **relationships**: conexiones entre personas (padre, hijo, hermano, cónyuge, etc.)
- **families**: definición de las constelaciones (color, admin, descripción)
- **users**: usuarios registrados con rol (admin, colaborador, visitante)
- **person_photos**: fotos por persona (Cloudinary)
- **social_links**: perfiles externos (Instagram, LinkedIn, etc.)

### Estados de aprobación:
- `pending` — el usuario sugirió, espera aprobación del admin
- `approved` — visible en la constelación pública
- `rejected` — descartado por el admin (opcional: con nota explicativa)

## 👥 Sistema de Permisos (3 roles)

| Acción | Admin | Colaborador | Visitante |
|--------|-------|-------------|-----------|
| Ver constelación | ✅ | ✅ | ✅ |
| Ver perfiles completos | ✅ | ✅ | ⚠️ básicos |
| Sugerir persona | ✅ directo | ✅ pendiente | ❌ |
| Aprobar sugerencias | ✅ | ❌ | ❌ |
| Invitar colaboradores | ✅ | ❌ | ❌ |
| Subir fotos | ✅ directo | ✅ pendiente | ❌ |
| Ver datos pendientes | ✅ | ❌ | ❌ |

## 🔐 Autenticación

- **Sistema**: magic links (sin contraseñas)
- **Proveedor**: Resend.com para emails
- **Tokens**: JWT con exp de 7 días
- **Invitaciones**: tokens únicos por familar, válidos 7 días o primer uso (lo que ocurra primero)

## 📱 Interfaz de Usuario

### Canvas Principal (toda la pantalla)
- Fondo oscuro (#080C18 — azul noche profundo)
- 120 estrellas de fondo con animación de titileo
- Estrellas-persona: 20–36px, color por familia, foto circular adentro
- Interacción: arrastrar (pan), rueda/pinch (zoom 0.3–2.5x), clic (perfil)

### Búsqueda
- Barra superior central
- Busca por: nombre, apellido, familia, rol, lugar
- Resultado: pan + zoom animado, abre perfil automáticamente

### Panel de Perfil
- Lateral derecha (desktop) o modal inferior (móvil)
- Avatar grande, datos básicos, relaciones, galería de fotos, redes sociales
- Botones de acción según rol

### Panel Admin (post-MVP inmediato)
- Vista de pendientes (personas, fotos, relaciones por aprobar)
- Gestor de usuarios (roles, revocar acceso)
- Stats básicos (total personas, familias, colaboradores activos)

## 📋 Fases de Desarrollo

### Fase 1 — Fundamentos (semanas 1–3)
- Repo setup, ESLint, Prettier
- Esquema PostgreSQL en Supabase
- Express con MVC, middleware JWT
- Magic links con Resend
- Endpoints básicos + tests

### Fase 2 — Constelación Visual (semanas 4–6)
- React + Vite setup
- Canvas D3.js con nodos, líneas, zoom, pan
- Buscador en tiempo real
- Panel de perfil
- Deploy en Vercel + Render

### Fase 3 — Colaboración (semanas 7–8)
- Sistema de invitaciones
- Formulario "Sugerir persona"
- Panel admin de moderación
- Notificaciones por email
- Protección de rutas por rol

### Fase 4 — Perfiles Ricos (semanas 9–10)
- Cloudinary: upload, recorte circular
- Galería de fotos con lightbox
- Redes sociales
- Edición de perfil
- Optimización móvil

### Fase 5 — Extras (semanas 11–12)
- Notificaciones de cumpleaños
- Línea de tiempo
- Backup al NAS
- Performance tuning
- Documentación

## 🔧 Variables de Entorno

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
EMAIL_FROM=noreply@familystars.app
FRONTEND_URL=https://familystars.vercel.app
ADMIN_EMAIL=chencho@...
NODE_ENV=production
```

### Frontend (.env)
```
VITE_API_URL=https://familystars-api.onrender.com
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=familystars-preset
```

## 📁 Estructura de Carpetas

```
familystars/
├── apps/
│   ├── frontend/              # React + Vite
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── constellation/  # Canvas D3.js
│   │   │   │   ├── profile/        # Panel perfil
│   │   │   │   ├── search/         # Buscador
│   │   │   │   └── admin/          # Panel admin
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   ├── context/
│   │   │   ├── utils/
│   │   │   └── styles/
│   │   └── vite.config.js
│   └── backend/               # Node.js + Express
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── models/
│       │   ├── services/
│       │   └── db/
│       └── package.json
├── docs/
├── SPEC.md
├── CLAUDE.md
└── .gitignore
```

## ⚡ Decisiones Técnicas Clave

1. **D3.js + Canvas** (no three.js): balance perfecto entre rendimiento visual y facilidad de desarrollo
2. **Supabase + PostgreSQL**: gestión de auth simplificada, datos relacionales, fácil escalar
3. **Magic links sin contraseñas**: UX más limpia, menos fricción en invitaciones
4. **Monorepo simple** (sin nx/turborepo aún): simplicidad MVP, escalable después
5. **Vercel + Render**: cold start aceptable, costo cero tier gratuito, deploy simple
6. **Cloudinary directo desde cliente**: menos carga backend, más rápido

## 🎨 Guía de Diseño Visual

### Colores de Constelación (iniciales)
- **Paterna** (padre): Lila / púrpura (#9B59B6)
- **Materna** (madre): Azul celeste (#3498DB)
- **Política 1** (esposa): Naranja dorado (#F39C12)
- **Política 2** (cuñados): Verde esmeralda (#27AE60)
- **Canvas fondo**: Azul noche profundo (#080C18)

### Líneas de Conexión
- Padre/hijo/hermano: curva sutil, color familia, opacidad 0.35 o 0.25
- Matrimonio (misma familia): discontinua blanca, opacidad 0.22
- Matrimonio (entre familias): discontinua dorada (#C9A84C), opacidad 0.35, grosor 1.5px

### Tipografía
- Títulos: sans-serif moderno (Segoe UI, -apple-system)
- Body: mismo sans-serif, 14–16px
- Monospace (si): código/tokens

## 📞 Contacto & Escalada

- **Propietario**: Chencho
- **Admin principal**: Chencho (chencho@...)
- **Slack/Discord**: [por definir si es needed]
- **Decisiones de UX**: alinear con el propietario antes de implementar cambios visuales grandes

## 🚀 Checklist Pre-MVP

- [ ] Repo en Git con estructura monorepo
- [ ] Supabase: BD creada, esquema completo, usuarios iniciales
- [ ] Render: proyecto creado, variables de entorno configuradas
- [ ] Vercel: proyecto creado, conexión a Git
- [ ] Cloudinary: cuenta setup, presets configurados
- [ ] Resend: API key, emails autenticados
- [ ] Familia de ejemplo (García/Rodríguez/Navarro) poblada en BD
- [ ] Primeros tests pasando (endpoints básicos)
- [ ] URL pública funcional (Fase 2 completada)
- [ ] Admin puede moderar contenido (Fase 3 completada)

---

**Última actualización**: Abril 2026
**Versión del documento**: 1.0
