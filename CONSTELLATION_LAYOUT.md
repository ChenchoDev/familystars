# FamilyStars — Constelaciones y Nombres de Familia

## Estado actual del proyecto

### Lo que está funcionando
- **Backend** en Render: API REST completa con todos los endpoints
- **Frontend** en Netlify: constelación interactiva con D3.js, búsqueda, panel de perfil
- **Dashboard admin** en `/admin`: CRUD de familias, personas, relaciones y pendientes
- **BD** en Neon: familias, personas, relaciones, usuarios, fotos, social links
- **Datos reales** en producción: familia Marín (paterna) y Talavera (materna)

### Stack
- Frontend: React + Vite + Tailwind + D3.js → Netlify
- Backend: Node.js + Express (ESM) → Render
- BD: PostgreSQL → Neon
- Auth: JWT + magic links (Resend)

---

## Los dos problemas a resolver en esta tarea

### Problema 1 — El apellido de la constelación es aleatorio

**Dónde está el bug:** `apps/frontend/src/components/constellation/Canvas.jsx`, línea ~130:

```javascript
// CÓDIGO ACTUAL — BUGGY
.text((family) => {
  const fatherNode = nodes.find((n) => {
    const person = persons.find((p) => p.id === n.id);
    return person && person.family_id === family.id && person.last_name;
  });
  return fatherNode ? fatherNode.name.split(' ').pop().toUpperCase() : family.name.toUpperCase();
});
```

**El problema:** `nodes.find()` devuelve el primer nodo que encuentre en el array con ese `family_id`. El orden del array depende de cómo lleguen de la API (por `created_at DESC`). Así que el apellido que aparece en la constelación es el apellido de la persona más reciente añadida a esa familia — completamente aleatorio.

**La solución correcta:** añadir un campo `display_name` a la tabla `families` en la BD. Así el admin controla exactamente qué nombre aparece en la constelación para cada rama.

---

## Solución completa — dos partes

### Parte 1: Añadir `display_name` a la tabla `families`

#### 1a. Migración de BD (Neon)

Ejecutar este SQL directamente en el SQL Editor de Neon:

```sql
-- Añadir columna display_name a families
ALTER TABLE families
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);

-- Rellenar con los valores actuales para no perder datos
-- El display_name es el nombre que aparece en la constelación (en mayúsculas)
UPDATE families SET display_name = 'MARÍN'    WHERE name = 'Paterna';
UPDATE families SET display_name = 'TALAVERA' WHERE name = 'Materna';
UPDATE families SET display_name = name       WHERE display_name IS NULL;
```

#### 1b. Backend — actualizar `families.js` controller

**Archivo:** `apps/backend/src/controllers/families.js`

Añadir `display_name` en todas las queries SELECT y en INSERT/UPDATE:

```javascript
// GET /families — añadir display_name al SELECT
const result = await pool.query(
  `SELECT f.id, f.name, f.display_name, f.color_hex, f.description,
          COUNT(p.id) as person_count,
          u.name as admin_name
   FROM families f
   LEFT JOIN persons p ON f.id = p.family_id AND p.status = 'approved'
   LEFT JOIN users u ON f.admin_id = u.id
   GROUP BY f.id, f.name, f.display_name, f.color_hex, f.description, u.name
   ORDER BY f.name`
);

// GET /families/:id — añadir display_name al SELECT
const result = await pool.query(
  `SELECT f.id, f.name, f.display_name, f.color_hex, f.description,
          f.admin_id, f.created_at, f.updated_at,
          u.name as admin_name, COUNT(p.id) as person_count
   FROM families f
   LEFT JOIN users u ON f.admin_id = u.id
   LEFT JOIN persons p ON f.id = p.family_id AND p.status = 'approved'
   WHERE f.id = $1
   GROUP BY f.id, f.name, f.display_name, f.color_hex, f.description,
            f.admin_id, f.created_at, f.updated_at, u.name`,
  [id]
);

// POST /families — añadir display_name al INSERT
// En createFamily, destructurar display_name de req.validated:
const { name, display_name, color_hex, description } = req.validated;

const result = await pool.query(
  `INSERT INTO families (name, display_name, color_hex, description, admin_id)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING *`,
  [name, display_name || name, color_hex, description, req.user.id]
);
// Si no se proporciona display_name, usar el name como fallback
```

#### 1c. Backend — actualizar validación en `middleware/validate.js`

Buscar el schema de `family` (probablemente con Joi) y añadir `display_name`:

```javascript
family: Joi.object({
  name: Joi.string().min(2).max(100).required(),
  display_name: Joi.string().min(2).max(100).optional(), // nombre en constelación
  color_hex: Joi.string().length(6).required(),
  description: Joi.string().max(500).optional().allow(''),
}),
```

#### 1d. Dashboard admin — actualizar `FamiliesPanel.jsx`

Añadir el campo `display_name` al formulario de crear/editar familia:

```jsx
// Añadir este campo en el formulario, entre Nombre y Color:
<div>
  <label className="...">Nombre en constelación</label>
  <input
    type="text"
    value={form.display_name || ''}
    onChange={(e) => setForm({ ...form, display_name: e.target.value })}
    placeholder="Ej: MARÍN, TALAVERA, García..."
    className="..."
  />
  <p className="text-xs text-gray-500 mt-1">
    Este nombre aparece como fondo en la constelación (en mayúsculas automáticamente)
  </p>
</div>
```

#### 1e. Frontend — arreglar Canvas.jsx

**Archivo:** `apps/frontend/src/components/constellation/Canvas.jsx`

Sustituir el bloque del `.text()` del label de constelación (~línea 130):

```javascript
// ANTES — buggy, apellido aleatorio
.text((family) => {
  const fatherNode = nodes.find((n) => {
    const person = persons.find((p) => p.id === n.id);
    return person && person.family_id === family.id && person.last_name;
  });
  return fatherNode ? fatherNode.name.split(' ').pop().toUpperCase() : family.name.toUpperCase();
});

// DESPUÉS — usa display_name de la BD
.text((family) => {
  return (family.display_name || family.name).toUpperCase();
});
```

Un cambio de una línea que arregla el problema de raíz.

---

### Problema 2 — Las personas no se agrupan por familia en la constelación

**Situación actual:** D3 ForceSimulation coloca las estrellas usando física (repulsión + atracción por links + centro). El resultado es que todas las personas de todas las familias se mezclan en el centro del canvas, agrupándose solo si tienen relaciones entre ellas.

**El objetivo:** que cada familia forme su propia nube/constelación visual, claramente separada de las demás, pero con líneas doradas entre las familias conectadas por matrimonio.

#### Solución: añadir fuerza de agrupación por familia

**Archivo:** `apps/frontend/src/components/constellation/Canvas.jsx`

Justo después de definir `nodes` y antes de crear la simulación, añadir:

```javascript
// 1. Calcular posiciones iniciales por familia (distribuir en círculo)
const familyCount = families.length;
const CLUSTER_RADIUS = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.32;

const familyCenters = {};
families.forEach((family, i) => {
  const angle = (i / familyCount) * 2 * Math.PI - Math.PI / 2;
  familyCenters[family.id] = {
    x: CANVAS_WIDTH / 2 + CLUSTER_RADIUS * Math.cos(angle),
    y: CANVAS_HEIGHT / 2 + CLUSTER_RADIUS * Math.sin(angle),
  };
});

// 2. Asignar posición inicial a cada nodo cerca de su centro de familia
// (evita que la simulación empiece desde el origen y tarde en separarse)
nodes.forEach((node) => {
  const center = familyCenters[node.family_id];
  if (center) {
    node.x = center.x + (Math.random() - 0.5) * 120;
    node.y = center.y + (Math.random() - 0.5) * 120;
  }
});
```

Luego actualizar la simulación para añadir la fuerza de agrupación:

```javascript
// SIMULACIÓN ACTUALIZADA
const simulation = d3
  .forceSimulation(nodes)
  .force(
    'link',
    d3.forceLink(links)
      .id((d) => d.id)
      .distance((d) => {
        // Relaciones dentro de la misma familia: más cortas (unidas)
        // Relaciones entre familias (matrimonios): más largas (separadas pero conectadas)
        const sourceFamily = persons.find((p) => p.id === d.source.id)?.family_id;
        const targetFamily = persons.find((p) => p.id === d.target.id)?.family_id;
        return sourceFamily === targetFamily ? 100 : 280;
      })
  )
  .force('charge', d3.forceManyBody().strength(-350))
  .force('center', d3.forceCenter(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2).strength(0.05))
  .force('collide', d3.forceCollide().radius(STAR_RADIUS * 2.2))
  // NUEVA FUERZA: agrupa cada nodo hacia el centro de su familia
  .force('cluster', (alpha) => {
    nodes.forEach((node) => {
      const center = familyCenters[node.family_id];
      if (!center) return;
      // Fuerza suave que atrae hacia el centro de la constelación familiar
      node.vx += (center.x - node.x) * alpha * 0.25;
      node.vy += (center.y - node.y) * alpha * 0.25;
    });
  });
```

#### Por qué funciona así

- `familyCenters`: coloca cada familia en un punto del círculo imaginario alrededor del centro del canvas. Con 2 familias quedan a izquierda y derecha. Con 4 familias en las 4 esquinas. Se escala automáticamente.
- `node.x/y iniciales`: arrancar los nodos cerca de su familia evita que la simulación empiece desde el centro y tarde 5 segundos en separarse.
- `force('cluster')`: en cada tick de la simulación empuja suavemente cada estrella hacia el centro de su familia. El `0.25` es la intensidad — suficiente para agrupar sin ser tan fuerte que ignore las relaciones entre familias.
- `distance` en los links: las relaciones de matrimonio entre familias tienen distancia 280px en vez de 100px — así las familias se separan visualmente aunque estén conectadas.

---

## Orden de implementación

```
1. SQL en Neon (2 min)
   ALTER TABLE + UPDATE display_name

2. Backend — families.js (5 min)
   Añadir display_name a queries SELECT, INSERT, UPDATE

3. Backend — validate.js (2 min)
   Añadir display_name al schema de family

4. Dashboard — FamiliesPanel.jsx (5 min)
   Añadir campo display_name al formulario

5. Frontend — Canvas.jsx (10 min)
   a) Arreglar .text() del label → usa display_name
   b) Añadir familyCenters + posiciones iniciales
   c) Actualizar simulación con force('cluster') y distances por tipo

6. Probar en local → desplegar
```

---

## Comportamiento esperado tras los cambios

**Constelación con 2 familias (Marín + Talavera):**
```
        [MARÍN]                    [TALAVERA]
    ⭐ Fulgencio                ⭐ Manuel
    ⭐ Isabel      ----gold----  ⭐ Carmen
    ⭐ Chencho    (matrimonio)   ⭐ Marisol
    ⭐ Andrés                   ⭐ Mª Elena
    ⭐ Marisol                  ⭐ Mª Fuensanta
```

- Cada familia forma su nube propia
- El texto de fondo "MARÍN" y "TALAVERA" viene del campo `display_name` de la BD
- La línea dorada discontinua conecta las familias unidas por matrimonio
- Al añadir una familia nueva desde el dashboard, aparece como una tercera nube en el canvas automáticamente

---

## Notas importantes

- **No inventar el apellido** en el frontend. Siempre viene de `family.display_name` de la API. El admin lo controla desde el dashboard.
- **El campo `name`** de `families` sigue siendo el identificador interno (Paterna, Materna...). El `display_name` es solo para mostrar en la constelación.
- **La fuerza de cluster es suave** (`0.25`). Si se sube a `0.5` o más, las familias se separan demasiado y los links de matrimonio quedan muy tensos. No subir de `0.3`.
- **Con muchas personas** (>50 por familia), reducir la fuerza de cluster a `0.15` para que la física pueda distribuirlas mejor dentro de la nube.
- **El `CLUSTER_RADIUS`** se calcula como el 32% del lado más corto del canvas. Funciona bien en móvil y desktop. No hardcodear un número fijo.
