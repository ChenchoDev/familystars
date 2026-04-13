import { useState, useEffect } from 'react';

export default function ProfilePanel({ person, families, relationships, persons, onClose }) {
  if (!person) return null;

  const [activeTab, setActiveTab] = useState('info');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const family = families.find((f) => f.id === person.family_id);

  // Detect window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const relatedPersons = relationships
    .filter((rel) => rel.person_a_id === person.id || rel.person_b_id === person.id)
    .map((rel) => {
      const relatedId = rel.person_a_id === person.id ? rel.person_b_id : rel.person_a_id;
      return {
        person: persons.find((p) => p.id === relatedId),
        type: rel.type,
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
              }}
            >
              {person.first_name?.[0]}{person.last_name?.[0]}
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
                    {rel.type === 'partner' ? '💑 Pareja' :
                     rel.type === 'parent' ? '👨‍👩 Padre/Madre' :
                     rel.type === 'child' ? '👶 Hijo/Hija' :
                     rel.type === 'sibling' ? '👯 Hermano/Hermana' :
                     rel.type === 'cousin' ? '👥 Primo/Prima' : rel.type}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '24px' }}>No hay relaciones registradas</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
