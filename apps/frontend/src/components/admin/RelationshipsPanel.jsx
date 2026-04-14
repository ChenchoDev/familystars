import { useEffect, useState } from 'react';
import { relationshipsAPI, personsAPI, familiesAPI } from '../../api/client';

const TYPE_LABELS = {
  parent: { label: 'Padre/Madre de', color: 'bg-blue-800' },
  child: { label: 'Hijo/a de', color: 'bg-green-800' },
  partner: { label: 'Pareja de', color: 'bg-pink-800' },
  sibling: { label: 'Hermano/a de', color: 'bg-yellow-800' },
  cousin: { label: 'Primo/a de', color: 'bg-orange-800' },
  other: { label: 'Otro', color: 'bg-gray-700' },
};

export default function RelationshipsPanel({ onPendingCountChange }) {
  const [relationships, setRelationships] = useState([]);
  const [persons, setPersons] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchPersonA, setSearchPersonA] = useState('');
  const [searchPersonB, setSearchPersonB] = useState('');
  const [filteredPersonsA, setFilteredPersonsA] = useState([]);
  const [filteredPersonsB, setFilteredPersonsB] = useState([]);
  const [formData, setFormData] = useState({
    person_a_id: '',
    type: '',
    person_b_id: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [onPendingCountChange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [relResponse, personsResponse, familiesResponse] = await Promise.all([
        relationshipsAPI.list(),
        personsAPI.list(),
        familiesAPI.list(),
      ]);
      console.log('Relationships response:', relResponse);
      const relData = Array.isArray(relResponse.data) ? relResponse.data : [];
      const personsData = Array.isArray(personsResponse.data) ? personsResponse.data : [];
      const familiesData = Array.isArray(familiesResponse.data) ? familiesResponse.data : [];
      setRelationships(relData);
      setPersons(personsData.filter((p) => p.status === 'approved'));
      setFamilies(familiesData);
    } catch (err) {
      console.error('RelationshipsPanel fetch error:', err);
      setError(err?.message || 'Error al cargar datos');
      setRelationships([]);
      setPersons([]);
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  };

  const validPersons = Array.isArray(persons) ? persons : [];

  const handleSearchA = (term) => {
    setSearchPersonA(term);
    if (term.trim()) {
      setFilteredPersonsA(
        validPersons.filter(
          (p) =>
            `${p.first_name} ${p.last_name}`.toLowerCase().includes(term.toLowerCase()) &&
            p.id !== formData.person_b_id
        )
      );
    } else {
      setFilteredPersonsA([]);
    }
  };

  const handleSearchB = (term) => {
    setSearchPersonB(term);
    if (term.trim()) {
      setFilteredPersonsB(
        validPersons.filter(
          (p) =>
            `${p.first_name} ${p.last_name}`.toLowerCase().includes(term.toLowerCase()) &&
            p.id !== formData.person_a_id
        )
      );
    } else {
      setFilteredPersonsB([]);
    }
  };

  const getPersonName = (id) => {
    const person = persons.find((p) => p.id === id);
    return person ? `${person.first_name} ${person.last_name}` : 'Unknown';
  };

  const getPersonFamily = (id) => {
    const person = persons.find((p) => p.id === id);
    if (!person) return null;
    return families.find((f) => f.id === person.family_id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if relationship already exists
      const exists = relationships.some(
        (r) =>
          (r.person_a_id === formData.person_a_id &&
            r.person_b_id === formData.person_b_id) ||
          (r.person_a_id === formData.person_b_id &&
            r.person_b_id === formData.person_a_id)
      );

      if (exists) {
        showToast('Ya existe una relación entre estas dos personas', 'error');
        return;
      }

      await relationshipsAPI.create({
        person_a_id: formData.person_a_id,
        type: formData.type,
        person_b_id: formData.person_b_id,
        notes: formData.notes || null,
        verified: true,
      });

      showToast('Relación creada correctamente');
      setFormData({ person_a_id: '', type: '', person_b_id: '', notes: '' });
      setSearchPersonA('');
      setSearchPersonB('');
      setShowForm(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await relationshipsAPI.delete(id);
      showToast('Relación eliminada correctamente');
      setShowDeleteConfirm(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCancel = () => {
    setFormData({ person_a_id: '', type: '', person_b_id: '', notes: '' });
    setSearchPersonA('');
    setSearchPersonB('');
    setFilteredPersonsA([]);
    setFilteredPersonsB([]);
    setShowForm(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">
          <p className="text-white">⏳ Cargando relaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
        <p className="font-medium">Error al cargar relaciones</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Nueva relación
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
          <h3 className="text-white text-lg font-bold">Nueva relación</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Person A */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">
                Persona A *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchPersonA}
                  onChange={(e) => handleSearchA(e.target.value)}
                  placeholder="Busca una persona..."
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                />
                {filteredPersonsA.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
                    {filteredPersonsA.map((person) => {
                      const family = families.find((f) => f.id === person.family_id);
                      return (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, person_a_id: person.id });
                            setSearchPersonA(`${person.first_name} ${person.last_name}`);
                            setFilteredPersonsA([]);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white flex items-center justify-between"
                        >
                          <span>
                            {person.first_name} {person.last_name}
                          </span>
                          {family && (
                            <span
                              className="px-2 py-1 rounded text-white text-xs font-medium"
                              style={{ backgroundColor: `#${family.color_hex}` }}
                            >
                              {family.name}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {formData.person_a_id && (
                <p className="text-gray-400 text-xs mt-2">
                  ✓ {getPersonName(formData.person_a_id)}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">Tipo *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecciona un tipo</option>
                {Object.entries(TYPE_LABELS).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Person B */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">
                Persona B *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchPersonB}
                  onChange={(e) => handleSearchB(e.target.value)}
                  placeholder="Busca una persona..."
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                />
                {filteredPersonsB.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
                    {filteredPersonsB.map((person) => {
                      const family = families.find((f) => f.id === person.family_id);
                      return (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, person_b_id: person.id });
                            setSearchPersonB(`${person.first_name} ${person.last_name}`);
                            setFilteredPersonsB([]);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white flex items-center justify-between"
                        >
                          <span>
                            {person.first_name} {person.last_name}
                          </span>
                          {family && (
                            <span
                              className="px-2 py-1 rounded text-white text-xs font-medium"
                              style={{ backgroundColor: `#${family.color_hex}` }}
                            >
                              {family.name}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {formData.person_b_id && (
                <p className="text-gray-400 text-xs mt-2">
                  ✓ {getPersonName(formData.person_b_id)}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">Notas</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas opcionales sobre la relación"
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {!showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700 text-gray-300 text-xs uppercase font-medium">
                <th className="px-6 py-3 text-left">Persona A</th>
                <th className="px-6 py-3 text-left">Tipo</th>
                <th className="px-6 py-3 text-left">Persona B</th>
                <th className="px-6 py-3 text-left">Verificado</th>
                <th className="px-6 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {relationships.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                    No hay relaciones aún
                  </td>
                </tr>
              ) : (
                relationships.map((rel) => (
                  <tr key={rel.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">
                      {rel.person_a
                        ? `${rel.person_a.first_name} ${rel.person_a.last_name}`
                        : getPersonName(rel.person_a_id)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-white text-xs font-medium ${
                          TYPE_LABELS[rel.type]?.color
                        }`}
                      >
                        {TYPE_LABELS[rel.type]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      {rel.person_b
                        ? `${rel.person_b.first_name} ${rel.person_b.last_name}`
                        : getPersonName(rel.person_b_id)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-white text-xs font-medium ${
                          rel.verified ? 'bg-green-900' : 'bg-yellow-900'
                        }`}
                      >
                        {rel.verified ? '✓' : '○'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setShowDeleteConfirm(rel.id)}
                        className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm">
            <h3 className="text-white font-bold text-lg mb-4">Confirmar eliminación</h3>
            <p className="text-gray-300 mb-6">¿Eliminar esta relación? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Eliminar
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg font-medium"
              >
                Cancelar
              </button>
            </div>
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
