import { useEffect, useState } from 'react';
import { adminAPI, personsAPI, relationshipsAPI, familiesAPI } from '../../api/client';

export default function PendingPanel({ onPendingCountChange }) {
  const [pending, setPending] = useState(null);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchPending();
  }, [onPendingCountChange]);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const [pendingResponse, familiesResponse] = await Promise.all([
        adminAPI.getPending(),
        familiesAPI.list(),
      ]);
      const pendingData = pendingResponse.data || pendingResponse;
      setPending(pendingData);
      setFamilies(Array.isArray(familiesResponse.data) ? familiesResponse.data : []);

      // Update parent pending count
      const totalPending =
        (Array.isArray(pendingData?.pending_persons) ? pendingData.pending_persons.length : 0) +
        (Array.isArray(pendingData?.pending_relationships) ? pendingData.pending_relationships.length : 0);
      onPendingCountChange(totalPending);
    } catch (err) {
      setError(err.message);
      setPending(null);
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePerson = async (id) => {
    try {
      await personsAPI.approve(id);
      showToast('Persona aprobada correctamente');
      fetchPending();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRejectPerson = async (id) => {
    try {
      await personsAPI.delete(id);
      showToast('Persona rechazada');
      fetchPending();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleApproveRelationship = async (id) => {
    try {
      await relationshipsAPI.approve(id);
      showToast('Relación aprobada correctamente');
      fetchPending();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRejectRelationship = async (id) => {
    try {
      await relationshipsAPI.delete(id);
      showToast('Relación rechazada');
      fetchPending();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validFamilies = Array.isArray(families) ? families : [];

  const getFamilyName = (familyId) => {
    const family = validFamilies.find((f) => f.id === familyId);
    return family?.name || 'Sin familia';
  };

  const getFamilyColor = (familyId) => {
    const family = validFamilies.find((f) => f.id === familyId);
    return family?.color_hex || '999999';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">
          <p className="text-white">⏳ Cargando pendientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
        <p className="font-medium">Error al cargar pendientes</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const hasPending =
    (pending?.pending_persons?.length > 0) || (pending?.pending_relationships?.length > 0);

  if (!hasPending) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-4xl mb-4">✨</p>
        <p className="text-xl text-gray-300 font-semibold">Todo al día</p>
        <p className="text-gray-400 mt-2">No hay sugerencias pendientes de aprobación</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Persons */}
      {pending?.pending_persons && pending.pending_persons.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            👤 Personas pendientes ({pending.pending_persons.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.pending_persons.map((person) => (
              <div
                key={person.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">
                      {person.first_name} {person.last_name}
                    </h3>
                    {person.family_id && (
                      <span
                        className="inline-block mt-2 px-3 py-1 rounded text-white text-xs font-medium"
                        style={{ backgroundColor: `#${getFamilyColor(person.family_id)}` }}
                      >
                        {getFamilyName(person.family_id)}
                      </span>
                    )}
                  </div>
                  <div className="text-3xl">👤</div>
                </div>

                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  {person.birth_date && (
                    <p>
                      <span className="text-gray-500">Nacimiento:</span>{' '}
                      {new Date(person.birth_date).toLocaleDateString()}
                    </p>
                  )}
                  {person.birth_place && (
                    <p>
                      <span className="text-gray-500">Lugar:</span> {person.birth_place}
                    </p>
                  )}
                  {person.created_at && (
                    <p>
                      <span className="text-gray-500">Sugerido:</span>{' '}
                      {new Date(person.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprovePerson(person.id)}
                    className="flex-1 bg-green-800 hover:bg-green-700 text-green-100 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    ✅ Aprobar
                  </button>
                  <button
                    onClick={() => handleRejectPerson(person.id)}
                    className="flex-1 bg-red-800 hover:bg-red-700 text-red-100 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    ❌ Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Relationships */}
      {pending?.pending_relationships && pending.pending_relationships.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            🔗 Relaciones pendientes ({pending.pending_relationships.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.pending_relationships.map((rel) => {
              const personA = pending.pending_persons?.find((p) => p.id === rel.person_a_id) ||
                pending.related_persons?.find((p) => p.id === rel.person_a_id) || {
                  first_name: '?',
                  last_name: '?',
                };
              const personB = pending.pending_persons?.find((p) => p.id === rel.person_b_id) ||
                pending.related_persons?.find((p) => p.id === rel.person_b_id) || {
                  first_name: '?',
                  last_name: '?',
                };

              const TYPE_LABELS = {
                parent: 'Padre/Madre de',
                child: 'Hijo/a de',
                partner: 'Pareja de',
                sibling: 'Hermano/a de',
                cousin: 'Primo/a de',
                other: 'Otro',
              };

              return (
                <div
                  key={rel.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-white">
                        <p className="font-medium">
                          {personA.first_name} {personA.last_name}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          {TYPE_LABELS[rel.type] || rel.type}
                        </p>
                        <p className="font-medium mt-2">
                          {personB.first_name} {personB.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-3xl">🔗</div>
                  </div>

                  {rel.notes && (
                    <p className="text-sm text-gray-400 mb-4 italic">Notas: {rel.notes}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRelationship(rel.id)}
                      className="flex-1 bg-green-800 hover:bg-green-700 text-green-100 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      onClick={() => handleRejectRelationship(rel.id)}
                      className="flex-1 bg-red-800 hover:bg-red-700 text-red-100 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      ❌ Rechazar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg font-medium text-white ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
