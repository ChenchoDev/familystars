# FamilyStars — Admin Dashboard

## Contexto del proyecto

Stack en producción:
- **Frontend**: React + Vite + Tailwind CSS → desplegado en Netlify
- **Backend**: Node.js + Express (ESM, `"type": "module"`) → desplegado en Render
- **BD**: PostgreSQL en Supabase
- **Auth**: JWT + magic links via Resend

El frontend vive en `apps/frontend/src/`. El backend en `apps/backend/src/`.

---

## Objetivo de esta tarea

Construir un **dashboard de administración** en el frontend que permita al admin:

1. Ver estadísticas generales del árbol
2. Gestionar familias (crear, editar)
3. Añadir y editar personas con todos sus campos
4. Crear relaciones entre personas
5. Aprobar o rechazar sugerencias pendientes

Todos los endpoints del backend **ya existen y funcionan**. Solo hay que construir el frontend.

---

## Lo que ya existe — NO tocar

```
apps/frontend/src/
├── App.jsx                  ← Añadir ruta /admin aquí
├── pages/
│   ├── Landing.jsx          ← No tocar
│   └── Constellation.jsx    ← No tocar
├── components/
│   ├── background/          ← No tocar
│   ├── constellation/       ← No tocar
│   ├── profile/             ← No tocar
│   └── search/              ← No tocar
├── api/                     ← Añadir admin.js aquí
├── hooks/                   ← Añadir useAdmin.js aquí
└── styles/
```

---

## Archivos a crear

```
apps/frontend/src/
├── api/
│   └── admin.js             ← Cliente HTTP para todos los endpoints admin
├── hooks/
│   └── useAdmin.js          ← Hook con estado global del dashboard
├── pages/
│   └── Admin.jsx            ← Página raíz del dashboard (protegida)
└── components/
    └── admin/
        ├── AdminLayout.jsx         ← Layout con sidebar + topbar
        ├── StatsPanel.jsx          ← Tarjetas de estadísticas
        ├── FamiliesPanel.jsx       ← CRUD de familias/constelaciones
        ├── PersonsPanel.jsx        ← Añadir y editar personas
        ├── RelationshipsPanel.jsx  ← Crear relaciones entre personas
        └── PendingPanel.jsx        ← Aprobar/rechazar sugerencias
```

---

## Modificación en App.jsx

Añadir la ruta `/admin` protegida. El token JWT se guarda en `localStorage` con la clave `fs_token`. Si no hay token o el rol no es `admin`, redirigir a `/`.

```jsx
// App.jsx — añadir estas importaciones y ruta
import Admin from './pages/Admin';

// Dentro de <Routes>:
<Route path="/admin" element={<AdminRoute />} />

// Componente de ruta protegida (en el mismo archivo o en utils/):
function AdminRoute() {
  const token = localStorage.getItem('fs_token');
  // Decodificar el payload del JWT sin librería externa:
  // atob(token.split('.')[1]) → JSON con { role, ... }
  if (!token) return <Navigate to="/" />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') return <Navigate to="/" />;
    return <Admin />;
  } catch {
    return <Navigate to="/" />;
  }
}
```

---

## API Client — src/api/admin.js

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('fs_token');
}

async function req(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Stats
export const getStats = () => req('GET', '/admin/stats');

// Families
export const getFamilies = () => req('GET', '/families');
export const createFamily = (data) => req('POST', '/families', data);
export const updateFamily = (id, data) => req('PATCH', `/families/${id}`, data);

// Persons
export const getPersons = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req('GET', `/persons${qs ? '?' + qs : ''}`);
};
export const getPerson = (id) => req('GET', `/persons/${id}`);
export const createPerson = (data) => req('POST', '/persons', data);
export const updatePerson = (id, data) => req('PATCH', `/persons/${id}`, data);
export const deletePerson = (id) => req('DELETE', `/persons/${id}`);
export const approvePerson = (id) => req('PATCH', `/persons/${id}/approve`);

// Relationships
export const getRelationships = () => req('GET', '/relationships');
export const createRelationship = (data) => req('POST', '/relationships', data);
export const approveRelationship = (id) => req('PATCH', `/relationships/${id}/approve`);
export const deleteRelationship = (id) => req('DELETE', `/relationships/${id}`);

// Pending
export const getPending = () => req('GET', '/admin/pending');

// Users
export const getUsers = () => req('GET', '/admin/users');
export const deleteUser = (id) => req('DELETE', `/admin/users/${id}`);
```

---

## Estructura del Schema (referencia)

```sql
-- persons
id, first_name, last_name, birth_date, death_date,
birth_place, current_location, bio, avatar_url,
family_id (FK→families), status ('pending'|'approved'|'rejected'),
created_by (FK→users), approved_by (FK→users),
created_at, updated_at

-- relationships
id, person_a_id (FK→persons), person_b_id (FK→persons),
type ('parent'|'child'|'partner'|'sibling'|'cousin'|'other'),
verified (boolean), notes

-- families
id, name, color_hex, description, admin_id (FK→users)

-- users
id, email, name, role ('admin'|'guardian'|'collaborator'|'viewer'),
family_id, invite_token, created_at
```

---

## Colores de familias (ya en producción)

```javascript
// Estas familias y colores ya están en la BD — usarlos para los badges
const FAMILY_COLORS = {
  'Paterna':    '#9B59B6',  // Lila
  'Materna':    '#3498DB',  // Azul
  'Política 1': '#F39C12',  // Naranja
  'Política 2': '#27AE60',  // Verde
};
// El color viene en family.color_hex desde la API (sin #)
// Usar como: `#${family.color_hex}`
```

---

## Componentes — Especificación detallada

### AdminLayout.jsx

Layout de dos columnas: sidebar fijo izquierda (220px) + área de contenido derecha.

**Sidebar items:**
```
📊 Resumen         → panel: 'stats'
⭐ Familias        → panel: 'families'
👤 Personas        → panel: 'persons'
🔗 Relaciones      → panel: 'relationships'
⏳ Pendientes      → panel: 'pending'  + badge con count de pendientes
```

**Estilo del sidebar:**
- Fondo oscuro: `bg-gray-900`
- Logo/título arriba: "🌟 FamilyStars Admin"
- Item activo: fondo `bg-purple-800`, texto blanco
- Items inactivos: texto `text-gray-400`, hover `bg-gray-800`
- En la parte inferior: nombre del admin + botón "Volver a la app" → `/app`

**Topbar:**
- Título del panel activo
- Botón de acción primaria contextual (ej: "Nueva persona", "Nueva familia")

---

### StatsPanel.jsx

Llama a `GET /admin/stats`. Mostrar tarjetas con:

```
Total personas    Total familias    Pendientes de aprobación    Total relaciones
```

Cada tarjeta: fondo `bg-gray-800`, número grande en blanco, label en gris.
Debajo de las tarjetas: lista de las últimas personas añadidas (las 5 más recientes).

---

### FamiliesPanel.jsx

**Vista lista:** tabla con columnas:
`Color | Nombre | Descripción | Nº personas | Acciones (Editar)`

El color se muestra como un círculo coloreado con `#${family.color_hex}`.

**Formulario crear/editar familia** (modal o panel lateral):
```
Nombre*           → input text
Descripción       → textarea
Color             → input color (type="color") — guardar sin el # inicial
```

Al guardar: `POST /families` o `PATCH /families/:id`.
No permitir eliminar familias (riesgo de borrar personas en cascada).

---

### PersonsPanel.jsx

**Vista lista:** tabla paginada (20 por página) con:
`Avatar | Nombre completo | Familia (badge coloreado) | Fecha nac. | Estado | Acciones`

**Filtros arriba:**
- Selector de familia (dropdown con todas las familias)
- Buscador por nombre (filtra en cliente sobre los resultados cargados)
- Filtro de estado: Todos / Aprobados / Pendientes

**Formulario añadir/editar persona** — abrir en panel lateral deslizante (no modal):

```
── Datos básicos ──────────────────────
Nombre*             → input text
Apellidos*          → input text
Familia*            → select con todas las familias (coloreadas)
Fecha de nacimiento → input date (no requerido)
Fecha fallecimiento → input date (no requerido, mostrar solo si se activa checkbox "Fallecido")
Lugar de nacimiento → input text
Lugar actual        → input text

── Información personal ───────────────
Biografía           → textarea (max 500 chars, contador visible)

── Redes sociales ─────────────────────
Instagram           → input url
Facebook            → input url
LinkedIn            → input url
```

**Comportamiento:**
- Al crear: `POST /persons` con `status: 'approved'` (el admin crea directamente aprobado)
- Al editar: `PATCH /persons/:id`
- Botón eliminar con confirmación: "¿Eliminar a {nombre}? Esta acción no se puede deshacer"
- Tras crear una persona exitosamente: mostrar un mensaje "¿Quieres añadir relaciones para {nombre} ahora?" con botón que lleva directo al panel de relaciones pre-filtrado por esa persona

---

### RelationshipsPanel.jsx

**Vista lista:** tabla con:
`Persona A | Tipo | Persona B | Verificado | Acciones (Eliminar)`

El tipo se muestra como badge:
```javascript
const TYPE_LABELS = {
  parent:  { label: 'Padre/Madre de', color: 'bg-blue-800' },
  child:   { label: 'Hijo/a de',      color: 'bg-green-800' },
  partner: { label: 'Pareja de',      color: 'bg-pink-800' },
  sibling: { label: 'Hermano/a de',   color: 'bg-yellow-800' },
  cousin:  { label: 'Primo/a de',     color: 'bg-orange-800' },
  other:   { label: 'Otro',           color: 'bg-gray-700' },
};
```

**Formulario crear relación:**

```
Persona A*   → searchable select (busca entre todas las personas aprobadas)
Tipo*        → select con los tipos de arriba
Persona B*   → searchable select (busca entre todas las personas, excluye Persona A)
Notas        → input text (opcional)
```

El select de personas debe ser buscable (campo de texto que filtra la lista).
Mostrar en cada opción: nombre completo + familia (badge coloreado).

**Validación importante:**
- No permitir que Persona A = Persona B
- Advertir si ya existe una relación entre esas dos personas (verificar en cliente antes de enviar)

Al crear: `POST /relationships` — el admin crea directamente con `verified: true`.

---

### PendingPanel.jsx

Llama a `GET /admin/pending`. Muestra dos secciones:

**Personas pendientes:**
Tarjeta por cada persona con:
- Nombre completo, familia, fecha nacimiento, lugar
- Quién lo sugirió y cuándo
- Botones: ✅ Aprobar (`PATCH /persons/:id/approve`) | ❌ Rechazar (`DELETE /persons/:id`)

**Relaciones pendientes:**
Tarjeta por cada relación con:
- Persona A → tipo → Persona B
- Botones: ✅ Aprobar (`PATCH /relationships/:id/approve`) | ❌ Rechazar (`DELETE /relationships/:id`)

Si no hay pendientes: mensaje vacío con icono ✨ "Todo al día — no hay sugerencias pendientes".

---

## Estilo general del dashboard

El dashboard tiene su propia identidad visual, diferente a la constelación:

```javascript
// Paleta del dashboard (dark mode puro)
bg-gray-950   // fondo de página
bg-gray-900   // sidebar
bg-gray-800   // tarjetas y paneles
bg-gray-700   // inputs, filas de tabla
border-gray-700  // bordes sutiles

// Acento principal: purple (coherente con el color de la constelación)
bg-purple-700 / hover:bg-purple-600  // botones primarios
text-purple-400                       // links y acentos
bg-purple-800                         // item activo en sidebar

// Estados
bg-green-900 / text-green-400   // aprobado
bg-yellow-900 / text-yellow-400 // pendiente
bg-red-900 / text-red-400       // rechazado / eliminar
```

**Tipografía:** usar la que ya tenga configurada Tailwind en el proyecto.

**Tablas:** 
- Fondo `bg-gray-800`, filas alternas `bg-gray-750` (o `hover:bg-gray-700`)
- Header de tabla: `bg-gray-700`, texto `text-gray-300`, uppercase, text-xs
- Bordes: `divide-y divide-gray-700`

**Formularios:**
- Labels: `text-gray-300 text-sm font-medium mb-1`
- Inputs: `bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent`
- Botón primario: `bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium`
- Botón peligro: `bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg`
- Botón cancelar: `bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg`

---

## Gestión de errores y estados de carga

Cada panel debe manejar tres estados:
```jsx
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} onRetry={reload} />;
return <ContenidoDelPanel />;
```

`LoadingSpinner`: un div centrado con `animate-spin` de Tailwind.
`ErrorMessage`: fondo `bg-red-900/20`, borde `border-red-800`, texto del error + botón "Reintentar".

Tras cada operación (crear, editar, aprobar, rechazar, eliminar): mostrar un toast de éxito/error.
Toast simple: div absoluto abajo-derecha, aparece 3 segundos y desaparece. Verde para éxito, rojo para error.

---

## Orden de implementación recomendado

1. `src/api/admin.js` — cliente HTTP completo
2. `App.jsx` — añadir ruta `/admin` con guard
3. `AdminLayout.jsx` — estructura con sidebar y navegación
4. `Admin.jsx` — página que renderiza el layout y los paneles
5. `StatsPanel.jsx` — el más sencillo, buen punto de partida
6. `FamiliesPanel.jsx` — sin dependencias de otras entidades
7. `PersonsPanel.jsx` — depende de familias (necesita el listado para el select)
8. `RelationshipsPanel.jsx` — depende de personas (necesita el listado para los selects)
9. `PendingPanel.jsx` — consume datos ya existentes, solo muestra y aprueba/rechaza

---

## Notas importantes

- **No crear autenticación nueva.** El token ya está en `localStorage` con clave `fs_token`. Solo leerlo y decodificarlo para verificar el rol.
- **No modificar el backend.** Todos los endpoints necesarios ya existen.
- **No tocar** `Landing.jsx`, `Constellation.jsx` ni ningún componente de `background/`, `constellation/`, `profile/`, `search/`.
- **ESM en backend, JSX en frontend.** No mezclar sintaxis.
- **El admin ve status `approved` directamente** al crear personas — no pasa por el flujo de pendientes.
- Acceso al dashboard: `https://tuapp.netlify.app/admin`