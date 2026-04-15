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
        // Convertir strings vacíos a null para las fechas
        birth_date: formData.birth_date || null,
        death_date: formData.death_date || null,
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

  const [buttonPrimaryHover, setButtonPrimaryHover] = useState(false);
  const [buttonSecondaryHover, setButtonSecondaryHover] = useState(false);
  const [tableRowHover, setTableRowHover] = useState(null);
  const [paginationPrevHover, setPaginationPrevHover] = useState(false);
  const [paginationNextHover, setPaginationNextHover] = useState(false);
  const [deleteButtonHover, setDeleteButtonHover] = useState(false);
  const [cancelButtonHover, setCancelButtonHover] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '384px' }}>
        <div style={{ animation: 'spin 1s linear infinite' }}>
          <p style={{ color: '#ffffff' }}>⏳ Cargando personas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '10px', padding: '16px', color: '#fca5a5' }}>
        <p style={{ fontWeight: '500' }}>Error al cargar personas</p>
        <p style={{ fontSize: '14px', marginTop: '4px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          onMouseEnter={() => setButtonPrimaryHover(true)}
          onMouseLeave={() => setButtonPrimaryHover(false)}
          style={{
            background: buttonPrimaryHover
              ? 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)'
              : 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '8px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          + Nueva persona
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '80vh', overflowY: 'auto' }}>
          <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', position: 'sticky', top: 0, background: '#1f2937', paddingBottom: '16px', zIndex: 10 }}>
            {editingId ? 'Editar persona' : 'Nueva persona'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Datos básicos */}
            <div>
              <h4 style={{ color: '#d1d5db', fontWeight: '600', fontSize: '14px', marginBottom: '16px' }}>Datos básicos</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                    onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px rgba(168,85,247,0.3)')}
                    onBlur={(e) => (e.target.style.boxShadow = 'none')}
                  />
                </div>
                <div>
                  <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                    onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px rgba(168,85,247,0.3)')}
                    onBlur={(e) => (e.target.style.boxShadow = 'none')}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  Familia *
                </label>
                <select
                  value={formData.family_id}
                  onChange={(e) => setFormData({ ...formData, family_id: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px rgba(168,85,247,0.3)')}
                  onBlur={(e) => (e.target.style.boxShadow = 'none')}
                >
                  <option value="">Selecciona una familia</option>
                  {validFamilies.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                    onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px rgba(168,85,247,0.3)')}
                    onBlur={(e) => (e.target.style.boxShadow = 'none')}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
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
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    Fallecido
                  </label>
                </div>
              </div>

              {formData.is_deceased && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Fecha de fallecimiento
                  </label>
                  <input
                    type="date"
                    value={formData.death_date}
                    onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                    onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px rgba(168,85,247,0.3)')}
                    onBlur={(e) => (e.target.style.boxShadow = 'none')}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Lugar de nacimiento
                  </label>
                  <input
                    type="text"
                    value={formData.birth_place}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_place: e.target.value })
                    }
                    style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                    onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px rgba(168,85,247,0.3)')}
                    onBlur={(e) => (e.target.style.boxShadow = 'none')}
                  />
                </div>
                <div>
                  <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Lugar actual
                  </label>
                  <input
                    type="text"
                    value={formData.current_location}
                    onChange={(e) =>
                      setFormData({ ...formData, current_location: e.target.value })
                    }
                    style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                    onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px rgba(168,85,247,0.3)')}
                    onBlur={(e) => (e.target.style.boxShadow = 'none')}
                  />
                </div>
              </div>
            </div>

            {/* Información personal */}
            <div>
              <h4 style={{ color: '#d1d5db', fontWeight: '600', fontSize: '14px', marginBottom: '16px' }}>Información personal</h4>
              <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Biografía</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={500}
                style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'none' }}
                onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px rgba(168,85,247,0.3)')}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
                rows="4"
              />
              <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                {formData.bio.length}/500 caracteres
              </p>
            </div>

            {/* Redes sociales */}
            <div>
              <h4 style={{ color: '#d1d5db', fontWeight: '600', fontSize: '14px', marginBottom: '16px' }}>Redes sociales</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="https://instagram.com/username"
                    style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                    onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px rgba(168,85,247,0.3)')}
                    onBlur={(e) => (e.target.style.boxShadow = 'none')}
                  />
                </div>
                <div>
                  <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="https://facebook.com/username"
                    style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                    onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px rgba(168,85,247,0.3)')}
                    onBlur={(e) => (e.target.style.boxShadow = 'none')}
                  />
                </div>
                <div>
                  <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                    onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px rgba(168,85,247,0.3)')}
                    onBlur={(e) => (e.target.style.boxShadow = 'none')}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', position: 'sticky', bottom: 0, background: '#1f2937', paddingTop: '16px', zIndex: 10 }}>
              <button
                type="submit"
                onMouseEnter={() => setButtonPrimaryHover(true)}
                onMouseLeave={() => setButtonPrimaryHover(false)}
                style={{
                  background: buttonPrimaryHover
                    ? 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)'
                    : 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {editingId ? 'Guardar cambios' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                onMouseEnter={() => setCancelButtonHover(true)}
                onMouseLeave={() => setCancelButtonHover(false)}
                style={{
                  background: cancelButtonHover ? '#374151' : '#111827',
                  color: '#e5e7eb',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  border: '1px solid #374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      {!showForm && (
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>Familia</label>
              <select
                value={filterFamily}
                onChange={(e) => {
                  setFilterFamily(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
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
              <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              >
                <option value="">Todos</option>
                <option value="approved">Aprobados</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Nombre o apellido"
                style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px solid #374151', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!showForm && (
        <>
          <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#111827', borderBottom: '1px solid #374151' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avatar</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre completo</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Familia</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha nac.</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPersons.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '12px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '14px', borderBottom: '1px solid #1f2937' }}>
                      No hay personas
                    </td>
                  </tr>
                ) : (
                  paginatedPersons.map((person) => (
                    <tr
                      key={person.id}
                      onMouseEnter={() => setTableRowHover(person.id)}
                      onMouseLeave={() => setTableRowHover(null)}
                      style={{
                        background: tableRowHover === person.id ? '#111827' : 'transparent',
                        transition: 'background-color 0.2s ease',
                        borderBottom: '1px solid #1f2937'
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
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
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>
                        {person.first_name} {person.last_name}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        <span
                          style={{
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: `#${getFamilyColor(person.family_id)}`
                          }}
                        >
                          {getFamilyName(person.family_id)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#9ca3af' }}>
                        {person.birth_date ? new Date(person.birth_date).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        <span
                          style={{
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            color: person.status === 'approved' ? '#86efac' : '#fcd34d',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: person.status === 'approved' ? '#15803d' : '#78350f'
                          }}
                        >
                          {person.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setShowPhotos(person)}
                          style={{ color: '#60a5fa', cursor: 'pointer', fontWeight: '500', background: 'none', border: 'none', transition: 'color 0.2s ease' }}
                          onMouseEnter={(e) => (e.target.style.color = '#93c5fd')}
                          onMouseLeave={(e) => (e.target.style.color = '#60a5fa')}
                        >
                          📸 Fotos
                        </button>
                        <button
                          onClick={() => handleEdit(person)}
                          style={{ color: '#c084fc', cursor: 'pointer', fontWeight: '500', background: 'none', border: 'none', transition: 'color 0.2s ease' }}
                          onMouseEnter={(e) => (e.target.style.color = '#d8b4fe')}
                          onMouseLeave={(e) => (e.target.style.color = '#c084fc')}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(person.id)}
                          style={{ color: '#f87171', cursor: 'pointer', fontWeight: '500', background: 'none', border: 'none', transition: 'color 0.2s ease' }}
                          onMouseEnter={(e) => (e.target.style.color = '#fca5a5')}
                          onMouseLeave={(e) => (e.target.style.color = '#f87171')}
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                onMouseEnter={() => setPaginationPrevHover(true)}
                onMouseLeave={() => setPaginationPrevHover(false)}
                style={{
                  padding: '8px 12px',
                  background: currentPage === 1 ? '#374151' : (paginationPrevHover ? '#4b5563' : '#111827'),
                  color: '#d1d5db',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? '0.5' : '1',
                  transition: 'all 0.2s ease'
                }}
              >
                Anterior
              </button>
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                onMouseEnter={() => setPaginationNextHover(true)}
                onMouseLeave={() => setPaginationNextHover(false)}
                style={{
                  padding: '8px 12px',
                  background: currentPage === totalPages ? '#374151' : (paginationNextHover ? '#4b5563' : '#111827'),
                  color: '#d1d5db',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? '0.5' : '1',
                  transition: 'all 0.2s ease'
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '24px', maxWidth: '400px' }}>
            <h3 style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px', marginBottom: '16px' }}>Confirmar eliminación</h3>
            <p style={{ color: '#d1d5db', marginBottom: '24px' }}>
              ¿Eliminar a esta persona? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                onMouseEnter={() => setDeleteButtonHover(true)}
                onMouseLeave={() => setDeleteButtonHover(false)}
                style={{
                  background: deleteButtonHover ? '#b91c1c' : '#991b1b',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Eliminar
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                onMouseEnter={() => setCancelButtonHover(true)}
                onMouseLeave={() => setCancelButtonHover(false)}
                style={{
                  background: cancelButtonHover ? '#374151' : '#111827',
                  color: '#e5e7eb',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  border: '1px solid #374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
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
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            padding: '12px 16px',
            borderRadius: '8px',
            fontWeight: '500',
            color: '#ffffff',
            background: toast.type === 'error' ? '#dc2626' : '#16a34a',
            zIndex: 10000
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
