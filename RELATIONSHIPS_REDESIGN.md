# FamilyStars — Rediseño RelationshipsPanel

## Instrucción

Reemplazar el archivo completo `apps/frontend/src/components/admin/RelationshipsPanel.jsx`
con el siguiente código. Todo inline styles, sin Tailwind, coherente con
el resto del dashboard rediseñado.

---

```jsx
import { useEffect, useState } from 'react';
import { relationshipsAPI, personsAPI, familiesAPI } from '../../api/client';

const TYPE_LABELS = {
  parent:  { label: 'Padre/Madre de', color: '#1e40af' },
  child:   { label: 'Hijo/a de',      color: '#065f46' },
  partner: { label: 'Pareja de',      color: '#831843' },
  sibling: { label: 'Hermano/a de',   color: '#78350f' },
  cousin:  { label: 'Primo/a de',     color: '#7c2d12' },
  other:   { label: 'Otro',           color: '#374151' },
};

const S = {
  input: {
    width: '100%', padding: '10px 14px',
    background: '#111827', border: '1px solid #374151',
    borderRadius: '8px', color: '#fff', fontSize: '14px',
    boxSizing: 'border-box', outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%', padding: '10px 14px',
    background: '#111827', border: '1px solid #374151',
    borderRadius: '8px', color: '#fff', fontSize: '14px',
    boxSizing: 'border-box', outline: 'none', cursor: 'pointer',
  },
  label: {
    color: '#9ca3af', fontSize: '12px', fontWeight: '500',
    display: 'block', marginBottom: '6px',
  },
  btnPrimary: {
    padding: '9px 18px',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    border: 'none', borderRadius: '8px', color: '#fff',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  btnSecondary: {
    padding: '9px 18px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid #374151',
    borderRadius: '8px', color: '#9ca3af',
    fontSize: '14px', fontWeight: '500', cursor: 'pointer',
  },
  btnDanger: {
    padding: '9px 18px',
    background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
    borderRadius: '8px', color: '#fca5a5',
    fontSize: '14px', fontWeight: '500', cursor: 'pointer',
  },
  card: {
    background: '#1f2937', border: '1px solid #374151',
    borderRadius: '12px', padding: '24px',
  },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: '600', color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    background: '#111827', borderBottom: '1px solid #374151',
  },
  td: {
    padding: '12px 16px', fontSize: '14px',
    borderBottom: '1px solid #1f2937',
  },
};

export default function RelationshipsPanel({ onPendingCountChange }) {
  const [relationships, setRelationships] = useState([]);
  const [persons, setPersons] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchPersonA, setSearchPersonA] = useState('');
  const [searchPersonB, setSearchPersonB] = useState('');
  const [filteredPersonsA, setFilteredPersonsA] = useState([]);
  const [filteredPersonsB, setFilteredPersonsB] = useState([]);
  const [formData, setFormData] = useState({ person_a_id: '', type: '', person_b_id: '', notes: '' });
  const [addChildFor, setAddChildFor] = useState(null);
  const [childForm, setChildForm] = useState({
    first_name: '', last_name: '', birth_date: '', death_date: '',
    is_deceased: false, birth_place: '', current_location: '',
    bio: '', family_id: '', instagram: '', facebook: '', linkedin: '',
  });

  useEffect(() => { fetchData(); }, [onPendingCountChange]);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const [relRes, persRes, famRes] = await Promise.all([
        relationshipsAPI.list(), personsAPI.list(), familiesAPI.list(),
      ]);
      setRelationships(Array.isArray(relRes.data) ? relRes.data : []);
      setPersons((Array.isArray(persRes.data) ? persRes.data : []).filter(p => p.status === 'approved'));
      setFamilies(Array.isArray(famRes.data) ? famRes.data : []);
    } catch (err) {
      setError(err?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const getPersonName = (id) => {
    const p = persons.find(p => p.id === id);
    return p ? `${p.first_name} ${p.last_name}` : '—';
  };

  const handleSearchA = (term) => {
    setSearchPersonA(term);
    setFilteredPersonsA(term.trim()
      ? persons.filter(p => `${p.first_name} ${p.last_name}`.toLowerCase().includes(term.toLowerCase()) && p.id !== formData.person_b_id)
      : []);
  };

  const handleSearchB = (term) => {
    setSearchPersonB(term);
    setFilteredPersonsB(term.trim()
      ? persons.filter(p => `${p.first_name} ${p.last_name}`.toLowerCase().includes(term.toLowerCase()) && p.id !== formData.person_a_id)
      : []);
  };

  const handleEdit = (rel) => {
    setFormData({ person_a_id: rel.person_a_id, type: rel.type, person_b_id: rel.person_b_id, notes: rel.notes || '' });
    setEditingId(rel.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editingId) {
        const exists = relationships.some(r =>
          (r.person_a_id === formData.person_a_id && r.person_b_id === formData.person_b_id) ||
          (r.person_a_id === formData.person_b_id && r.person_b_id === formData.person_a_id)
        );
        if (exists) { showToast('Ya existe una relación entre estas personas', 'error'); return; }
      }
      const data = { person_a_id: formData.person_a_id, type: formData.type, person_b_id: formData.person_b_id, notes: formData.notes || '', verified: true };
      if (editingId) { await relationshipsAPI.update(editingId, data); showToast('Relación actualizada'); }
      else { await relationshipsAPI.create(data); showToast('Relación creada'); }
      handleCancel();
      fetchData();
    } catch (err) { showToast(err.message || 'Error', 'error'); }
  };

  const handleCancel = () => {
    setFormData({ person_a_id: '', type: '', person_b_id: '', notes: '' });
    setEditingId(null); setSearchPersonA(''); setSearchPersonB('');
    setFilteredPersonsA([]); setFilteredPersonsB([]);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    try {
      await relationshipsAPI.delete(id);
      showToast('Relación eliminada');
      setShowDeleteConfirm(null);
      fetchData();
    } catch (err) { showToast(err.message || 'Error', 'error'); }
  };

  const handleAddChild = (rel) => {
    setAddChildFor({ rel, parentA: rel.person_a, parentB: rel.person_b });
    setChildForm({
      first_name: '', last_name: '', birth_date: '', death_date: '',
      is_deceased: false, birth_place: '', current_location: '',
      bio: '', family_id: '', instagram: '', facebook: '', linkedin: '',
    });
  };

  const handleSubmitChild = async () => {
    if (!childForm.first_name || !childForm.last_name || !childForm.family_id) return;
    try {
      const personRes = await personsAPI.create({
        first_name: childForm.first_name, last_name: childForm.last_name,
        birth_date: childForm.birth_date || null,
        death_date: childForm.is_deceased ? childForm.death_date || null : null,
        birth_place: childForm.birth_place || '',
        current_location: childForm.current_location || '',
        bio: childForm.bio || '', family_id: childForm.family_id, status: 'approved',
      });
      const newId = personRes.data?.id || personRes.data?.data?.id;
      if (!newId) throw new Error('No se pudo obtener el ID');

      const parentAId = addChildFor.rel.person_a?.id || addChildFor.rel.person_a_id;
      const parentBId = addChildFor.rel.person_b?.id || addChildFor.rel.person_b_id;

      await relationshipsAPI.create({ person_a_id: parentAId, person_b_id: newId, type: 'parent', notes: '', verified: true });
      await relationshipsAPI.create({ person_a_id: parentBId, person_b_id: newId, type: 'parent', notes: '', verified: true });

      const siblings = persons.filter(p => {
        const hasA = relationships.some(r => r.person_a_id === parentAId && r.person_b_id === p.id && r.type === 'parent');
        const hasB = relationships.some(r => r.person_a_id === parentBId && r.person_b_id === p.id && r.type === 'parent');
        return hasA && hasB;
      });
      for (const sib of siblings) {
        await relationshipsAPI.create({ person_a_id: newId, person_b_id: sib.id, type: 'sibling', notes: '', verified: true });
      }

      showToast(`${childForm.first_name} creado con ${2 + siblings.length} relaciones`);
      setAddChildFor(null);
      fetchData();
    } catch (err) { showToast(err.message || 'Error al crear', 'error'); }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const PersonSearch = ({ value, filtered, onSearch, onSelect, exclude, label }) => (
    <div>
      <label style={S.label}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type="text" value={value} onChange={e => onSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          style={S.input}
          onFocus={e => e.target.style.borderColor = '#7c3aed'}
          onBlur={e => e.target.style.borderColor = '#374151'} />
        {filtered.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: '#1f2937', border: '1px solid #374151', borderRadius: '8px',
            maxHeight: '200px', overflowY: 'auto', zIndex: 50,
          }}>
            {filtered.map(p => {
              const fam = families.find(f => f.id === p.family_id);
              return (
                <button key={p.id} type="button" onClick={() => onSelect(p)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '10px 14px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#fff', fontSize: '14px', textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#374151'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span>{p.first_name} {p.last_name}</span>
                  {fam && (
                    <span style={{
                      background: `#${fam.color_hex}`, color: '#fff',
                      fontSize: '11px', padding: '2px 8px', borderRadius: '10px', flexShrink: 0,
                    }}>{fam.name}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <p style={{ color: '#9ca3af' }}>Cargando relaciones...</p>
    </div>
  );

  if (error) return (
    <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '10px', padding: '16px' }}>
      <p style={{ color: '#fca5a5', fontWeight: '600' }}>Error al cargar relaciones</p>
      <p style={{ color: '#f87171', fontSize: '13px', marginTop: '4px' }}>{error}</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Botón nueva relación */}
      {!showForm && (
        <div>
          <button onClick={() => setShowForm(true)} style={S.btnPrimary}>
            + Nueva relación
          </button>
        </div>
      )}

      {/* Formulario crear/editar */}
      {showForm && (
        <div style={S.card}>
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: '0 0 20px' }}>
            {editingId ? 'Editar relación' : 'Nueva relación'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!editingId && (
              <PersonSearch
                label="Persona A *"
                value={searchPersonA}
                filtered={filteredPersonsA}
                onSearch={handleSearchA}
                onSelect={p => { setFormData({ ...formData, person_a_id: p.id }); setSearchPersonA(`${p.first_name} ${p.last_name}`); setFilteredPersonsA([]); }}
              />
            )}

            <div>
              <label style={S.label}>Tipo *</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required style={S.select}>
                <option value="">Selecciona un tipo</option>
                {Object.entries(TYPE_LABELS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {!editingId && (
              <PersonSearch
                label="Persona B *"
                value={searchPersonB}
                filtered={filteredPersonsB}
                onSearch={handleSearchB}
                onSelect={p => { setFormData({ ...formData, person_b_id: p.id }); setSearchPersonB(`${p.first_name} ${p.last_name}`); setFilteredPersonsB([]); }}
              />
            )}

            <div>
              <label style={S.label}>Notas (opcional)</label>
              <input type="text" value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas sobre la relación" style={S.input}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#374151'} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={S.btnPrimary}>{editingId ? 'Guardar cambios' : 'Crear'}</button>
              <button type="button" onClick={handleCancel} style={S.btnSecondary}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de relaciones */}
      {!showForm && (
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={S.th}>Persona A</th>
                  <th style={S.th}>Tipo</th>
                  <th style={S.th}>Persona B</th>
                  <th style={S.th}>Verificado</th>
                  <th style={S.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {relationships.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ ...S.td, textAlign: 'center', color: '#6b7280', padding: '32px' }}>
                      No hay relaciones aún
                    </td>
                  </tr>
                ) : relationships.map((rel, i) => (
                  <tr key={rel.id}
                    style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
                  >
                    <td style={{ ...S.td, color: '#e5e7eb', fontWeight: '500' }}>
                      {rel.person_a?.name ?? getPersonName(rel.person_a_id)}
                    </td>
                    <td style={S.td}>
                      <span style={{
                        background: TYPE_LABELS[rel.type]?.color || '#374151',
                        color: '#fff', fontSize: '11px', fontWeight: '600',
                        padding: '3px 10px', borderRadius: '10px', whiteSpace: 'nowrap',
                      }}>
                        {TYPE_LABELS[rel.type]?.label || rel.type}
                      </span>
                    </td>
                    <td style={{ ...S.td, color: '#e5e7eb', fontWeight: '500' }}>
                      {rel.person_b?.name ?? getPersonName(rel.person_b_id)}
                    </td>
                    <td style={S.td}>
                      <span style={{
                        color: rel.verified ? '#34d399' : '#fbbf24',
                        fontSize: '16px',
                      }}>
                        {rel.verified ? '✓' : '○'}
                      </span>
                    </td>
                    <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {rel.type === 'partner' && (
                          <button onClick={() => handleAddChild(rel)} style={{
                            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                            borderRadius: '6px', color: '#34d399', fontSize: '12px',
                            fontWeight: '600', padding: '4px 10px', cursor: 'pointer',
                          }}>+ Hijo</button>
                        )}
                        <button onClick={() => handleEdit(rel)} style={{
                          background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                          borderRadius: '6px', color: '#a78bfa', fontSize: '12px',
                          fontWeight: '600', padding: '4px 10px', cursor: 'pointer',
                        }}>Editar</button>
                        <button onClick={() => setShowDeleteConfirm(rel.id)} style={{
                          background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)',
                          borderRadius: '6px', color: '#fca5a5', fontSize: '12px',
                          fontWeight: '600', padding: '4px 10px', cursor: 'pointer',
                        }}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal añadir hijo */}
      {addChildFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: '0 0 6px' }}>Añadir hijo</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px' }}>
              Hijo de{' '}
              <span style={{ color: '#a855f7' }}>{addChildFor.parentA?.name || `${addChildFor.parentA?.first_name} ${addChildFor.parentA?.last_name}`}</span>
              {' '}y{' '}
              <span style={{ color: '#a855f7' }}>{addChildFor.parentB?.name || `${addChildFor.parentB?.first_name} ${addChildFor.parentB?.last_name}`}</span>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Nombre y apellidos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={S.label}>Nombre *</label>
                  <input type="text" value={childForm.first_name} autoFocus
                    onChange={e => setChildForm({ ...childForm, first_name: e.target.value })}
                    style={S.input} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#374151'} />
                </div>
                <div>
                  <label style={S.label}>Apellidos *</label>
                  <input type="text" value={childForm.last_name}
                    onChange={e => setChildForm({ ...childForm, last_name: e.target.value })}
                    style={S.input} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#374151'} />
                </div>
              </div>

              {/* Fecha nacimiento y familia */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={S.label}>Fecha de nacimiento</label>
                  <input type="date" value={childForm.birth_date}
                    onChange={e => setChildForm({ ...childForm, birth_date: e.target.value })}
                    style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Familia *</label>
                  <select value={childForm.family_id}
                    onChange={e => setChildForm({ ...childForm, family_id: e.target.value })}
                    style={S.select}>
                    <option value="">Selecciona...</option>
                    {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Fallecido */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={childForm.is_deceased}
                  onChange={e => setChildForm({ ...childForm, is_deceased: e.target.checked, death_date: '' })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <span style={{ color: '#9ca3af', fontSize: '13px' }}>Fallecido</span>
              </label>

              {childForm.is_deceased && (
                <div>
                  <label style={S.label}>Fecha de fallecimiento</label>
                  <input type="date" value={childForm.death_date}
                    onChange={e => setChildForm({ ...childForm, death_date: e.target.value })}
                    style={S.input} />
                </div>
              )}

              {/* Lugares */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={S.label}>Lugar de nacimiento</label>
                  <input type="text" value={childForm.birth_place} placeholder="Murcia..."
                    onChange={e => setChildForm({ ...childForm, birth_place: e.target.value })}
                    style={S.input} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#374151'} />
                </div>
                <div>
                  <label style={S.label}>Lugar actual</label>
                  <input type="text" value={childForm.current_location} placeholder="Madrid..."
                    onChange={e => setChildForm({ ...childForm, current_location: e.target.value })}
                    style={S.input} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#374151'} />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label style={S.label}>Biografía (opcional)</label>
                <textarea value={childForm.bio} maxLength={500} rows={3}
                  placeholder="Algo sobre esta persona..."
                  onChange={e => setChildForm({ ...childForm, bio: e.target.value })}
                  style={{ ...S.input, resize: 'vertical' }} />
                <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>{childForm.bio.length}/500</p>
              </div>

              {/* Redes sociales */}
              <div>
                <label style={{ ...S.label, marginBottom: '10px' }}>Redes sociales (opcional)</label>
                {[
                  { key: 'instagram', placeholder: 'https://instagram.com/...' },
                  { key: 'facebook',  placeholder: 'https://facebook.com/...' },
                  { key: 'linkedin',  placeholder: 'https://linkedin.com/in/...' },
                ].map(({ key, placeholder }) => (
                  <div key={key} style={{ marginBottom: '8px' }}>
                    <input type="url" value={childForm[key]} placeholder={placeholder}
                      onChange={e => setChildForm({ ...childForm, [key]: e.target.value })}
                      style={{ ...S.input, fontSize: '13px' }}
                      onFocus={e => e.target.style.borderColor = '#7c3aed'}
                      onBlur={e => e.target.style.borderColor = '#374151'} />
                  </div>
                ))}
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button onClick={handleSubmitChild}
                  disabled={!childForm.first_name || !childForm.last_name || !childForm.family_id}
                  style={{
                    ...S.btnPrimary,
                    opacity: (!childForm.first_name || !childForm.last_name || !childForm.family_id) ? 0.5 : 1,
                    cursor: (!childForm.first_name || !childForm.last_name || !childForm.family_id) ? 'not-allowed' : 'pointer',
                  }}>
                  Crear y vincular
                </button>
                <button onClick={() => setAddChildFor(null)} style={S.btnSecondary}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '16px', padding: '28px', maxWidth: '380px', width: '100%' }}>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: '0 0 10px' }}>Confirmar eliminación</h3>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.5' }}>
              ¿Eliminar esta relación? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleDelete(showDeleteConfirm)} style={S.btnDanger}>Eliminar</button>
              <button onClick={() => setShowDeleteConfirm(null)} style={S.btnSecondary}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          padding: '12px 20px', borderRadius: '10px', fontWeight: '600',
          fontSize: '14px', zIndex: 10000, color: '#fff',
          background: toast.type === 'error' ? '#dc2626' : '#059669',
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
```
