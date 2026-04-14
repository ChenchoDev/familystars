import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsPanel from './StatsPanel';
import FamiliesPanel from './FamiliesPanel';
import PersonsPanel from './PersonsPanel';
import RelationshipsPanel from './RelationshipsPanel';
import PendingPanel from './PendingPanel';

const PANELS = {
  stats:         { name: 'Resumen',    icon: '📊', component: StatsPanel },
  families:      { name: 'Familias',   icon: '⭐', component: FamiliesPanel },
  persons:       { name: 'Personas',   icon: '👤', component: PersonsPanel },
  relationships: { name: 'Relaciones', icon: '🔗', component: RelationshipsPanel },
  pending:       { name: 'Pendientes', icon: '⏳', component: PendingPanel },
};

export default function AdminLayout({ user }) {
  const [activePanel, setActivePanel] = useState('stats');
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();
  const Panel = PANELS[activePanel].component;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#111827', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: '220px',
        flexShrink: 0,
        background: '#1f2937',
        borderRight: '1px solid #374151',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #374151',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0,
            }}>
              🌟
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: '700', fontSize: '15px', lineHeight: 1 }}>
                FamilyStars
              </div>
              <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '3px' }}>
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {Object.entries(PANELS).map(([key, panel]) => {
            const isActive = activePanel === key;
            return (
              <button
                key={key}
                onClick={() => setActivePanel(key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(124,58,237,0.25)' : 'transparent',
                  color: isActive ? '#a855f7' : '#9ca3af',
                  fontWeight: isActive ? '600' : '400',
                  fontSize: '14px',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  outline: isActive ? '1px solid rgba(168,85,247,0.3)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{panel.icon}</span>
                <span style={{ flex: 1 }}>{panel.name}</span>
                {key === 'pending' && pendingCount > 0 && (
                  <span style={{
                    background: '#dc2626',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    flexShrink: 0,
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #374151',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div>
            <div style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: '600' }}>
              {user?.name || 'Admin'}
            </div>
            <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px', wordBreak: 'break-all' }}>
              {user?.email}
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/'); }}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#9ca3af',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            ← Volver a la app
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{
          padding: '18px 32px',
          borderBottom: '1px solid #374151',
          background: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>{PANELS[activePanel].icon}</span>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 }}>
              {PANELS[activePanel].name}
            </h2>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            background: '#111827',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid #374151',
          }}>
            FamilyStars Admin
          </div>
        </div>

        {/* Panel content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <Panel onPendingCountChange={setPendingCount} />
        </div>
      </div>
    </div>
  );
}
