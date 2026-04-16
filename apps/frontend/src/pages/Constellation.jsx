import { useState, useEffect, useRef } from 'react';
import ConstellationCanvas from '../components/constellation/Canvas';
import SearchBar from '../components/search/SearchBar';
import ProfilePanel from '../components/profile/ProfilePanel';
import StarryBackground from '../components/background/StarryBackground';
import { personsAPI, familiesAPI, relationshipsAPI } from '../api/client';

export default function Constellation() {
  const [persons, setPersons] = useState([]);
  const [families, setFamilies] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personToAnimate, setPersonToAnimate] = useState(null);
  const [familyFilter, setFamilyFilter] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [personsRes, familiesRes, relationshipsRes] = await Promise.all([
        personsAPI.list(),
        familiesAPI.list(),
        relationshipsAPI.list(),
      ]);
      const persons = Array.isArray(personsRes?.data) ? personsRes.data : personsRes?.data?.data || [];
      const families = Array.isArray(familiesRes?.data) ? familiesRes.data : familiesRes?.data?.data || [];
      const relationships = Array.isArray(relationshipsRes?.data) ? relationshipsRes.data : relationshipsRes?.data?.data || [];
      setPersons(persons.filter(p => p.status === 'approved'));
      setFamilies(families);
      setRelationships(relationships);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
  };

  const handleSelectPersonFromSearch = (person) => {
    if (person) {
      setPersonToAnimate(person);
      setSelectedPerson(person);
    }
  };

  if (loading) {
    return (
      <div style={{
        width: '100%', height: '100vh',
        background: '#080C18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
      }}>
        <div style={{ fontSize: '32px', animation: 'spin 2s linear infinite' }}>🌟</div>
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>Cargando el universo...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', background: '#080C18', position: 'relative', overflow: 'hidden' }}>

      {/* Fondo de estrellas */}
      <StarryBackground />

      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        background: 'linear-gradient(180deg, rgba(8,12,24,0.9) 0%, rgba(8,12,24,0) 100%)',
        backdropFilter: 'blur(10px)',
        padding: '16px 24px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
        }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', boxShadow: '0 4px 16px rgba(168,85,247,0.4)',
            }}>🌟</div>
            <div>
              <div style={{ color: '#fff', fontWeight: '800', fontSize: '15px', lineHeight: 1 }}>FamilyStars</div>
              <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '2px' }}>
                {persons.length} estrellas · {families.length} constelaciones
              </div>
            </div>
          </div>

          {/* Buscador */}
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <SearchBar
              persons={persons}
              families={families}
              onSelectPerson={handleSelectPersonFromSearch}
            />
          </div>

          {/* Botones de exportar */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {/* Botón PNG */}
            <button
              onClick={() => canvasRef.current?.exportAsImage()}
              title="Descargar como imagen PNG"
              style={{
                padding: '8px 12px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#9ca3af', fontSize: '16px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#9ca3af'; }}
            >
              📸
            </button>

            {/* Botón SVG */}
            <button
              onClick={() => canvasRef.current?.exportAsSVG()}
              title="Descargar como SVG vectorial (para imprimir)"
              style={{
                padding: '8px 12px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#9ca3af', fontSize: '16px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#9ca3af'; }}
            >
              🖨️
            </button>
          </div>
        </div>

        {/* Filtro de familias */}
        {families.length > 0 && (
          <div style={{
            display: 'flex', gap: '8px', flexWrap: 'wrap',
            marginTop: '12px', alignItems: 'center',
          }}>
            <button
              onClick={() => setFamilyFilter(null)}
              style={{
                padding: '5px 14px', borderRadius: '20px', border: 'none',
                cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                background: familyFilter === null ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.06)',
                color: familyFilter === null ? '#e9d5ff' : '#6b7280',
                transition: 'all 0.2s',
              }}
            >
              Todas
            </button>
            {families.map(f => {
              const r = parseInt(f.color_hex.slice(0,2), 16);
              const g = parseInt(f.color_hex.slice(2,4), 16);
              const b = parseInt(f.color_hex.slice(4,6), 16);
              const isActive = familyFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFamilyFilter(isActive ? null : f.id)}
                  style={{
                    padding: '5px 14px', borderRadius: '20px', border: 'none',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                    background: isActive ? `rgba(${r},${g},${b},0.3)` : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#fff' : '#6b7280',
                    borderLeft: isActive ? `3px solid #${f.color_hex}` : '3px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {(f.display_name || f.name).toUpperCase()}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Canvas de constelación */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <ConstellationCanvas
          ref={canvasRef}
          persons={persons}
          families={families}
          relationships={relationships}
          onSelectPerson={handleSelectPerson}
          personToAnimate={personToAnimate}
          familyFilter={familyFilter}
        />
      </div>

      {/* Panel de perfil */}
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
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        padding: '8px 24px', textAlign: 'center',
        background: 'linear-gradient(0deg, rgba(8,12,24,0.8) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        <p style={{ color: '#1e293b', fontSize: '11px', margin: 0 }}>
          Un universo para no perder a nadie · FamilyStars 2026
        </p>
      </div>
    </div>
  );
}
