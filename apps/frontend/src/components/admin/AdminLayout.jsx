import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsPanel from './StatsPanel';
import FamiliesPanel from './FamiliesPanel';
import PersonsPanel from './PersonsPanel';
import RelationshipsPanel from './RelationshipsPanel';
import PendingPanel from './PendingPanel';

const PANELS = {
  stats: { name: 'Resumen', icon: '📊', component: StatsPanel },
  families: { name: 'Familias', icon: '⭐', component: FamiliesPanel },
  persons: { name: 'Personas', icon: '👤', component: PersonsPanel },
  relationships: { name: 'Relaciones', icon: '🔗', component: RelationshipsPanel },
  pending: { name: 'Pendientes', icon: '⏳', component: PendingPanel },
};

export default function AdminLayout({ user }) {
  const [activePanel, setActivePanel] = useState('stats');
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  const Panel = PANELS[activePanel].component;

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">🌟 FamilyStars</h1>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {Object.entries(PANELS).map(([key, panel]) => (
            <button
              key={key}
              onClick={() => setActivePanel(key)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                activePanel === key
                  ? 'bg-purple-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-lg">{panel.icon}</span>
              <span className="flex-1">{panel.name}</span>
              {key === 'pending' && pendingCount > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <div className="text-sm text-gray-400">
            <p className="font-medium text-gray-300">{user?.name || 'Admin'}</p>
            <p className="text-xs">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/');
            }}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Volver a la app
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="bg-gray-900 border-b border-gray-800 px-8 py-4">
          <h2 className="text-2xl font-bold text-white">
            {PANELS[activePanel].icon} {PANELS[activePanel].name}
          </h2>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-auto p-8">
          <Panel onPendingCountChange={setPendingCount} />
        </div>
      </div>
    </div>
  );
}
