# FamilyStars — Rediseño paneles admin: Stats, Families, Persons, Pending

## Instrucción general

Reemplazar los 4 archivos completos. Todo inline styles, sin Tailwind,
coherente con el RelationshipsPanel ya rediseñado.

---

## ARCHIVO 1 — StatsPanel.jsx

**Ruta:** `apps/frontend/src/components/admin/StatsPanel.jsx`

```jsx
import { useEffect, useState } from 'react';
import { adminAPI, personsAPI } from '../../api/client';

export default function StatsPanel({ onPendingCountChange }) {
  const [stats, setStats] = useState(null);
  const [recentPersons, setRecentPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsRes = await adminAPI.getStats();
        const statsData = statsRes.data || statsRes;
        setStats(statsData);
        onPendingCountChange(statsData.pending_count || 0);
        try {
          const personsRes = await personsAPI.list();
          const persons = Array.isArray(personsRes.data) ? personsRes.data : [];
          setRecentPersons(persons.filter(p => p.status === 'approved').slice(0, 5));
        } catch { setRecentPersons([]); }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [onPendingCountChange]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <p style={{ color: '#9ca3af' }}>Cargando estadísticas...</p>
    </div>
  );

  if (error) return (
    <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '10px', padding: '16px' }}>
      <p style={{ color: '#fca5a5', fontWeight: '600' }}>Error al cargar estadísticas</p>
      <p style={{ color: '#f87171', fontSize: '13px', marginTop: '4px' }}>{error}</p>
    </div>
  );

  if (!stats) return null;

  const statCards = [
    { label: 'Total de personas',   value: stats.total_persons,       icon: '👥', color: '#7c3aed' },
    { label: 'Total de familias',   value: stats.total_families,      icon: '⭐', color: '#0891b2' },
    { label: 'Total relaciones',    value: stats.total_relationships,  icon: '🔗', color: '#059669' },
    { label: 'Pendientes',          value: stats.pending_count || 0,   icon: '⏳', color: stats.pending_count > 0 ? '#d97706' : '#374151' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} style={{
            background: '#1f2937', border: '1px solid #374151', borderRadius: '12px',
            padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
              background: `${color}22`, border: `1px solid ${color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
            }}>{icon}</div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: '500', margin: 0 }}>{label}</p>
              <p style={{ color: '#fff', fontSize: '28px', fontWeight: '700', margin: '2px 0 0' }}>{value ?? '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Últimas personas */}
      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: '0 0 16px' }}>
          Últimas personas añadidas
        </h3>
        {recentPersons.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '14px' }}>No hay personas aún</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentPersons.map(person => (
              <div key={person.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px', background: '#111827', borderRadius: '10px',
                border: '1px solid #374151',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  overflow: 'hidden', background: '#374151',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {person.avatar_url
                    ? <img src={person.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#6b7280', fontSize: '18px' }}>👤</span>
                  }
                </div>
                <div>
                  <p style={{ color: '#e5e7eb', fontWeight: '600', fontSize: '14px', margin: 0 }}>
                    {person.first_name} {person.last_name}
                  </p>
                  {person.birth_date && (
                    <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>
                      {new Date(person.birth_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## ARCHIVO 2 — FamiliesPanel.jsx

**Ruta:** `apps/frontend/src/components/admin/FamiliesPanel.jsx`

```jsx
import { useEffect, useState } from 'react';
import { familiesAPI } from '../../api/client';

const S = {
  input: { width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  label: { color: '#9ca3af', fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '6px' },
  btnPrimary: { padding: '9px 18px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnSecondary: { padding: '9px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid #374151', borderRadius: '8px', color: '#9ca3af', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#111827', borderBottom: '1px solid #374151' },
  td: { padding: '14px 16px', fontSize: '14px', borderBottom: '1px solid #1f2937' },
};

export default function FamiliesPanel({ onPendingCountChange }) {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', display_name: '', description: '', color_hex: '9B59B6' });
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchFamilies(); }, [onPendingCountChange]);

  const fetchFamilies = async () => {
    try {
      setLoading(true); setError(null);
      const res = await familiesAPI.list();
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setFamilies(data);
    } catch (err) {
      setError(err?.message || 'Error al cargar familias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await familiesAPI.update(editingId, formData); showToast('Familia actualizada'); }
      else { await familiesAPI.create(formData); showToast('Familia creada'); }
      setFormData({ name: '', display_name: '', description: '', color_hex: '9B59B6' });
      setEditingId(null); setShowForm(false);
      fetchFamilies();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleEdit = (f) => {
    setFormData({ name: f.name, display_name: f.display_name || '', description: f.description || '', color_hex: f.color_hex || '9B59B6' });
    setEditingId(f.id); setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ name: '', display_name: '', description: '', color_hex: '9B59B6' });
    setEditingId(null); setShowForm(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}><p style={{ color: '#9ca3af' }}>Cargando familias...</p></div>;
  if (error) return <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '10px', padding: '16px' }}><p style={{ color: '#fca5a5' }}>{error}</p></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {!showForm && (
        <div><button onClick={() => setShowForm(true)} style={S.btnPrimary}>+ Nueva familia</button></div>
      )}

      {showForm && (
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: '0 0 20px' }}>
            {editingId ? 'Editar familia' : 'Nueva familia'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={S.label}>Nombre interno *</label>
              <input type="text" value={formData.name} required
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Marín Iniesta, Castell Sánchez..."
                style={S.input}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#374151'} />
            </div>
            <div>
              <label style={S.label}>Nombre en constelación</label>
              <input type="text" value={formData.display_name}
                onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Ej: MARÍN, TALAVERA, CASTELL..."
                style={S.input}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#374151'} />
              <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
                Aparece como fondo en la constelación (en mayúsculas automáticamente)
              </p>
            </div>
            <div>
              <label style={S.label}>Descripción</label>
              <textarea value={formData.description} rows={3}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de esta rama familiar..."
                style={{ ...S.input, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#374151'} />
            </div>
            <div>
              <label style={S.label}>Color de constelación *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input type="color" value={`#${formData.color_hex}`}
                  onChange={e => setFormData({ ...formData, color_hex: e.target.value.substring(1) })}
                  style={{ width: '56px', height: '40px', borderRadius: '8px', border: '1px solid #374151', cursor: 'pointer', background: 'none', padding: '2px' }} />
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `#${formData.color_hex}`, border: '2px solid #374151', flexShrink: 0 }} />
                <span style={{ color: '#9ca3af', fontSize: '13px' }}>#{formData.color_hex.toUpperCase()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={S.btnPrimary}>{editingId ? 'Guardar cambios' : 'Crear'}</button>
              <button type="button" onClick={handleCancel} style={S.btnSecondary}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={S.th}>Color</th>
              <th style={S.th}>Nombre</th>
              <th style={S.th}>Constelación</th>
              <th style={S.th}>Descripción</th>
              <th style={S.th}>Personas</th>
              <th style={S.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {families.length === 0 ? (
              <tr><td colSpan="6" style={{ ...S.td, textAlign: 'center', color: '#6b7280', padding: '32px' }}>No hay familias aún</td></tr>
            ) : families.map((f, i) => (
              <tr key={f.id}
                style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
              >
                <td style={S.td}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `#${f.color_hex}`, border: '2px solid rgba(255,255,255,0.1)' }} />
                </td>
                <td style={{ ...S.td, color: '#e5e7eb', fontWeight: '600' }}>{f.name}</td>
                <td style={S.td}>
                  {f.display_name
                    ? <span style={{ color: `#${f.color_hex}`, fontWeight: '700', fontSize: '13px', letterSpacing: '1px' }}>{f.display_name.toUpperCase()}</span>
                    : <span style={{ color: '#6b7280' }}>—</span>
                  }
                </td>
                <td style={{ ...S.td, color: '#9ca3af', fontSize: '13px' }}>{f.description || '—'}</td>
                <td style={{ ...S.td, color: '#e5e7eb', fontWeight: '600' }}>{f.person_count || 0}</td>
                <td style={S.td}>
                  <button onClick={() => handleEdit(f)} style={{
                    background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: '6px', color: '#a78bfa', fontSize: '12px',
                    fontWeight: '600', padding: '4px 10px', cursor: 'pointer',
                  }}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', zIndex: 10000, color: '#fff', background: toast.type === 'error' ? '#dc2626' : '#059669' }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
```

---

## ARCHIVO 3 — PersonsPanel.jsx

**Ruta:** `apps/frontend/src/components/admin/PersonsPanel.jsx`

Mantener toda la lógica existente pero reemplazar SOLO los estilos.
Buscar y sustituir todos los `className="..."` por estilos inline
siguiendo el mismo patrón que FamiliesPanel y RelationshipsPanel.

Los cambios clave son:

**Botón principal:**
```jsx
// ANTES
className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
// DESPUÉS
style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
```

**Inputs y selects:**
```jsx
// ANTES
className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
// DESPUÉS
style={{ width: '100%', padding: '10px 14px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
onFocus={e => e.target.style.borderColor = '#7c3aed'}
onBlur={e => e.target.style.borderColor = '#374151'}
```

**Tabla:**
```jsx
// Contenedor tabla
// ANTES: className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
// DESPUÉS:
style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', overflow: 'hidden' }}

// thead tr
// ANTES: className="bg-gray-700 text-gray-300 text-xs uppercase font-medium"
// th: className="px-6 py-3 text-left"
// DESPUÉS cada th:
style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#111827', borderBottom: '1px solid #374151' }}

// tbody tr
// ANTES: className="hover:bg-gray-700 transition-colors"
// DESPUÉS:
onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.06)'}
onMouseLeave={e => e.currentTarget.style.background = 'transparent'}

// td
// ANTES: className="px-6 py-4 ..."
// DESPUÉS:
style={{ padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #1f2937' }}
```

**Botones de acción en tabla:**
```jsx
// Editar
style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '6px', color: '#a78bfa', fontSize: '12px', fontWeight: '600', padding: '4px 10px', cursor: 'pointer' }}

// Eliminar
style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '6px', color: '#fca5a5', fontSize: '12px', fontWeight: '600', padding: '4px 10px', cursor: 'pointer' }}

// Fotos
style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '6px', color: '#67e8f9', fontSize: '12px', fontWeight: '600', padding: '4px 10px', cursor: 'pointer' }}
```

**Modales (delete confirm):**
```jsx
// Overlay
style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}

// Card
style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '16px', padding: '28px', maxWidth: '380px', width: '100%' }}
```

**Toast:**
```jsx
style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', zIndex: 10000, color: '#fff', background: toast.type === 'error' ? '#dc2626' : '#059669' }}
```

---

## ARCHIVO 4 — PendingPanel.jsx

**Ruta:** `apps/frontend/src/components/admin/PendingPanel.jsx`

```jsx
import { useEffect, useState } from 'react';
import { adminAPI, personsAPI, relationshipsAPI, familiesAPI } from '../../api/client';

export default function PendingPanel({ onPendingCountChange }) {
  const [pending, setPending] = useState(null);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchPending(); }, [onPendingCountChange]);

  const fetchPending = async () => {
    try {
      setLoading(true); setError(null);
      const [pendingRes, famRes] = await Promise.all([adminAPI.getPending(), familiesAPI.list()]);
      const data = pendingRes.data || pendingRes;
      setPending(data);
      setFamilies(Array.isArray(famRes.data) ? famRes.data : []);
      const total = (data?.pending_persons?.length || 0) + (data?.pending_relationships?.length || 0);
      onPendingCountChange(total);
    } catch (err) {
      setError(err?.message || 'Error al cargar pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePerson = async (id) => {
    try { await personsAPI.approve(id); showToast('Persona aprobada'); fetchPending(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  const handleRejectPerson = async (id) => {
    try { await personsAPI.delete(id); showToast('Persona rechazada'); fetchPending(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  const handleApproveRelationship = async (id) => {
    try { await relationshipsAPI.approve(id); showToast('Relación aprobada'); fetchPending(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  const handleRejectRelationship = async (id) => {
    try { await relationshipsAPI.delete(id); showToast('Relación rechazada'); fetchPending(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getFamilyName = (id) => families.find(f => f.id === id)?.name || 'Sin familia';
  const getFamilyColor = (id) => families.find(f => f.id === id)?.color_hex || '374151';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <p style={{ color: '#9ca3af' }}>Cargando pendientes...</p>
    </div>
  );

  if (error) return (
    <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '10px', padding: '16px' }}>
      <p style={{ color: '#fca5a5', fontWeight: '600' }}>Error al cargar pendientes</p>
      <p style={{ color: '#f87171', fontSize: '13px', marginTop: '4px' }}>{error}</p>
    </div>
  );

  const hasPending = pending?.pending_persons?.length > 0 || pending?.pending_relationships?.length > 0;

  if (!hasPending) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
      <p style={{ color: '#e5e7eb', fontSize: '20px', fontWeight: '700', margin: 0 }}>Todo al día</p>
      <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>No hay sugerencias pendientes de aprobación</p>
    </div>
  );

  const cardStyle = {
    background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '20px',
  };

  const btnApprove = {
    flex: 1, padding: '9px', background: 'rgba(5,150,105,0.15)',
    border: '1px solid rgba(5,150,105,0.3)', borderRadius: '8px',
    color: '#6ee7b7', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  };

  const btnReject = {
    flex: 1, padding: '9px', background: 'rgba(220,38,38,0.1)',
    border: '1px solid rgba(220,38,38,0.25)', borderRadius: '8px',
    color: '#fca5a5', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Personas pendientes */}
      {pending?.pending_persons?.length > 0 && (
        <div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👤 Personas pendientes
            <span style={{ background: '#d97706', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
              {pending.pending_persons.length}
            </span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {pending.pending_persons.map(person => (
              <div key={person.id} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '16px', margin: 0 }}>
                      {person.first_name} {person.last_name}
                    </h3>
                    {person.family_id && (
                      <span style={{
                        display: 'inline-block', marginTop: '6px',
                        background: `#${getFamilyColor(person.family_id)}`,
                        color: '#fff', fontSize: '11px', fontWeight: '600',
                        padding: '2px 10px', borderRadius: '10px',
                      }}>{getFamilyName(person.family_id)}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '28px' }}>👤</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                  {person.birth_date && (
                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                      <span style={{ color: '#6b7280' }}>Nacimiento: </span>
                      {new Date(person.birth_date).toLocaleDateString()}
                    </p>
                  )}
                  {person.birth_place && (
                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                      <span style={{ color: '#6b7280' }}>Lugar: </span>{person.birth_place}
                    </p>
                  )}
                  {person.created_at && (
                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                      <span style={{ color: '#6b7280' }}>Sugerido: </span>
                      {new Date(person.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleApprovePerson(person.id)} style={btnApprove}>✅ Aprobar</button>
                  <button onClick={() => handleRejectPerson(person.id)} style={btnReject}>❌ Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relaciones pendientes */}
      {pending?.pending_relationships?.length > 0 && (
        <div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔗 Relaciones pendientes
            <span style={{ background: '#d97706', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
              {pending.pending_relationships.length}
            </span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pending.pending_relationships.map(rel => (
              <div key={rel.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#e5e7eb', fontWeight: '600', fontSize: '14px', margin: 0 }}>
                    {rel.person_a?.name || rel.person_a_id}
                    <span style={{ color: '#7c3aed', margin: '0 8px' }}>→</span>
                    {rel.type}
                    <span style={{ color: '#7c3aed', margin: '0 8px' }}>→</span>
                    {rel.person_b?.name || rel.person_b_id}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => handleApproveRelationship(rel.id)} style={{ ...btnApprove, flex: 'none', padding: '6px 14px' }}>✅</button>
                  <button onClick={() => handleRejectRelationship(rel.id)} style={{ ...btnReject, flex: 'none', padding: '6px 14px' }}>❌</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', zIndex: 10000, color: '#fff', background: toast.type === 'error' ? '#dc2626' : '#059669' }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
```

---

## Orden de implementación

```
1. StatsPanel.jsx    → reemplazar completo
2. FamiliesPanel.jsx → reemplazar completo
3. PendingPanel.jsx  → reemplazar completo
4. PersonsPanel.jsx  → aplicar los cambios de estilos indicados
5. Redesplegar en Netlify
```

## Nota sobre PersonsPanel

PersonsPanel es el más largo y tiene más lógica. En vez de reescribirlo
completo, aplicar los cambios de className → inline style indicados
en la sección correspondiente. La lógica de negocio (estados, handlers,
fetchData, handleSubmit, etc.) NO se toca.
