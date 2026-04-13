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
        const statsResponse = await adminAPI.getStats();
        const statsData = statsResponse.data || statsResponse;
        setStats(statsData);
        onPendingCountChange(statsData.pending_count || 0);

        // Get recent persons
        try {
          const personsResponse = await personsAPI.list();
          const personsData = Array.isArray(personsResponse.data) ? personsResponse.data : [];
          const approved = personsData.filter((p) => p.status === 'approved');
          setRecentPersons(approved.slice(0, 5));
        } catch (personErr) {
          console.error('Error fetching persons:', personErr);
          setRecentPersons([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [onPendingCountChange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin text-gray-400">
          <p className="text-white">⏳ Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
        <p className="font-medium">Error al cargar estadísticas</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const validRecentPersons = Array.isArray(recentPersons) ? recentPersons : [];

  const StatCard = ({ label, value, icon }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-white text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total de personas" value={stats.total_persons} icon="👥" />
        <StatCard label="Total de familias" value={stats.total_families} icon="⭐" />
        <StatCard
          label="Pendientes de aprobación"
          value={stats.pending_count}
          icon="⏳"
        />
        <StatCard label="Total de relaciones" value={stats.total_relationships} icon="🔗" />
      </div>

      {/* Recent Persons */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-white text-lg font-bold mb-4">Últimas personas añadidas</h3>
        {validRecentPersons.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay personas aún</p>
        ) : (
          <div className="space-y-3">
            {validRecentPersons.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                {person.avatar_url ? (
                  <img
                    src={person.avatar_url}
                    alt={`${person.first_name} ${person.last_name}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-400">👤</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {person.first_name} {person.last_name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {person.birth_date && new Date(person.birth_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
