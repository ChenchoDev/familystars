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
