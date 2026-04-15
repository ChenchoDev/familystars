import { useState, useEffect } from 'react';
import { photosAPI } from '../../api/client';

export default function ProfilePanel({ person, families, relationships, persons, onClose }) {
  if (!person) return null;

  const [activeTab, setActiveTab] = useState('info');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [photos, setPhotos] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const family = families.find((f) => f.id === person.family_id);

  // Detect window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load photos
  useEffect(() => {
    if (!person?.id) return;
    photosAPI.list(person.id)
      .then(res => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setPhotos(data);
      })
      .catch(() => setPhotos([]));
  }, [person?.id]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const age = calculateAge(person.birth_date);
  const birthYear = person.birth_date ? new Date(person.birth_date).getFullYear() : null;

  const getRelationLabel = (rel, currentPersonId) => {
    const aId = rel.person_a?.id || rel.person_a_id;
    const isA = aId === currentPersonId;

    switch(rel.type) {
      case 'parent':
        return isA ? '👨‍👩 Padre/Madre de' : '👶 Hijo/a de';
      case 'child':
        return isA ? '👶 Hijo/a de' : '👨‍👩 Padre/Madre de';
      case 'partner':
        return '💑 Pareja';
      case 'sibling':
        return '👯 Hermano/a';
      case 'cousin':
        return '👥 Primo/a';
      default:
        return rel.type;
    }
  };

  const relatedPersons = relationships
    .filter((rel) => {
      const aId = rel.person_a?.id || rel.person_a_id;
      const bId = rel.person_b?.id || rel.person_b_id;
      return aId === person.id || bId === person.id;
    })
    .map((rel) => {
      const aId = rel.person_a?.id || rel.person_a_id;
      const bId = rel.person_b?.id || rel.person_b_id;
      const relatedId = aId === person.id ? bId : aId;
      return {
        person: persons.find((p) => p.id === relatedId),
        relationship: rel,
      };
    })
    .filter((rel) => rel.person);

  // Responsive styles
  const panelStyle = isMobile
    ? {
        // Mobile: modal from bottom
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxHeight: '90vh',
        backgroundColor: '#111827',
        borderTop: '1px solid #374151',
        zIndex: 50,
        overflowY: 'auto',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
      }
    : {
        // Desktop: panel on right
        position: 'fixed',
        right: 0,
        top: 0,
        width: '400px',
        height: '100vh',
        backgroundColor: '#111827',
        borderLeft: '1px solid #374151',
        zIndex: 50,
        overflowY: 'auto',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
      };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #374151',
        position: 'sticky',
        top: 0,
        backgroundColor: '#1f2937',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <div
              onClick={() => {
                if (person.avatar_url) {
                  const avatarPhoto = photos.find(p => p.cloudinary_url === person.avatar_url);
                  setLightbox(avatarPhoto || { cloudinary_url: person.avatar_url, caption: '', year: null });
                }
              }}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: `#${family?.color_hex || '9B59B6'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '12px',
                overflow: 'hidden',
                flexShrink: 0,
                cursor: person.avatar_url ? 'pointer' : 'default',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { if (person.avatar_url) e.currentTarget.style.opacity = '0.8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {person.avatar_url
                ? <img src={person.avatar_url} alt={person.first_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <>{person.first_name?.[0]}{person.last_name?.[0]}</>
              }
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
              {person.first_name} {person.last_name}
            </h2>
            {birthYear && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0' }}>b. {birthYear}</p>}
            <p style={{ fontSize: '12px', margin: '4px 0', color: `#${family?.color_hex || '9B59B6'}`, fontWeight: '600' }}>
              {family?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #374151',
        backgroundColor: '#1f2937',
        position: 'sticky',
        top: '100px',
      }}>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '12px',
            fontWeight: '600',
            border: 'none',
            borderBottom: activeTab === 'info' ? '2px solid #a855f7' : 'none',
            backgroundColor: activeTab === 'info' ? '#111827' : 'transparent',
            color: activeTab === 'info' ? '#fff' : '#9ca3af',
            cursor: 'pointer',
          }}
        >
          Información
        </button>
        <button
          onClick={() => setActiveTab('relations')}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '12px',
            fontWeight: '600',
            border: 'none',
            borderBottom: activeTab === 'relations' ? '2px solid #a855f7' : 'none',
            backgroundColor: activeTab === 'relations' ? '#111827' : 'transparent',
            color: activeTab === 'relations' ? '#fff' : '#9ca3af',
            cursor: 'pointer',
          }}
        >
          Relaciones ({relatedPersons.length})
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {activeTab === 'info' && (
          <div>
            {age !== null && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600', margin: 0 }}>EDAD</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: '4px 0' }}>{age} años</p>
              </div>
            )}
            {person.birth_place && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600', margin: 0 }}>📍 LUGAR DE NACIMIENTO</p>
                <p style={{ color: '#fff', margin: '4px 0' }}>{person.birth_place}</p>
              </div>
            )}
            {person.current_location && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600', margin: 0 }}>🏠 UBICACIÓN ACTUAL</p>
                <p style={{ color: '#fff', margin: '4px 0' }}>{person.current_location}</p>
              </div>
            )}
            {photos.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600', margin: '0 0 10px 0' }}>
                  📸 FOTOS ({photos.length})
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {photos.map(photo => (
                    <div key={photo.id}
                      onClick={() => setLightbox(photo)}
                      style={{
                        aspectRatio: '1', borderRadius: '8px', overflow: 'hidden',
                        cursor: 'pointer', background: '#374151',
                      }}>
                      <img src={photo.cloudinary_url} alt={photo.caption || ''}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Note: Edit and Add Photo buttons will be shown based on user role (Phase 3+) */}
          </div>
        )}

        {activeTab === 'relations' && (
          <div>
            {relatedPersons.length > 0 ? (
              relatedPersons.map((rel) => (
                <div
                  key={rel.person?.id}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: '#1f2937',
                    borderRadius: '6px',
                    border: '1px solid #374151',
                  }}
                >
                  <p style={{ fontWeight: '600', color: '#fff', margin: 0 }}>
                    {rel.person?.first_name} {rel.person?.last_name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0' }}>
                    {getRelationLabel(rel.relationship, person.id)}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '24px' }}>No hay relaciones registradas</p>
            )}
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div onClick={() => setLightbox(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, padding: '24px',
          }}>
            <img src={lightbox.cloudinary_url} alt={lightbox.caption || ''}
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px', objectFit: 'contain' }} />
            {(lightbox.caption || lightbox.year) && (
              <p style={{ color: '#9ca3af', marginTop: '12px', fontSize: '14px' }}>
                {lightbox.caption}{lightbox.caption && lightbox.year ? ' · ' : ''}{lightbox.year}
              </p>
            )}
            <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px' }}>Toca para cerrar</p>
          </div>
        )}
      </div>
    </div>
  );
}
