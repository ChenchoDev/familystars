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
