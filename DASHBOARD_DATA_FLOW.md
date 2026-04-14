# FamilyStars — Flujo de inyección de datos desde el dashboard

## Estado actual del dashboard

Los tres paneles están construidos y funcionan conceptualmente:
- `FamiliesPanel.jsx` — crea y edita familias, tiene campo `display_name`
- `PersonsPanel.jsx` — crea, edita y elimina personas con todos sus campos
- `RelationshipsPanel.jsx` — crea relaciones con búsqueda de personas

Sin embargo hay **bugs activos** que rompen el flujo y deben corregirse antes
de poder añadir datos reales de forma fiable.

---

## Bugs críticos a corregir

### Bug 1 — `family_id` se envía como string en vez de UUID

**Archivo:** `apps/frontend/src/components/admin/PersonsPanel.jsx`

```javascript
// CÓDIGO ACTUAL — BUGGY
const data = {
  ...formData,
  family_id: parseInt(formData.family_id), // parseInt de un UUID → NaN
  status: 'approved',
};
```

Los IDs de familias son UUIDs (`550e8400-e29b-41d4-a716-446655440001`), no números.
`parseInt` de un UUID devuelve `NaN`, que el backend rechaza con error 400.

```javascript
// CORRECCIÓN
const data = {
  ...formData,
  family_id: formData.family_id, // UUID ya es string, no convertir
  status: 'approved',
};
```

---

### Bug 2 — Comparación de IDs con parseInt en RelationshipsPanel

**Archivo:** `apps/frontend/src/components/admin/RelationshipsPanel.jsx`

Mismo problema en dos sitios:

```javascript
// BUGGY — parseInt de UUID = NaN, nunca coincide
const exists = relationships.some(
  (r) =>
    (r.person_a_id === parseInt(formData.person_a_id) &&
     r.person_b_id === parseInt(formData.person_b_id)) || ...
);

// También en el submit:
person_a_id: parseInt(formData.person_a_id),
person_b_id: parseInt(formData.person_b_id),
```

```javascript
// CORRECCIÓN — comparar strings directamente
const exists = relationships.some(
  (r) =>
    (r.person_a_id === formData.person_a_id &&
     r.person_b_id === formData.person_b_id) ||
    (r.person_a_id === formData.person_b_id &&
     r.person_b_id === formData.person_a_id)
);

// Y en el submit:
person_a_id: formData.person_a_id,
person_b_id: formData.person_b_id,
```

---

### Bug 3 — El filtro de familia en PersonsPanel compara string con UUID

**Archivo:** `apps/frontend/src/components/admin/PersonsPanel.jsx`

```javascript
// BUGGY
const matchesFamily = !filterFamily || p.family_id === parseInt(filterFamily);

// CORRECCIÓN
const matchesFamily = !filterFamily || p.family_id === filterFamily;
```

---

### Bug 4 — Las relaciones no muestran nombres en la tabla

**Archivo:** `apps/frontend/src/components/admin/RelationshipsPanel.jsx`

El backend devuelve las relaciones con esta estructura:
```json
{
  "person_a": { "id": "uuid", "first_name": "Fulgencio", "last_name": "Marín" },
  "person_b": { "id": "uuid", "first_name": "Isabel", "last_name": "Iniesta" },
  "person_a_id": "uuid",
  "person_b_id": "uuid",
  "type": "partner"
}
```

Pero `getPersonName()` busca en el array local de personas por `p.id === id`.
Si el backend devuelve los objetos anidados, usar directamente:

```javascript
// En la tabla, sustituir:
{getPersonName(rel.person_a_id)}
{getPersonName(rel.person_b_id)}

// Por:
{rel.person_a
  ? `${rel.person_a.first_name} ${rel.person_a.last_name}`
  : getPersonName(rel.person_a_id)}
{rel.person_b
  ? `${rel.person_b.first_name} ${rel.person_b.last_name}`
  : getPersonName(rel.person_b_id)}
```

---

## El flujo correcto para añadir una nueva familia emparentada

Este es el orden exacto que debe seguirse para añadir, por ejemplo,
la familia de la mujer de Chencho (nuevos suegros, cuñados, etc.).

### Paso 1 — Crear la familia

Panel **Familias** → "+ Nueva familia"

```
Nombre*              → "Política 1"   (nombre interno, solo para el admin)
Nombre en constelación → "GARCÍA"     (lo que aparece en la constelación)
Color                → elegir con el selector de color
Descripción          → "Familia de la esposa" (opcional)
```

Esto crea un registro en la tabla `families` de Neon y aparece
inmediatamente disponible en el selector de familia del panel de Personas.

---

### Paso 2 — Añadir personas de esa familia

Panel **Personas** → "+ Nueva persona" — una por una.

Para cada persona:
```
Nombre*              → "Ana"
Apellidos*           → "García"
Familia*             → seleccionar "Política 1" del dropdown
Fecha de nacimiento  → opcional, pero recomendable para la línea de tiempo futura
Lugar de nacimiento  → opcional
```

Campos opcionales que enriquecen el perfil:
```
Fallecido            → activar checkbox si procede, rellenar fecha
Lugar actual         → ciudad donde vive ahora
Biografía            → texto libre, máx 500 caracteres
Instagram/Facebook/LinkedIn → URLs completas
```

El admin crea personas directamente con `status: 'approved'` — aparecen
en la constelación inmediatamente sin pasar por moderación.

**Orden recomendado al añadir una familia nueva:**
1. Primero los abuelos (generación más antigua)
2. Luego padres/tíos
3. Luego hijos/primos
4. Finalmente los enlaces con otras familias (relaciones de matrimonio)

---

### Paso 3 — Crear las relaciones

Panel **Relaciones** → "+ Nueva relación"

Para cada relación:
```
Persona A   → buscar escribiendo el nombre (autocompletado)
Tipo        → seleccionar de la lista
Persona B   → buscar escribiendo el nombre (autocompletado)
Notas       → opcional
```

**Tipos disponibles y cuándo usarlos:**

| Tipo | Label | Cuándo usarlo |
|------|-------|---------------|
| `parent` | Padre/Madre de | A es padre o madre de B |
| `child` | Hijo/a de | A es hijo/a de B |
| `partner` | Pareja de | Matrimonio o pareja estable |
| `sibling` | Hermano/a de | Hermanos entre sí |
| `cousin` | Primo/a de | Primos |
| `other` | Otro | Cualquier otra relación |

**Relaciones clave para conectar dos familias:**
La relación `partner` entre una persona de familia A y una persona de familia B
es lo que crea la línea dorada en la constelación que une ambas familias.

Ejemplo para conectar la familia Marín con la familia García:
```
Persona A: Chencho Marín   (familia Paterna)
Tipo: partner
Persona B: [nombre esposa] (familia Política 1)
```

---

### Paso 4 — Verificar en la constelación

Tras crear familia, personas y relaciones, ir a `/app` y verificar:
- La nueva constelación aparece separada con su color
- El texto de fondo muestra el `display_name` configurado
- Las estrellas están conectadas por líneas según las relaciones
- La línea dorada une la nueva familia con la familia Marín

Si algo no aparece, refrescar la página — la constelación carga
los datos frescos de la API en cada visita.

---

## Mejoras pendientes en el dashboard (a implementar)

### Mejora 1 — Flujo guiado "Añadir persona + sus relaciones"

Actualmente al crear una persona hay que ir manualmente al panel de
Relaciones para añadir sus conexiones. Mejorar el flujo así:

Tras crear una persona con éxito, mostrar:
```
✅ "Chencho Marín" creado correctamente

¿Quieres añadir relaciones ahora?
[+ Añadir relación para Chencho]  [No, más tarde]
```

El botón lleva al panel de Relaciones con "Persona A" pre-rellenada
con la persona recién creada.

**Implementación:** pasar el ID de la persona recién creada como prop
a `RelationshipsPanel` o usar un estado en `Admin.jsx` para pre-seleccionarla.

---

### Mejora 2 — Indicador visual de personas sin relaciones

En la tabla de personas, añadir un indicador cuando una persona no tiene
ninguna relación — así es fácil detectar "huérfanos" en el árbol:

```javascript
// En PersonsPanel, al cargar datos, cruzar con relationships:
const personIdsWithRelations = new Set([
  ...relationships.map(r => r.person_a_id),
  ...relationships.map(r => r.person_b_id),
]);

// En la tabla, añadir badge:
{!personIdsWithRelations.has(person.id) && (
  <span className="text-xs bg-yellow-900 text-yellow-400 px-2 py-1 rounded">
    Sin relaciones
  </span>
)}
```

Para que esto funcione, `PersonsPanel` necesita también cargar las relaciones
al inicializarse. Añadir `relationshipsAPI.list()` al `fetchData()`.

---

### Mejora 3 — Validación de `display_name` en el backend

Actualmente `display_name` no está en el schema de validación Joi del backend.
Añadirlo para que no sea rechazado silenciosamente:

**Archivo:** `apps/backend/src/middleware/validate.js`

Buscar el schema `family` y añadir:
```javascript
family: Joi.object({
  name: Joi.string().min(2).max(100).required(),
  display_name: Joi.string().min(2).max(100).optional().allow(''),
  color_hex: Joi.string().length(6).required(),
  description: Joi.string().max(500).optional().allow(''),
}),
```

Y en la migración de Neon, ejecutar si no está hecho:
```sql
ALTER TABLE families ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
UPDATE families SET display_name = 'MARÍN'    WHERE name = 'Paterna';
UPDATE families SET display_name = 'TALAVERA' WHERE name = 'Materna';
UPDATE families SET display_name = name WHERE display_name IS NULL;
```

---

### Mejora 4 — El Canvas debe usar `display_name`

**Archivo:** `apps/frontend/src/components/constellation/Canvas.jsx`

Buscar el bloque `.text((family) => {...})` del label de constelación y sustituir:

```javascript
// ANTES — coge el apellido del primer nodo encontrado (aleatorio)
.text((family) => {
  const fatherNode = nodes.find((n) => { ... });
  return fatherNode ? fatherNode.name.split(' ').pop().toUpperCase() : family.name.toUpperCase();
});

// DESPUÉS — usa el campo display_name de la BD
.text((family) => {
  return (family.display_name || family.name).toUpperCase();
});
```

---

## Orden de implementación recomendado

```
1. Corregir Bug 1 — parseInt → string en PersonsPanel        (2 min)
2. Corregir Bug 2 — parseInt → string en RelationshipsPanel  (2 min)
3. Corregir Bug 3 — filtro de familia en PersonsPanel        (1 min)
4. Corregir Bug 4 — nombres en tabla de relaciones           (5 min)
5. SQL en Neon — añadir display_name si no está              (2 min)
6. Backend — añadir display_name al schema Joi               (2 min)
7. Canvas — usar display_name en el label de constelación    (2 min)
8. Probar flujo completo: crear familia → personas → relaciones → ver en /app
9. Mejora 1 — flujo guiado tras crear persona                (30 min)
10. Mejora 2 — badge "sin relaciones"                        (15 min)
```

Los pasos 1-7 son correcciones de bugs, no nuevas funcionalidades.
Deben hacerse antes de intentar añadir datos reales o el dashboard
seguirá fallando silenciosamente.
