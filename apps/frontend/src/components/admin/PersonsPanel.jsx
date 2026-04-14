import { useEffect, useState } from 'react';
import { personsAPI, familiesAPI } from '../../api/client';
import PhotoUploader from './PhotoUploader';

export default function PersonsPanel({ onPendingCountChange }) {
  const [persons, setPersons] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterFamily, setFilterFamily] = useState('');
  const [filterStatus, setFilterStatus] = useState('approved');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showPhotos, setShowPhotos] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    family_id: '',
    birth_date: '',
    death_date: '',
    birth_place: '',
    current_location: '',
    bio: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    is_deceased: false,
  });

  const itemsPerPage = 20;

  useEffect(() => {
    fetchData();
  }, [onPendingCountChange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [personsResponse, familiesResponse] = await Promise.all([
        personsAPI.list(),
        familiesAPI.list(),
      ]);
      console.log('Persons response:', personsResponse);
      console.log('Families response:', familiesResponse);
      const personsData = Array.isArray(personsResponse.data) ? personsResponse.data : [];
      const familiesData = Array.isArray(familiesResponse.data) ? familiesResponse.data : [];
      setPersons(personsData);
      setFamilies(familiesData);
    } catch (err) {
      console.error('PersonsPanel fetch error:', err);
      setError(err?.message || 'Error al cargar datos');
      setPersons([]);
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  };

  const validPersons = Array.isArray(persons) ? persons : [];
  const validFamilies = Array.isArray(families) ? families : [];

  const filteredPersons = validPersons.filter((p) => {
    const matchesFamily = !filterFamily || p.family_id === filterFamily;
    const matchesStatus = !filterStatus || p.status === filterStatus;
    const matchesSearch =
      !searchTerm ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFamily && matchesStatus && matchesSearch;
  });

  const paginatedPersons = filteredPersons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredPersons.length / itemsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        family_id: formData.family_id,
        status: 'approved',
      };

      if (editingId) {
        console.log('📤 Datos enviados (update):', data);
        await personsAPI.update(editingId, data);
        showToast('Persona actualizada correctamente');
      } else {
        console.log('📤 Datos enviados (create):', data);
        await personsAPI.create(data);
        showToast('Persona creada correctamente');
      }
      setFormData({
        first_name: '',
        last_name: '',
        family_id: '',
        birth_date: '',
        death_date: '',
        birth_place: '',
        current_location: '',
        bio: '',
        instagram: '',
        facebook: '',
        linkedin: '',
        is_deceased: false,
      });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error('❌ Error desde backend:', err.response?.data || err.message);
      showToast(err.message, 'error');
    }
  };

  const handleEdit = (person) => {
    setFormData({
      first_name: person.first_name,
      last_name: person.last_name,
      family_id: person.family_id?.toString() || '',
      birth_date: person.birth_date?.split('T')[0] || '',
      death_date: person.death_date?.split('T')[0] || '',
      birth_place: person.birth_place || '',
      current_location: person.current_location || '',
      bio: person.bio || '',
      instagram: person.instagram || '',
      facebook: person.facebook || '',
      linkedin: person.linkedin || '',
      is_deceased: !!person.death_date,
    });
    setEditingId(person.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await personsAPI.delete(id);
      showToast('Persona eliminada correctamente');
      setShowDeleteConfirm(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: '',
      last_name: '',
      family_id: '',
      birth_date: '',
      death_date: '',
      birth_place: '',
      current_location: '',
      bio: '',
      instagram: '',
      facebook: '',
      linkedin: '',
      is_deceased: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getFamilyColor = (familyId) => {
    const family = validFamilies.find((f) => f.id === familyId);
    return family ? family.color_hex : '999999';
  };

  const getFamilyName = (familyId) => {
    const family = validFamilies.find((f) => f.id === familyId);
    return family?.name || 'Sin familia';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">
          <p className="text-white">⏳ Cargando personas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
        <p className="font-medium">Error al cargar personas</p>
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
          + Nueva persona
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <h3 className="text-white text-lg font-bold sticky top-0 bg-gray-800 pb-4">
            {editingId ? 'Editar persona' : 'Nueva persona'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos básicos */}
            <div>
              <h4 className="text-gray-300 font-semibold text-sm mb-4">Datos básicos</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-gray-300 text-sm font-medium block mb-1">
                  Familia *
                </label>
                <select
                  value={formData.family_id}
                  onChange={(e) => setFormData({ ...formData, family_id: e.target.value })}
                  required
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecciona una familia</option>
                  {validFamilies.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1">
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-end">
                  <label className="text-gray-300 text-sm font-medium flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_deceased}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_deceased: e.target.checked,
                          death_date: e.target.checked ? formData.death_date : '',
                        })
                      }
                      className="w-4 h-4"
                    />
                    Fallecido
                  </label>
                </div>
              </div>

              {formData.is_deceased && (
                <div className="mt-4">
                  <label className="text-gray-300 text-sm font-medium block mb-1">
                    Fecha de fallecimiento
                  </label>
                  <input
                    type="date"
                    value={formData.death_date}
                    onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1">
                    Lugar de nacimiento
                  </label>
                  <input
                    type="text"
                    value={formData.birth_place}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_place: e.target.value })
                    }
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1">
                    Lugar actual
                  </label>
                  <input
                    type="text"
                    value={formData.current_location}
                    onChange={(e) =>
                      setFormData({ ...formData, current_location: e.target.value })
                    }
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Información personal */}
            <div>
              <h4 className="text-gray-300 font-semibold text-sm mb-4">Información personal</h4>
              <label className="text-gray-300 text-sm font-medium block mb-1">Biografía</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={500}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                rows="4"
              />
              <p className="text-gray-400 text-xs mt-1">
                {formData.bio.length}/500 caracteres
              </p>
            </div>

            {/* Redes sociales */}
            <div>
              <h4 className="text-gray-300 font-semibold text-sm mb-4">Redes sociales</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="https://instagram.com/username"
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="https://facebook.com/username"
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 sticky bottom-0 bg-gray-800 pt-4">
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

      {/* Filters */}
      {!showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">Familia</label>
              <select
                value={filterFamily}
                onChange={(e) => {
                  setFilterFamily(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full"
              >
                <option value="">Todas</option>
                {validFamilies.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full"
              >
                <option value="">Todos</option>
                <option value="approved">Aprobados</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Nombre o apellido"
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!showForm && (
        <>
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 text-gray-300 text-xs uppercase font-medium">
                  <th className="px-6 py-3 text-left">Avatar</th>
                  <th className="px-6 py-3 text-left">Nombre completo</th>
                  <th className="px-6 py-3 text-left">Familia</th>
                  <th className="px-6 py-3 text-left">Fecha nac.</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                  <th className="px-6 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {paginatedPersons.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                      No hay personas
                    </td>
                  </tr>
                ) : (
                  paginatedPersons.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        {person.avatar_url ? (
                          <img
                            src={person.avatar_url}
                            alt="avatar"
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                            👤
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {person.first_name} {person.last_name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-3 py-1 rounded-full text-white text-xs font-medium"
                          style={{ backgroundColor: `#${getFamilyColor(person.family_id)}` }}
                        >
                          {getFamilyName(person.family_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {person.birth_date ? new Date(person.birth_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                            person.status === 'approved'
                              ? 'bg-green-900 text-green-400'
                              : 'bg-yellow-900 text-yellow-400'
                          }`}
                        >
                          {person.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => setShowPhotos(person)}
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          📸 Fotos
                        </button>
                        <button
                          onClick={() => handleEdit(person)}
                          className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(person.id)}
                          className="text-red-400 hover:text-red-300 font-medium transition-colors"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex gap-2 items-center justify-center">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-gray-400">
                Página {currentPage} de {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm">
            <h3 className="text-white font-bold text-lg mb-4">Confirmar eliminación</h3>
            <p className="text-gray-300 mb-6">
              ¿Eliminar a esta persona? Esta acción no se puede deshacer.
            </p>
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

      {/* Photo Uploader Modal */}
      {showPhotos && (
        <PhotoUploader
          person={showPhotos}
          onClose={() => setShowPhotos(null)}
          onSuccess={(avatarUrl) => {
            setPersons(prev =>
              prev.map(p =>
                p.id === showPhotos.id
                  ? { ...p, avatar_url: avatarUrl }
                  : p
              )
            );
          }}
        />
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
