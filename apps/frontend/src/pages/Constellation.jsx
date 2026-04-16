import { useState, useEffect, useRef } from 'react';
import ConstellationCanvas from '../components/constellation/Canvas';
import SearchBar from '../components/search/SearchBar';
import ProfilePanel from '../components/profile/ProfilePanel';
import StarryBackground from '../components/background/StarryBackground';
import { personsAPI, familiesAPI, relationshipsAPI } from '../api/client';
import { useAPI } from '../hooks/useAPI';

export default function Constellation() {
  const [persons, setPersons] = useState([]);
  const [families, setFamilies] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personToAnimate, setPersonToAnimate] = useState(null);
  const [familyFilter, setFamilyFilter] = useState(null); // MEJORA 5: estado del filtro
  const canvasRef = useRef(null); // MEJORA 6: ref para exportar imagen

  useEffect(() => {
    loadData();
  }, []);

  // Handle person selection from search - animate only (don't open profile)
  const handleSelectPersonFromSearch = (person) => {
    if (person) {
      setPersonToAnimate(person); // Trigger canvas animation only
      // Profile opens on star click, not automatically
    }
  };

  async function loadData() {
    try {
      setLoading(true);
      const [personsRes, familiesRes, relationshipsRes] = await Promise.all([
        personsAPI.list(),
        familiesAPI.list(),
        relationshipsAPI.list(),
      ]);

      // Check if we have valid data
      // Axios wraps response in data, backend also returns { data: [...] }, so double-wrapped
      const persons = Array.isArray(personsRes?.data) ? personsRes.data : personsRes?.data?.data || [];
      const families = Array.isArray(familiesRes?.data) ? familiesRes.data : familiesRes?.data?.data || [];
      const relationships = Array.isArray(relationshipsRes?.data) ? relationshipsRes.data : relationshipsRes?.data?.data || [];

      // Always use data from API (even if empty)
      setPersons(persons);
      setFamilies(families);
      setRelationships(relationships);
    } catch (err) {
      console.log('Error loading from API, using mock data:', err.message);
      // Use mock data when API fails or is empty
      const mockFamilies = [
        { id: '1', name: 'Paterna', color_hex: '9B59B6' },
        { id: '2', name: 'Materna', color_hex: '3498DB' },
        { id: '3', name: 'Política 1', color_hex: 'F39C12' },
        { id: '4', name: 'Política 2', color_hex: '27AE60' },
      ];

      const mockPersons = [
        { id: '1', first_name: 'Carlos', last_name: 'García', family_id: '1' },
        { id: '2', first_name: 'María', last_name: 'López', family_id: '2' },
        { id: '3', first_name: 'Juan', last_name: 'Pérez', family_id: '1' },
        { id: '4', first_name: 'Ana', last_name: 'Martínez', family_id: '2' },
        { id: '5', first_name: 'Luis', last_name: 'González', family_id: '3' },
        { id: '6', first_name: 'Rosa', last_name: 'Sánchez', family_id: '4' },
        { id: '7', first_name: 'Pedro', last_name: 'Rodríguez', family_id: '1' },
        { id: '8', first_name: 'Elena', last_name: 'Díaz', family_id: '2' },
      ];

      const mockRelationships = [
        { id: '1', person_a_id: '1', person_b_id: '2', type: 'partner' },
        { id: '2', person_a_id: '1', person_b_id: '3', type: 'parent' },
        { id: '3', person_a_id: '2', person_b_id: '4', type: 'sibling' },
        { id: '4', person_a_id: '3', person_b_id: '5', type: 'partner' },
        { id: '5', person_a_id: '5', person_b_id: '6', type: 'sibling' },
        { id: '6', person_a_id: '1', person_b_id: '7', type: 'sibling' },
        { id: '7', person_a_id: '2', person_b_id: '8', type: 'parent' },
      ];

      setFamilies(mockFamilies);
      setPersons(mockPersons);
      setRelationships(mockRelationships);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-space-dark">
        <div className="spinner">
          <svg
            className="w-12 h-12 text-constellation-purple"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full h-full flex flex-col bg-space-dark relative">
      {/* Starry Background */}
      <StarryBackground />

      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.4) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(168, 85, 247, 0.1)',
          padding: '16px 24px',
          position: 'relative',
          zIndex: 20,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {/* Animated Logo */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 'bold',
                boxShadow: '0 8px 16px rgba(168, 85, 247, 0.3)',
                animation: 'pulse 2s ease-in-out infinite',
                flexShrink: 0,
              }}
            >
              ⭐
            </div>
            <div>
              <h1
                style={{
                  fontSize: window.innerWidth < 640 ? '18px' : '22px',
                  fontWeight: 'bold',
                  color: '#fff',
                  margin: 0,
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                }}
              >
                FamilyStars
              </h1>
              <p
                style={{
                  fontSize: '11px',
                  color: '#a0aec0',
                  margin: '1px 0 0 0',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                {persons.length} estrellas • {families.length} constelaciones
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ flex: '1 1 280px', minWidth: '280px', maxWidth: '420px' }}>
            <SearchBar persons={persons} families={families} onSelectPerson={handleSelectPersonFromSearch} />
          </div>

          {/* MEJORA 5: Filtro de familia */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFamilyFilter(null)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: 'none',
                cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                background: familyFilter === null
                  ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.07)',
                color: familyFilter === null ? '#e9d5ff' : '#9ca3af',
                transition: 'all 0.2s',
              }}
            >
              Todas
            </button>
            {families.map(f => (
              <button
                key={f.id}
                onClick={() => setFamilyFilter(familyFilter === f.id ? null : f.id)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', border: 'none',
                  cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                  background: familyFilter === f.id
                    ? `rgba(${parseInt(f.color_hex.slice(0,2),16)},${parseInt(f.color_hex.slice(2,4),16)},${parseInt(f.color_hex.slice(4,6),16)},0.35)`
                    : 'rgba(255,255,255,0.07)',
                  color: familyFilter === f.id ? '#fff' : '#9ca3af',
                  borderLeft: familyFilter === f.id ? `3px solid #${f.color_hex}` : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {f.display_name || f.name}
              </button>
            ))}
          </div>

          {/* MEJORA 6: Botones de exportar */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {/* Botón PNG */}
            <button
              onClick={() => canvasRef.current?.exportAsImage()}
              title="Descargar como imagen PNG"
              style={{
                padding: '8px 12px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#9ca3af', fontSize: '16px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#9ca3af'; }}
            >
              📸
            </button>

            {/* Botón SVG */}
            <button
              onClick={() => canvasRef.current?.exportAsSVG()}
              title="Descargar como SVG vectorial (para imprimir)"
              style={{
                padding: '8px 12px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#9ca3af', fontSize: '16px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#9ca3af'; }}
            >
              🖨️
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <ConstellationCanvas
          ref={canvasRef}
          persons={persons}
          families={families}
          relationships={relationships}
          onSelectPerson={setSelectedPerson}
          personToAnimate={personToAnimate}
          familyFilter={familyFilter}
        />
      </div>

      {/* Profile Panel - Outside Canvas to be truly fixed */}
      {selectedPerson && (
        <ProfilePanel
          person={selectedPerson}
          families={families}
          relationships={relationships}
          persons={persons}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      {/* Footer */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(30,41,59,0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(168, 85, 247, 0.1)',
          padding: '12px 24px',
          position: 'relative',
          zIndex: 20,
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', fontSize: '12px' }}>
          <span style={{ color: '#a0aec0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>👆</span> Arrastra
          </span>
          <span style={{ color: '#a0aec0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔍</span> Zoom
          </span>
          <span style={{ color: '#a0aec0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⭐</span> Perfil
          </span>
        </div>
        <p
          style={{
            fontSize: '10px',
            color: '#64748b',
            textAlign: 'center',
            margin: '8px 0 0 0',
            fontWeight: '500',
          }}
        >
          Un universo para no perder a nadie • FamilyStars 2026
        </p>
      </div>
    </div>
  );
}
