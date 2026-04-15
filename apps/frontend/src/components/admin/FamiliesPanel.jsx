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
