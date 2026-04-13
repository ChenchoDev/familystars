import { useEffect, useState } from 'react';
import { familiesAPI, personsAPI } from '../../api/client';

const FAMILY_COLORS = {
  Paterna: '9B59B6',
  Materna: '3498DB',
  'Política 1': 'F39C12',
  'Política 2': '27AE60',
};

export default function FamiliesPanel({ onPendingCountChange }) {
  const [families, setFamilies] = useState([]);
  const [personsCounts, setPersonsCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color_hex: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchFamilies();
  }, [onPendingCountChange]);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      setError(null);
      const familiesResponse = await familiesAPI.list();
      console.log('Families response:', familiesResponse);
      const familiesData = Array.isArray(familiesResponse.data) ? familiesResponse.data : [];
      setFamilies(familiesData);

      // Get persons count by family
      try {
        const personsResponse = await personsAPI.list();
        const counts = {};
        if (Array.isArray(personsResponse.data)) {
          personsResponse.data.forEach((p) => {
            if (p.family_id) {
              counts[p.family_id] = (counts[p.family_id] || 0) + 1;
            }
          });
        }
        setPersonsCounts(counts);
      } catch (personErr) {
        console.error('Error fetching persons:', personErr);
        // Continue without person counts
      }
    } catch (err) {
      console.error('Families fetch error:', err);
      setError(err?.message || 'Error al cargar familias');
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await familiesAPI.update(editingId, formData);
        showToast('Familia actualizada correctamente');
      } else {
        await familiesAPI.create(formData);
        showToast('Familia creada correctamente');
      }
      setFormData({ name: '', description: '', color_hex: '' });
      setEditingId(null);
      setShowForm(false);
      fetchFamilies();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEdit = (family) => {
    setFormData({
      name: family.name,
      description: family.description || '',
      color_hex: family.color_hex,
    });
    setEditingId(family.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', color_hex: '' });
    setEditingId(null);
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
          <p className="text-white">⏳ Cargando familias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
        <p className="font-medium">Error al cargar familias</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const validFamilies = Array.isArray(families) ? families : [];

  return (
    <div className="space-y-6">
      {/* Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Nueva familia
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
          <h3 className="text-white text-lg font-bold">
            {editingId ? 'Editar familia' : 'Nueva familia'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="3"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">Color</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={`#${formData.color_hex}`}
                  onChange={(e) =>
                    setFormData({ ...formData, color_hex: e.target.value.substring(1) })
                  }
                  required
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <div
                  className="w-10 h-10 rounded-full border-2 border-gray-600"
                  style={{ backgroundColor: `#${formData.color_hex}` }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {editingId ? 'Guardar cambios' : 'Crear'}
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
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700 text-gray-300 text-xs uppercase font-medium">
              <th className="px-6 py-3 text-left">Color</th>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Descripción</th>
              <th className="px-6 py-3 text-left">Nº personas</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {validFamilies.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                  No hay familias aún
                </td>
              </tr>
            ) : (
              validFamilies.map((family) => (
                <tr key={family.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-600"
                      style={{ backgroundColor: `#${family.color_hex}` }}
                    />
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{family.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {family.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-white">{family.person_count || 0}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(family)}
                      className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
