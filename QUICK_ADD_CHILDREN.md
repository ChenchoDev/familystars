# FamilyStars — Añadir hijos de forma rápida

## Contexto

Actualmente para añadir un hijo de una pareja hay que:
1. Crear la persona (1 formulario)
2. Ir a Relaciones → crear relación padre → hijo (1 formulario)
3. Ir a Relaciones → crear relación madre → hijo (1 formulario)
4. Por cada hermano existente → crear relación sibling (N formularios)

Con 3 primas y 2 padres eso son 10+ formularios para algo que debería
ser un solo paso. Esta tarea implementa dos mejoras que se complementan.

---

## Mejora 1 — Botón "Añadir hijo" en la tabla de relaciones

### Dónde

**Archivo:** `apps/frontend/src/components/admin/RelationshipsPanel.jsx`

### Qué hacer

En la tabla de relaciones, cuando el tipo es `partner`, añadir un botón
"+ Hijo" en la columna de Acciones junto a Editar y Eliminar.

```jsx
// En el map de relationships, en la columna Acciones:
<td className="px-6 py-4 space-x-2">
  {rel.type === 'partner' && (
    <button
      onClick={() => handleAddChild(rel)}
      className="text-green-400 hover:text-green-300 font-medium text-sm"
    >
      + Hijo
    </button>
  )}
  <button
    onClick={() => handleEdit(rel)}
    className="text-purple-400 hover:text-purple-300 font-medium text-sm"
  >
    Editar
  </button>
  <button
    onClick={() => setShowDeleteConfirm(rel.id)}
    className="text-red-400 hover:text-red-300 font-medium text-sm"
  >
    Eliminar
  </button>
</td>
```

### Estado necesario

Añadir al componente:

```javascript
const [addChildFor, setAddChildFor] = useState(null);
// addChildFor = { rel, parentA, parentB } cuando se pulsa "+ Hijo"
// null cuando está cerrado

const [childForm, setChildForm] = useState({
  first_name: '',
  last_name: '',
  birth_date: '',
  family_id: '',
});
```

### Handler al pulsar "+ Hijo"

```javascript
const handleAddChild = (rel) => {
  // Determinar la familia del hijo — por defecto la de person_a
  const parentA = persons.find(p => p.id === rel.person_a_id);
  const parentB = persons.find(p => p.id === rel.person_b_id);

  setAddChildFor({ rel, parentA, parentB });
  setChildForm({
    first_name: '',
    // Sugerir apellidos combinados automáticamente
    last_name: parentA && parentB
      ? `${parentA.last_name} ${parentB.last_name}`
      : '',
    birth_date: '',
    // Heredar la familia de person_a por defecto
    family_id: rel.person_a?.id
      ? persons.find(p => p.id === rel.person_a_id)?.family_id || ''
      : '',
  });
};
```

### Formulario modal "Añadir hijo"

Mostrar justo debajo de la tabla (o como overlay) cuando `addChildFor !== null`:

```jsx
{addChildFor && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
      <h3 className="text-white text-lg font-bold mb-2">Añadir hijo</h3>
      <p className="text-gray-400 text-sm mb-4">
        Hijo de{' '}
        <span className="text-purple-400">
          {addChildFor.rel.person_a?.name}
        </span>
        {' '}y{' '}
        <span className="text-purple-400">
          {addChildFor.rel.person_b?.name}
        </span>
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={childForm.first_name}
              onChange={e => setChildForm({ ...childForm, first_name: e.target.value })}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1">
              Apellidos *
            </label>
            <input
              type="text"
              value={childForm.last_name}
              onChange={e => setChildForm({ ...childForm, last_name: e.target.value })}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="text-gray-300 text-sm font-medium block mb-1">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            value={childForm.birth_date}
            onChange={e => setChildForm({ ...childForm, birth_date: e.target.value })}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="text-gray-300 text-sm font-medium block mb-1">
            Familia
          </label>
          <select
            value={childForm.family_id}
            onChange={e => setChildForm({ ...childForm, family_id: e.target.value })}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Selecciona familia</option>
            {families.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSubmitChild}
          disabled={!childForm.first_name || !childForm.last_name || !childForm.family_id}
          className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium"
        >
          Crear y vincular
        </button>
        <button
          onClick={() => setAddChildFor(null)}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg font-medium"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
```

### Handler submit — crea persona + relaciones de golpe

```javascript
const handleSubmitChild = async () => {
  if (!childForm.first_name || !childForm.last_name || !childForm.family_id) return;

  try {
    // 1. Crear la persona
    const { personsAPI, relationshipsAPI } = await import('../../api/client');

    const personRes = await personsAPI.create({
      first_name: childForm.first_name,
      last_name: childForm.last_name,
      birth_date: childForm.birth_date || '',
      family_id: childForm.family_id,
      birth_place: '',
      current_location: '',
      bio: '',
      status: 'approved',
    });

    const newPersonId = personRes.data?.id || personRes.data?.data?.id;
    if (!newPersonId) throw new Error('No se pudo obtener el ID de la persona creada');

    const parentAId = addChildFor.rel.person_a_id;
    const parentBId = addChildFor.rel.person_b_id;

    // 2. Crear relación padre A → hijo
    await relationshipsAPI.create({
      person_a_id: parentAId,
      person_b_id: newPersonId,
      type: 'parent',
      notes: '',
      verified: true,
    });

    // 3. Crear relación padre B → hijo
    await relationshipsAPI.create({
      person_a_id: parentBId,
      person_b_id: newPersonId,
      type: 'parent',
      notes: '',
      verified: true,
    });

    // 4. Crear relaciones sibling con hermanos existentes
    // Buscar otros hijos de esta pareja (personas que tengan parent con parentA Y parentB)
    const siblings = persons.filter(p => {
      const hasParentA = relationships.some(
        r => r.person_a_id === parentAId && r.person_b_id === p.id && r.type === 'parent'
      );
      const hasParentB = relationships.some(
        r => r.person_a_id === parentBId && r.person_b_id === p.id && r.type === 'parent'
      );
      return hasParentA && hasParentB && p.id !== newPersonId;
    });

    for (const sibling of siblings) {
      await relationshipsAPI.create({
        person_a_id: newPersonId,
        person_b_id: sibling.id,
        type: 'sibling',
        notes: '',
        verified: true,
      });
    }

    showToast(
      `${childForm.first_name} creado/a con ${2 + siblings.length} relaciones`
    );
    setAddChildFor(null);
    setChildForm({ first_name: '', last_name: '', birth_date: '', family_id: '' });
    fetchData(); // recargar tabla
  } catch (err) {
    showToast(err.message || 'Error al crear', 'error');
  }
};
```

---

## Mejora 2 — Campos "Padre" y "Madre" en el formulario de Nueva persona

### Dónde

**Archivo:** `apps/frontend/src/components/admin/PersonsPanel.jsx`

### Estado adicional necesario

```javascript
// Añadir al formData inicial:
const [formData, setFormData] = useState({
  // ...campos existentes...
  parent_a_id: '',  // ID del padre
  parent_b_id: '',  // ID de la madre
});

// Buscadores para los selects de padres:
const [searchParentA, setSearchParentA] = useState('');
const [searchParentB, setSearchParentB] = useState('');
const [filteredParentsA, setFilteredParentsA] = useState([]);
const [filteredParentsB, setFilteredParentsB] = useState([]);
```

PersonsPanel ya carga `families` pero NO carga `relationships` ni la lista
completa de personas aprobadas para los selects. Añadir al `fetchData`:

```javascript
// Añadir relationshipsAPI a los imports del componente
import { personsAPI, familiesAPI, relationshipsAPI } from '../../api/client';

// En fetchData, añadir:
const [personsResponse, familiesResponse, relationshipsResponse] = await Promise.all([
  personsAPI.list(),
  familiesAPI.list(),
  relationshipsAPI.list(),
]);
// Guardar en estado:
const [relationships, setRelationships] = useState([]);
// ...
setRelationships(Array.isArray(relationshipsResponse.data) ? relationshipsResponse.data : []);
```

### Añadir sección "Padres" al formulario

Justo antes de los botones Crear/Cancelar, añadir esta sección:

```jsx
{/* Padres */}
<div>
  <h4 className="text-gray-300 font-semibold text-sm mb-4">
    Padres (opcional)
  </h4>
  <p className="text-gray-500 text-xs mb-3">
    Si indicas los padres, se crearán las relaciones automáticamente
    al guardar — incluyendo vínculos con hermanos existentes.
  </p>

  {/* Buscador Padre */}
  <div className="mb-3">
    <label className="text-gray-300 text-sm font-medium block mb-1">
      Padre / Madre 1
    </label>
    <div className="relative">
      <input
        type="text"
        value={searchParentA}
        onChange={e => {
          setSearchParentA(e.target.value);
          setFilteredParentsA(
            persons.filter(p =>
              `${p.first_name} ${p.last_name}`
                .toLowerCase()
                .includes(e.target.value.toLowerCase())
            ).slice(0, 8)
          );
        }}
        placeholder="Busca por nombre..."
        className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
      />
      {filteredParentsA.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
          {filteredParentsA.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setFormData({ ...formData, parent_a_id: p.id });
                setSearchParentA(`${p.first_name} ${p.last_name}`);
                setFilteredParentsA([]);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white text-sm"
            >
              {p.first_name} {p.last_name}
            </button>
          ))}
        </div>
      )}
    </div>
    {formData.parent_a_id && (
      <button
        type="button"
        onClick={() => { setFormData({ ...formData, parent_a_id: '' }); setSearchParentA(''); }}
        className="text-xs text-red-400 mt-1"
      >
        ✕ Quitar
      </button>
    )}
  </div>

  {/* Buscador Padre/Madre 2 — misma estructura que el anterior */}
  <div>
    <label className="text-gray-300 text-sm font-medium block mb-1">
      Padre / Madre 2
    </label>
    {/* Mismo componente de búsqueda pero para parent_b_id / searchParentB */}
  </div>
</div>
```

### Actualizar handleSubmit para crear relaciones automáticamente

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const data = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      family_id: formData.family_id,
      birth_date: formData.birth_date || '',
      death_date: formData.is_deceased ? formData.death_date || '' : '',
      birth_place: formData.birth_place || '',
      current_location: formData.current_location || '',
      bio: formData.bio || '',
      status: 'approved',
    };

    let personId;

    if (editingId) {
      await personsAPI.update(editingId, data);
      personId = editingId;
      showToast('Persona actualizada correctamente');
    } else {
      const res = await personsAPI.create(data);
      personId = res.data?.id || res.data?.data?.id;

      // Si se especificaron padres, crear relaciones automáticamente
      if (personId && (formData.parent_a_id || formData.parent_b_id)) {
        const parentIds = [formData.parent_a_id, formData.parent_b_id].filter(Boolean);

        // Crear relación parent para cada padre
        for (const parentId of parentIds) {
          await relationshipsAPI.create({
            person_a_id: parentId,
            person_b_id: personId,
            type: 'parent',
            notes: '',
            verified: true,
          });
        }

        // Buscar hermanos — hijos que compartan al menos un padre
        if (parentIds.length > 0) {
          const siblings = persons.filter(p => {
            return parentIds.some(parentId =>
              relationships.some(
                r => r.person_a_id === parentId &&
                     r.person_b_id === p.id &&
                     r.type === 'parent'
              )
            );
          });

          for (const sibling of siblings) {
            await relationshipsAPI.create({
              person_a_id: personId,
              person_b_id: sibling.id,
              type: 'sibling',
              notes: '',
              verified: true,
            });
          }
        }

        const totalRelations = parentIds.length + siblings.length;
        showToast(`Persona creada con ${totalRelations} relaciones automáticas`);
      } else {
        showToast('Persona creada correctamente');
      }
    }

    // Reset form
    setFormData({
      first_name: '', last_name: '', family_id: '',
      birth_date: '', death_date: '', birth_place: '',
      current_location: '', bio: '',
      instagram: '', facebook: '', linkedin: '',
      is_deceased: false,
      parent_a_id: '', parent_b_id: '',
    });
    setSearchParentA('');
    setSearchParentB('');
    setEditingId(null);
    setShowForm(false);
    fetchData();
  } catch (err) {
    showToast(err.message || 'Error al guardar', 'error');
  }
};
```

---

## Notas importantes

- **El orden importa en los siblings:** la búsqueda de hermanos se hace
  con los datos cargados en memoria en ese momento. Si se acaban de crear
  dos hermanos en la misma sesión sin recargar, el segundo puede no detectar
  al primero. Solución: tras crear cada persona, llamar a `fetchData()` antes
  de crear la siguiente. Ya está implementado al final del submit.

- **No duplicar relaciones:** antes de crear cada relación de sibling,
  verificar que no existe ya. Añadir este check en el loop de siblings:

```javascript
const alreadyExists = relationships.some(
  r => (r.person_a_id === personId && r.person_b_id === sibling.id) ||
       (r.person_a_id === sibling.id && r.person_b_id === personId)
);
if (!alreadyExists) {
  await relationshipsAPI.create({ ... });
}
```

- **La Mejora 1 (botón en tabla)** es independiente de la Mejora 2
  (campos en formulario). Se pueden implementar en cualquier orden.
  Recomendado: empezar por la Mejora 1 por ser más sencilla.

---

## Orden de implementación

```
1. RelationshipsPanel.jsx
   a) Añadir estado: addChildFor, childForm
   b) Añadir handleAddChild
   c) Añadir handleSubmitChild
   d) Añadir botón "+ Hijo" en filas con type === 'partner'
   e) Añadir modal de formulario
   f) Probar con Julio + Mª Fuensanta → añadir Carmen

2. PersonsPanel.jsx
   a) Añadir relationshipsAPI al fetchData
   b) Añadir estado: relationships, searchParentA/B, filteredParentsA/B
   c) Añadir sección "Padres" al formulario con buscadores
   d) Actualizar handleSubmit para crear relaciones automáticas
   e) Probar creando una persona nueva con padres seleccionados
```
