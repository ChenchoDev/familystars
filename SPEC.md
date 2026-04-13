# FamilyStars — Especificación Técnica Completa

**Versión**: 1.0 — MVP
**Autor**: Chencho (propietario)
**Fecha**: Abril 2026
**Destino**: Desarrollo e implementación

---

## 📑 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura Técnica](#arquitectura-técnica)
3. [Modelo de Datos](#modelo-de-datos)
4. [Sistema de Permisos](#sistema-de-permisos)
5. [Interfaz de Usuario](#interfaz-de-usuario)
6. [API REST](#api-rest)
7. [Flujos de Negocio](#flujos-de-negocio)
8. [Plan de Desarrollo](#plan-de-desarrollo)
9. [Despliegue](#despliegue)
10. [Consideraciones de Seguridad](#consideraciones-de-seguridad)

---

## 🌟 Visión General

### Descripción

**FamilyStars** es una aplicación web colaborativa e interactiva que visualiza árboles genealógicos familiares como constelaciones estelares.

- Cada **persona** es una **estrella** en el espacio (canvas)
- Cada **familia** es una **constelación** con su propio color y territorio visual
- Las **uniones** (matrimonios) se representan como **líneas de conexión**:
  - Líneas curvas sutiles para relaciones parentales
  - Líneas doradas discontinuas para matrimonios entre familias

### Origen y Propósito

El proyecto nació como **regalo para el padre del propietario**, apasionado por la genealogía. La intención es convertirlo en un **espacio colaborativo** donde toda la familia pueda participar ampliando el árbol a lo largo del tiempo.

### Objetivo Principal

Construir una **app web colaborativa, moderna y de acceso controlado** donde las familias puedan:
- Visualizar su árbol genealógico de forma progresiva
- Completar y mejorar los datos existentes
- Compartir historias familiares y fotos
- Confiar en que los datos están moderados y verificados

### Principios de Diseño

| Principio | Descripción |
|-----------|-------------|
| **Visual Primero** | La constelación es la interfaz, no un árbol de texto |
| **Colaborativo** | Cualquier familiar puede sugerir personas nuevas y fotos |
| **Moderado** | Ningún dato aparece sin aprobación del administrador |
| **Privacidad gradual** | Datos sensibles solo visibles para miembros verificados |
| **Mobile-first** | Diseñado para compartir por WhatsApp y usar en móvil |

### Familias Iniciales

El árbol comenzará con las siguientes ramas familiares:

| Constelación | Familia | Color Primario | Descripción |
|---|---|---|---|
| **Paterna** | Familia del padre (apellido paterno) | Lila/Púrpura (#9B59B6) | Rama ancestral del lado paterno |
| **Materna** | Familia de la madre (apellido materno) | Azul Celeste (#3498DB) | Rama ancestral del lado materno |
| **Política 1** | Familia de la esposa | Naranja Dorado (#F39C12) | Incorporados por matrimonio |
| **Política 2** | Familia de cuñados (expansible) | Verde Esmeralda (#27AE60) | Extensión natural de Política 1 |

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

El stack está seleccionado para maximizar:
- **Velocidad de desarrollo**
- **Costo cero en fase MVP** (todos los servicios en tier gratuito)
- **Facilidad de migración futura** al NAS doméstico del propietario

| Capa | Tecnología | Servicio | Tier Gratuito |
|------|-----------|---------|---|
| **Frontend** | React 18 + Vite | Vercel | Ilimitado (proyectos personales) |
| **Backend API** | Node.js + Express | Render.com | 750 h/mes |
| **Base de Datos** | PostgreSQL | Supabase | 500 MB, 2 proyectos |
| **Almacenamiento Fotos** | Cloudinary SDK | Cloudinary | 25 GB + transformaciones |
| **Autenticación** | JWT + Magic Links | Resend.com | 3.000 emails/mes |
| **Visualización** | D3.js / Canvas API | Incluido | — |

### Flujo de Datos

```
┌──────────────────────┐
│  Usuario / Familiar  │
└──────────┬───────────┘
           │ HTTPS/REST
           ▼
┌──────────────────────────────┐
│  Vercel                      │
│  (React + Vite)              │
│  Assets estáticos + Canvas   │
└──────────┬───────────────────┘
           │ REST API
           ▼
┌──────────────────────────────┐
│  Render.com                  │
│  (Express + Node.js)         │
└──────────┬────────────────────┘
           │
      ┌────┴────┐
      ▼         ▼
    SQL      Cloudinary
      │         │
      ▼         ▼
   Supabase   Fotos +
   (PostgreSQL) Avatares
      │
      ▼
  NAS Asustor
  (Backup nocturno)
```

---

## 📊 Modelo de Datos

### Tabla: `persons`

Información de cada persona en el árbol genealógico.

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| `id` | UUID | NO | Identificador único |
| `first_name` | VARCHAR(100) | NO | Nombre de pila |
| `last_name` | VARCHAR(100) | NO | Apellido(s) |
| `birth_date` | DATE | SÍ | Fecha de nacimiento (aproximada aceptable) |
| `death_date` | DATE | SÍ | Fecha de fallecimiento (opcional) |
| `birth_place` | VARCHAR(255) | SÍ | Lugar de nacimiento |
| `current_location` | VARCHAR(255) | SÍ | Lugar de residencia actual |
| `bio` | TEXT | SÍ | Texto biográfico corto (libre, max 500 chars) |
| `avatar_url` | VARCHAR(500) | SÍ | URL de Cloudinary para foto de perfil |
| `family_id` | UUID | NO | FK → `families.id` |
| `status` | ENUM (pending, approved, rejected) | NO | Estado de moderación |
| `created_by` | UUID | NO | FK → `users.id` |
| `approved_by` | UUID | SÍ | FK → `users.id` (admin que aprobó) |
| `created_at` | TIMESTAMP | NO | Timestamp de creación |
| `updated_at` | TIMESTAMP | NO | Timestamp de última edición |

**Índices**:
- `(family_id, status)` — búsqueda por familia y estado
- `(created_by)` — historial de contribuciones por usuario
- `(first_name, last_name)` — búsqueda por nombre

---

### Tabla: `relationships`

Conexiones entre personas (parentesco, matrimonio, etc.)

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| `id` | UUID | NO | Identificador único |
| `person_a_id` | UUID | NO | FK → `persons.id` (origen) |
| `person_b_id` | UUID | NO | FK → `persons.id` (destino) |
| `type` | ENUM (parent, child, partner, sibling, cousin, other) | NO | Tipo de relación |
| `verified` | BOOLEAN | NO | Aprobada por admin (default: false) |
| `notes` | TEXT | SÍ | Notas aclaratorias (ej: "matrimonio 1925") |
| `created_at` | TIMESTAMP | NO | Timestamp de creación |

**Índices**:
- `(person_a_id, type)` — relaciones de una persona
- `(person_b_id, type)` — relaciones inversas
- `(verified)` — filtrar solo relaciones aprobadas en canvas

**Notas**:
- Una relación "parent" de A→B significa "A es padre de B"
- Se puede usar para bidireccionales (ej: "partner" es implícitamente bidireccional)
- Las relaciones no aprobadas no aparecen en el canvas público

---

### Tabla: `families` (Constelaciones)

Definición de cada constelación/rama familiar.

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| `id` | UUID | NO | Identificador único |
| `name` | VARCHAR(100) | NO | Nombre (ej: "Familia García") |
| `color_hex` | CHAR(6) | NO | Color hex sin # (ej: "9B59B6") |
| `description` | TEXT | SÍ | Texto de presentación |
| `admin_id` | UUID | NO | FK → `users.id` (admin de esta rama) |
| `created_at` | TIMESTAMP | NO | Timestamp de creación |

**Inicial**:
- Paterna (#9B59B6)
- Materna (#3498DB)
- Política 1 (#F39C12)
- Política 2 (#27AE60)

---

### Tabla: `person_photos`

Galería de fotos por persona.

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| `id` | UUID | NO | Identificador único |
| `person_id` | UUID | NO | FK → `persons.id` |
| `cloudinary_url` | VARCHAR(500) | NO | URL de imagen en Cloudinary |
| `caption` | VARCHAR(255) | SÍ | Pie de foto (opcional) |
| `year` | INT | SÍ | Año aproximado de la foto |
| `uploaded_by` | UUID | NO | FK → `users.id` |
| `approved` | BOOLEAN | NO | Aprobada por admin (default: false) |
| `created_at` | TIMESTAMP | NO | Timestamp de creación |

---

### Tabla: `users`

Usuarios registrados con acceso a la plataforma.

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| `id` | UUID | NO | Identificador único |
| `email` | VARCHAR(255) | NO | Email único |
| `name` | VARCHAR(100) | NO | Nombre mostrado |
| `role` | ENUM (admin, collaborator, viewer) | NO | Rol del usuario |
| `family_id` | UUID | SÍ | FK → `families.id` (familia principal del usuario) |
| `invite_token` | VARCHAR(255) | SÍ | Token de invitación (usado solo una vez) |
| `invite_expires_at` | TIMESTAMP | SÍ | Expiración del token (7 días) |
| `created_at` | TIMESTAMP | NO | Timestamp de registro |

**Índices**:
- `(email)` — búsqueda por correo
- `(invite_token)` — validación de invitaciones

---

### Tabla: `social_links`

Perfiles externos de una persona.

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| `id` | UUID | NO | Identificador único |
| `person_id` | UUID | NO | FK → `persons.id` |
| `platform` | ENUM (instagram, facebook, linkedin, twitter, other) | NO | Red social |
| `url` | VARCHAR(500) | NO | URL del perfil |
| `label` | VARCHAR(100) | SÍ | Etiqueta personalizada |

---

## 👥 Sistema de Permisos

### Roles

Se definen **3 roles** con responsabilidades claramente delimitadas:

#### 1. **Admin** 🔑
- Acceso total a la plataforma
- Puede crear familias/constelaciones nuevas
- Aprueba o rechaza sugerencias de colaboradores
- Puede eliminar personas, fotos, relaciones
- Gestiona invitaciones y roles de otros usuarios
- Ve todos los datos pendientes y rechazados

#### 2. **Collaborator** 👥
- Acceso registrado mediante invitación
- Puede sugerir nuevas personas (quedan pendientes)
- Puede sugerir fotos (quedan pendientes)
- Puede editar su propio perfil
- No ve datos pendientes de otros

#### 3. **Viewer** 👁️
- Acceso público, sin registro (o con magic link simple)
- Solo ve personas aprobadas
- Ver perfiles básicos (nombre, familia, foto)
- No puede sugerir nada

### Matriz de Permisos

| Acción | Admin | Collaborator | Viewer |
|--------|-------|---|---|
| Ver constelación completa | ✅ | ✅ | ✅ |
| Ver perfil completo (bio, lugar nacimiento) | ✅ | ✅ | ⚠️ básico |
| Sugerir nueva persona | ✅ directo | ✅ pendiente | ❌ |
| Editar propio perfil | ✅ | ✅ | ❌ |
| Añadir fotos a persona | ✅ directo | ✅ pendiente | ❌ |
| Aprobar sugerencias | ✅ | ❌ | ❌ |
| Crear nuevas familias | ✅ | ❌ | ❌ |
| Invitar colaboradores | ✅ | ❌ | ❌ |
| Eliminar personas/fotos | ✅ | ❌ | ❌ |
| Ver datos pendientes | ✅ | ❌ | ❌ |

---

### Flujo de Moderación

Toda contribución de un colaborador sigue este flujo:

```
┌─────────────────────────┐
│ Colaborador sugiere     │
│ (persona, foto, etc.)   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Guardado en BD con      │
│ status = "pending"      │
│ (invisible públicamente)│
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Admin recibe            │
│ notificación por email  │
└────────────┬────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
  APRUEBA       RECHAZA
      │             │
      ▼             ▼
 status =       status =
 "approved"    "rejected"
 Visible en    Nota opcional
 constelación  a colaborador
```

**Notificaciones por email**: el admin recibe un email a `ADMIN_EMAIL` con:
- Quién sugirió
- Qué dato(s) están pendientes
- Enlace directo al panel de administración

---

### Sistema de Invitaciones

Los colaboradores acceden **solo mediante invitación**. No hay registro abierto.

**Flujo**:

1. Admin genera un token de invitación desde el panel
   ```
   POST /admin/invitations
   { email: "tio@gmail.com", family_id: "...", role: "collaborator" }
   ```

2. Sistema envía email con enlace único:
   ```
   https://familystars.app/invite/{token}
   ```

3. Familiar accede al enlace:
   - Introduce su nombre
   - Elige su foto de perfil (opcional)
   - Queda registrado como **Collaborator** con su `family_id` asignada

4. Token se **invalida**:
   - Tras primer uso, o
   - Tras 7 días (lo que ocurra primero)

5. Admin puede revocar acceso en cualquier momento:
   ```
   DELETE /admin/users/{user_id}
   ```

---

## 🎨 Interfaz de Usuario

### Canvas Principal

**Descripción**: Pantalla principal, ocupa todo el viewport. Fondo oscuro, estrellas interactivas.

**Especificaciones técnicas**:
- **Color fondo**: #080C18 (azul noche profundo)
- **Tamaño**: 100% viewport (responsive)
- **Tecnología**: Canvas HTML5 + D3.js para renderización
- **Performance**: 60 FPS en devices de gama media

#### Estrellas de Fondo
- **Cantidad**: 120 puntos estáticos
- **Color**: blanco/gris, opacidad variable (0.3–0.8)
- **Animación**: titileo (pulsación de opacidad)
  - Duración: 3–5 segundos por estrella
  - Fase aleatoria para cada una (no sincronizadas)
- **Propósito**: crear atmósfera cósmica, no interactivas

#### Estrellas-Persona

**Tamaño**:
- Proporcional a la generación:
  - Abuelos: 36px diámetro
  - Padres: 30px
  - Generación actual: 24px
  - Hijos: 20px
- Rango total: 20–36px

**Color y Diseño**:
- Color base: del color primario de la familia (constelación)
- Forma: círculo perfecto
- Interior:
  - Si existe `avatar_url`: foto de perfil circular (recortada en Cloudinary)
  - Si no: iniciales (first_name[0] + last_name[0]) en blanco, bold
- Borde: ligero borde del color familia (opacidad 0.5)
- **Halo pulsante**: círculo difuminado exterior del color familia
  - Animación: scale 1.0 → 1.12 → 1.0 en 3 segundos
  - Opacidad: 0.4 base, pulsante

**Etiqueta**:
- Posición: debajo de la estrella, centrada
- Nombre: en blanco, bold, font-size 12px
- Apellido: en gris (#AAAAAA), font-size 10px, opacidad 0.7

**Interacción**:
- **Hover**: aumenta brillo, cursor puntero
- **Click**: abre panel de perfil lateral
- **Selección**:
  - Estrella seleccionada: escala 1.5x, más brillante
  - Estrellas relacionadas: opacidad 1.0
  - Estrellas no relacionadas: opacidad 0.18
  - Transición suave (300ms)

---

#### Líneas de Conexión

Conectan personas según su relación.

| Tipo de Relación | Estilo | Propósito |
|---|---|---|
| **Padre/Madre → Hijo** | Curva sutil, color familia, opacidad 0.35, grosor 2px | Descendencia directa |
| **Hermano/Hermana ↔** | Curva sutil, color familia, opacidad 0.25, grosor 1.5px | Hermandad |
| **Primo ↔** | Curva sutil, color familia, opacidad 0.25, grosor 1px | Parentesco lateral |
| **Matrimonio (misma familia)** | Discontinua (dash), blanco, opacidad 0.22, grosor 1.5px | Unión interna |
| **Matrimonio (entre familias)** | Discontinua (dash), dorada (#C9A84C), opacidad 0.35, grosor 1.5px | Unión externa, más visibles |

**Animación**: Las líneas pueden tener una sutil animación de "pulso" opcional (post-MVP), pero no debe distraer en la visualización por defecto.

---

### Pan & Zoom

**Interacción de Canvas**:

- **Pan (mover universo)**:
  - Clic + arrastrar en zona vacía
  - Movimiento suave, sin inercia (simple)

- **Zoom**:
  - Rueda del ratón: amplía/reduce
  - Pinch en móvil: dos dedos acercando/separando
  - Rango: 0.3x a 2.5x
  - Animación: suave en 200ms

- **Reset**:
  - Doble clic en zona vacía: vuelve a posición inicial (zoom 1.0, centro)
  - Botón "Reset" en UI (esquina inferior izquierda)

---

### Buscador

**Ubicación**: barra fija en la parte superior central, siempre visible sobre canvas.

**Entrada**:
- Input text, placeholder: "Buscar persona, familia, lugar..."
- Icono de búsqueda (lupa)
- Input debería ocupar ~300–400px en desktop, 100% en móvil con max-width

**Búsqueda en tiempo real** (sin Enter):
- Comienza tras 2–3 caracteres
- Busca en:
  - Nombre de persona (`first_name`, `last_name`)
  - Nombre de familia (`families.name`)
  - Lugar de nacimiento (`birth_place`)
  - Lugar de residencia (`current_location`)
  - Rol familiar (si está en `bio` o tag) [post-MVP]

- Resultados mostrados en dropdown:
  - Máximo 8 resultados
  - Formato: `[Foto pequeña] Nombre Apellido (Familia) — Rol`
  - Highlight en amarillo el texto coincidente

**Al seleccionar un resultado**:
1. Canvas hace **pan + zoom animado** para centrar la estrella (3–5 segundos)
2. Automáticamente **abre el panel de perfil**
3. Buscador cierra
4. Estrella seleccionada brilla (efecto 1.5x)

---

### Panel de Perfil

**Ubicación**:
- Desktop: panel lateral fijo a la derecha, ancho ~380px
- Móvil: modal inferior (bottom sheet), altura 70–80% del viewport

**Contenido**: se despliega en secciones

#### 1. Cabecera
- Avatar circular grande (100px)
- Nombre completo en grande (bold, 18px)
- Año de nacimiento (pequeño)
- Rol familiar (ej: "Abuelo paterno", "Primo segundo")
- Botón cerrar (X) en móvil

#### 2. Datos Básicos
- **Familia**: etiqueta con color y nombre
- **Edad**: calculada de `birth_date` (si disponible)
- **Nacimiento**: "lugar, año"
- **Residencia**: "lugar actual"

#### 3. Etiquetas (Tags)
- Profesión, hobbies, intereses (si están presentes en BD)
- Mostradas como chips coloreados
- [Post-MVP: editable por collaborator autorizado]

#### 4. Conexiones
- Título: "Familia"
- Lista de relaciones directas:
  - Formato: `[Avatar pequeña] Nombre Apellido — Tipo de relación`
  - Clic en relación: abre perfil de esa persona

#### 5. Galería de Fotos
- Título: "Fotos" (si existen `person_photos` aprobadas)
- Grid de miniaturas (2 columnas en desktop, 1 en móvil)
- Cada thumbnail: `person_photos.cloudinary_url` + caption
- Click en thumbnail: abre lightbox con imagen grande

#### 6. Redes Sociales
- Si existen `social_links`:
  - Iconos (Instagram, Facebook, LinkedIn, Twitter)
  - Cada icono es un link clickeable a `social_links.url`
  - Tooltip mostrando la red

#### 7. Acciones
Botones según el rol del usuario:
- **Admin**: "Editar", "Añadir foto", "Eliminar"
- **Collaborator** (si es su familia): "Editar", "Sugerir foto"
- **Viewer**: ninguno

---

### Panel de Administración

**Acceso**: `/admin` (solo admin)

**Secciones**:

#### 1. Dashboard Principal
- Total de personas (aprobadas)
- Total de familias
- Colaboradores activos
- Últimos cambios

#### 2. Pendientes
- **Personas pendientes**: tabla con nombre, familia, quién sugirió, fecha
  - Botones: "Aprobar", "Rechazar", "Ver detalles"
- **Fotos pendientes**: tabla similar
- **Relaciones pendientes**: tabla similar

#### 3. Gestión de Usuarios
- Lista de todos los usuarios
- Columnas: email, nombre, rol, familia, fecha registro
- Botones: "Cambiar rol", "Revocar acceso"
- Formulario para generar nuevas invitaciones

#### 4. Gestión de Familias
- Lista de familias creadas
- Botón "Crear nueva familia"

---

### Vistas Adicionales (Post-MVP, no en MVP inicial)

- **Línea de tiempo**: eventos familiares ordenados cronológicamente (nacimientos, bodas, muertes)
- **Mapa de orígenes**: mapa interactivo con pins de lugares de nacimiento
- **Relación entre dos personas**: algoritmo que calcula y explica el parentesco entre dos personas
- **Muro de recuerdos**: sección por persona para anécdotas familiares
- **Notificaciones de cumpleaños**: email automático recordatorio

---

## 🔌 API REST

**Base URL**: `https://familystars-api.onrender.com`

**Autenticación**: Bearer token (JWT) en header `Authorization: Bearer {token}`

### 5.1 Autenticación

#### `POST /auth/magic-link`
Solicita un magic link de acceso.

**Request**:
```json
{ "email": "user@example.com" }
```

**Response** (200):
```json
{ "message": "Email enviado a user@example.com" }
```

---

#### `GET /auth/verify/{token}`
Verifica el token y devuelve JWT.

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Juan García",
    "role": "collaborator",
    "family_id": "uuid"
  }
}
```

---

#### `POST /auth/invite`
**Admin**: genera un token de invitación.

**Request**:
```json
{
  "email": "tio@gmail.com",
  "family_id": "uuid",
  "role": "collaborator"
}
```

**Response** (201):
```json
{
  "invite_token": "inv_abc123xyz...",
  "invite_url": "https://familystars.app/invite/inv_abc123xyz..."
}
```

---

#### `GET /auth/me`
Devuelve el usuario autenticado actual.

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Juan García",
  "role": "collaborator",
  "family_id": "uuid"
}
```

---

### 5.2 Personas

#### `GET /persons`
Lista todas las personas aprobadas con coordenadas para canvas.

**Query params**:
- `family_id` (optional): filtrar por familia
- `limit` (default 100): cantidad
- `offset` (default 0): paginación

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "first_name": "Juan",
      "last_name": "García",
      "birth_date": "1950-05-15",
      "death_date": null,
      "avatar_url": "https://cloudinary.../avatar.jpg",
      "family_id": "uuid",
      "x": 150,
      "y": 200,
      "generation": 0
    }
  ],
  "total": 45
}
```

---

#### `GET /persons/{id}`
Perfil completo de una persona.

**Response** (200):
```json
{
  "id": "uuid",
  "first_name": "Juan",
  "last_name": "García",
  "birth_date": "1950-05-15",
  "death_date": null,
  "birth_place": "Madrid",
  "current_location": "Barcelona",
  "bio": "Ingeniero jubilado, apasionado por la genealogía",
  "avatar_url": "https://...",
  "family": { "id": "uuid", "name": "Familia García", "color_hex": "9B59B6" },
  "relationships": [
    { "person_id": "uuid", "type": "child", "name": "María García" }
  ],
  "photos": [
    { "url": "https://...", "caption": "1990", "year": 1990 }
  ],
  "social_links": [
    { "platform": "instagram", "url": "https://instagram.com/...", "label": "Instagram" }
  ],
  "status": "approved",
  "created_at": "2026-04-01T10:00:00Z"
}
```

---

#### `POST /persons`
Crea/sugiere una nueva persona.

**Request**:
```json
{
  "first_name": "María",
  "last_name": "García",
  "birth_date": "1952-03-20",
  "birth_place": "Valladolid",
  "current_location": "Madrid",
  "bio": "Profesora de primaria",
  "family_id": "uuid"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "status": "pending",  // o "approved" si es admin
  "message": "Persona sugerida. Espera aprobación del admin."
}
```

---

#### `PATCH /persons/{id}`
Edita datos de una persona.

**Request**:
```json
{
  "bio": "Ingeniero de sistemas, escritor en sus ratos libres",
  "current_location": "Valencia"
}
```

**Response** (200):
```json
{ "id": "uuid", "status": "approved", "updated_at": "..." }
```

---

#### `PATCH /persons/{id}/approve`
**Admin**: aprueba una persona pendiente.

**Response** (200):
```json
{ "id": "uuid", "status": "approved" }
```

---

#### `DELETE /persons/{id}`
**Admin**: elimina una persona.

**Response** (204):
```
(sin contenido)
```

---

#### `GET /persons/{id}/photos`
Lista las fotos de una persona.

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "cloudinary_url": "https://res.cloudinary.com/...",
      "caption": "Boda de Juan y María, 1975",
      "year": 1975,
      "approved": true
    }
  ]
}
```

---

#### `POST /persons/{id}/photos`
Sube una foto nueva.

**Request**: FormData con `file` (imagen)

**Response** (201):
```json
{
  "id": "uuid",
  "cloudinary_url": "https://...",
  "status": "pending",  // o "approved" si admin
  "message": "Foto subida. Espera aprobación."
}
```

---

### 5.3 Relaciones

#### `GET /relationships`
Lista todas las relaciones aprobadas.

**Query params**:
- `person_id` (optional): filtrar relaciones de una persona
- `verified` (default true): solo relaciones verificadas

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "person_a": { "id": "uuid", "name": "Juan García" },
      "person_b": { "id": "uuid", "name": "María García" },
      "type": "partner",
      "verified": true,
      "notes": "Matrimonio 1975"
    }
  ]
}
```

---

#### `POST /relationships`
Crea/sugiere una nueva relación.

**Request**:
```json
{
  "person_a_id": "uuid",
  "person_b_id": "uuid",
  "type": "parent",
  "notes": "Confirmado en registro civil"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "verified": false,  // o true si admin
  "message": "Relación sugerida. Espera aprobación."
}
```

---

#### `PATCH /relationships/{id}/approve`
**Admin**: aprueba una relación.

**Response** (200):
```json
{ "id": "uuid", "verified": true }
```

---

#### `DELETE /relationships/{id}`
**Admin**: elimina una relación.

**Response** (204):
```
(sin contenido)
```

---

### 5.4 Familias

#### `GET /families`
Lista todas las familias/constelaciones.

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Familia García",
      "color_hex": "9B59B6",
      "description": "Rama ancestral paterna desde Valladolid",
      "person_count": 24,
      "admin": { "id": "uuid", "name": "Chencho García" }
    }
  ]
}
```

---

#### `POST /families`
**Admin**: crea una nueva constelación.

**Request**:
```json
{
  "name": "Familia Navarro",
  "color_hex": "FF5733",
  "description": "Rama de los Navarro de Andalucía"
}
```

**Response** (201):
```json
{ "id": "uuid", "name": "Familia Navarro", ... }
```

---

#### `PATCH /families/{id}`
**Admin**: edita datos de una familia.

**Request**:
```json
{
  "description": "Rama maternal desde Granada",
  "color_hex": "3498DB"
}
```

**Response** (200):
```json
{ "id": "uuid", ... }
```

---

### 5.5 Administración

#### `GET /admin/pending`
Lista todo el contenido pendiente de aprobación.

**Response** (200):
```json
{
  "pending_persons": [ ... ],
  "pending_photos": [ ... ],
  "pending_relationships": [ ... ]
}
```

---

#### `GET /admin/users`
Lista todos los usuarios registrados.

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Juan García",
      "role": "collaborator",
      "family_id": "uuid",
      "created_at": "2026-04-01T10:00:00Z"
    }
  ]
}
```

---

#### `PATCH /admin/users/{id}/role`
Cambia el rol de un usuario.

**Request**:
```json
{ "role": "admin" }
```

**Response** (200):
```json
{ "id": "uuid", "role": "admin" }
```

---

#### `DELETE /admin/users/{id}`
Revoca el acceso de un usuario.

**Response** (204):
```
(sin contenido)
```

---

## 🔄 Flujos de Negocio

### Flujo 1: Registro de Nuevo Colaborador

```
1. Admin genera invitación en panel
   POST /admin/invitations

2. Sistema envía email a "tio@gmail.com"
   Contenido: "Eres invitado a FamilyStars! Accede aquí:
              https://familystars.app/invite/inv_abc123"

3. Tío accede al enlace
   GET /invite?token=inv_abc123

4. Tío completa registro:
   - Nombre: "Carlos"
   - Avatar: sube foto (opcional)

5. Sistema crea usuario con rol "collaborator"
   Token se invalida

6. Tío puede ahora:
   - Ver constelación
   - Sugerir nuevas personas
   - Sugerir fotos
   - Editar su perfil
```

---

### Flujo 2: Sugerir Nueva Persona

```
1. Collaborador navega constelación

2. Clic en botón "Sugerir persona"
   Abre modal con formulario:
   - Nombre y apellido
   - Fecha nacimiento (opcional)
   - Lugar nacimiento
   - Familia (dropdown preseleccionada)
   - Bio (opcional)

3. Collaborador envía
   POST /persons
   { first_name, last_name, ..., family_id }

4. Backend crea persona con status="pending"
   (no aparece en canvas aún)

5. Admin recibe email:
   "Carlos ha sugerido una nueva persona:
    María García (Familia García, 1952)
    Aprueba aquí: https://familystars.app/admin/pending"

6. Admin abre panel de pendientes
   GET /admin/pending

7. Admin hace clic "Aprobar"
   PATCH /persons/{id}/approve
   status cambia a "approved"

8. María aparece en constelación
   Frontend hace polling de /persons cada 30 segundos
   (o usa websocket futuro)
```

---

### Flujo 3: Subir Foto a Persona

```
1. Collaborador abre perfil de María

2. Clic "Añadir foto"
   Abre modal:
   - Input file
   - Caption (opcional)
   - Año aproximado

3. Collaborador sube archivo
   Frontend carga a Cloudinary directo (CORS enabled)
   Obtiene cloudinary_url

4. Frontend envía a backend:
   POST /persons/{id}/photos
   { cloudinary_url, caption, year }

5. Backend crea photo_photos con approved=false
   Admin recibe email

6. Admin aprueba en panel
   PATCH /person_photos/{id}/approve

7. Foto aparece en galería del perfil
```

---

## 📈 Plan de Desarrollo

### Fases (total 12 semanas)

#### **Fase 1: Fundamentos (semanas 1–3)**

**Entregables**:
- Monorepo Git configurado (ESLint, Prettier, pre-commit hooks)
- PostgreSQL en Supabase: todas las tablas creadas
- Express backend con estructura MVC
- Middleware de autenticación JWT
- Magic links con Resend
- Endpoints básicos: `/persons`, `/relationships`, `/families`
- Tests unitarios de endpoints principales

**Tareas específicas**:
- [ ] Crear repo en GitHub
- [ ] Configurar eslint + prettier
- [ ] Crear BD Supabase, ejecutar migrations
- [ ] Scaffold Express app
- [ ] Implementar autenticación JWT
- [ ] Implementar magic link flow (Resend)
- [ ] Endpoints CRUD básicos
- [ ] Tests con Jest

**Definición de listo**: endpoints funcionan localmente, tests en verde

---

#### **Fase 2: Constelación Visual (semanas 4–6)**

**Entregables**:
- React + Vite setup con routing
- Canvas interactivo con D3.js
- Nodos (estrellas-persona) renderizados
- Líneas de relación
- Zoom y pan funcionales
- Buscador en tiempo real
- Panel lateral de perfil
- Deploy en Vercel + Render (URL pública)

**Tareas específicas**:
- [ ] React scaffold + Vite
- [ ] Setup autenticación en frontend (Context/Redux)
- [ ] Canvas base (D3.js + Canvas API)
- [ ] Renderizar nodos
- [ ] Renderizar líneas
- [ ] Zoom/pan controls
- [ ] Buscador
- [ ] Panel perfil
- [ ] Data ejemplo (García/Rodríguez/Navarro)
- [ ] Deploy Vercel + Render

**Definición de listo**: URL pública funciona, se ve la constelación, puedo hacer zoom

---

#### **Fase 3: Colaboración (semanas 7–8)**

**Entregables**:
- Sistema de invitaciones funcional
- Formulario "Sugerir persona"
- Panel de administración: vista de pendientes
- Notificaciones por email
- Protección de rutas por rol (frontend)

**Tareas específicas**:
- [ ] Endpoint invitaciones (POST /admin/invitations)
- [ ] Email template de invitación
- [ ] Página de invitación (/invite/:token)
- [ ] Formulario sugerir persona
- [ ] Panel admin: pendientes
- [ ] Aprobación/rechazo (endpoints + UI)
- [ ] Notificaciones al admin (email)
- [ ] Protección rutas frontend

**Definición de listo**: puedo invitar a tío, él sugiere persona, yo la apruebo y aparece

---

#### **Fase 4: Perfiles Ricos (semanas 9–10)**

**Entregables**:
- Integración Cloudinary
- Upload de fotos circular
- Galería con lightbox
- Redes sociales
- Edición de perfil
- Optimización móvil

**Tareas específicas**:
- [ ] Setup Cloudinary SDK
- [ ] Upload de fotos (frontend → Cloudinary)
- [ ] Recorte circular de avatares
- [ ] Galería de fotos
- [ ] Lightbox
- [ ] Redes sociales (social_links)
- [ ] Edición de perfil
- [ ] CSS media queries
- [ ] Gestos móviles (pinch zoom)

**Definición de listo**: subo foto de perfil, se ve circular; galería funciona en móvil

---

#### **Fase 5: Extras y Pulido (semanas 11–12)**

**Entregables**:
- Notificaciones de cumpleaños (cron job)
- Línea de tiempo familiar (UI básica)
- Script de backup al NAS
- Optimización performance
- Documentación

**Tareas específicas**:
- [ ] Cron job cumpleaños (Node scheduler)
- [ ] Línea de tiempo (timeline view)
- [ ] Bash script backup
- [ ] Lazy loading de fotos
- [ ] Memoización componentes React
- [ ] Documentación usuario final (wiki)
- [ ] README del repo

**Definición de listo**: app lista para uso familiar, documentación clara

---

## 🚀 Despliegue

### Hosting

| Servicio | Función | Tier | Costo |
|---|---|---|---|
| **Vercel** | Frontend React | Free | $0/mes |
| **Render.com** | Backend Express | Free | $0/mes (con limite 750h) |
| **Supabase** | PostgreSQL + Auth | Free | $0/mes (500MB) |
| **Cloudinary** | Almacenamiento fotos | Free | $0/mes (25GB) |
| **Resend** | Emails | Free | $0/mes (3000/mes) |

### Pasos de Deploy

#### 1. Backend (Render.com)

```bash
# Crear proyecto en render.com
# Conectar repo GitHub
# Variables de entorno en Render dashboard:
DATABASE_URL=...
JWT_SECRET=...
CLOUDINARY_*=...
RESEND_API_KEY=...
EMAIL_FROM=...
FRONTEND_URL=...
NODE_ENV=production

# Deploy automático en cada push a main
```

#### 2. Frontend (Vercel)

```bash
# Conectar repo en Vercel
# Variables de entorno:
VITE_API_URL=https://familystars-api.onrender.com
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...

# Deploy automático en cada push a main
```

#### 3. Base de Datos (Supabase)

```bash
# Crear proyecto en Supabase
# Ejecutar migrations:
psql -h db.supabase.co -U postgres < migrations/001_init.sql

# Backup automático Supabase (incluido en Free)
```

---

## 🔒 Consideraciones de Seguridad

### 1. Autenticación

- ✅ Magic links (sin contraseñas reutilizables)
- ✅ JWT con expiración 7 días
- ✅ Refresh tokens [post-MVP]
- ✅ Rate limiting en `/auth/magic-link` (máx 3 por hora por email)

### 2. Autorización

- ✅ Middleware `checkRole()` en endpoints críticos
- ✅ Admin solo puede ver/editar datos de su familia o todas
- ✅ Collaborator no ve datos pendientes de otros
- ✅ Viewer solo ve datos `approved`

### 3. Datos Sensibles

- ✅ `death_date`, `bio`: solo para admin + familia del difunto
- ✅ Emails de usuarios: nunca en respuesta HTTP
- ✅ HTTPS en todas las conexiones
- ✅ CORS: solo origen Vercel

### 4. Inyección SQL

- ✅ Usar ORM (Sequelize, Typeorm) o queries parametrizadas
- ✅ No concatenar strings en SQL

### 5. File Upload

- ✅ Subidas de fotos directo a Cloudinary (no a servidor)
- ✅ Validar tipo de archivo en backend
- ✅ Limitar tamaño a 10MB por foto

### 6. Rate Limiting

- `/auth/magic-link`: 3 por hora por IP
- `/persons`: 10 sugerencias por hora por usuario
- General API: 100 requests/min por usuario autenticado

---

## 📝 Notas Finales

- **Iterativo**: cada fase entrega valor. El propietario puede usar desde Fase 2.
- **Costo cero**: aprovecha agresivamente los tier gratuitos. Escalar después si es necesario.
- **Futura migración**: todo está diseñado para migrar al NAS Asustor con mínimos cambios.
- **Mobile-first**: desde el diseño, no como afterthought.
- **Moderación es crítica**: sin control de calidad, la app pierde valor.

---

**Versión**: 1.0
**Última actualización**: Abril 2026
**Estado**: Aprobado para desarrollo
