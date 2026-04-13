import { useState } from 'react';

export default function SearchBar({ persons, families, onSelectPerson }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSearch = (value) => {
    setQuery(value);
    if (value.trim() === '') {
      setResults([]);
      setShowResults(false);
      return;
    }

    const filtered = persons.filter((person) => {
      const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
      return fullName.includes(value.toLowerCase());
    });

    setResults(filtered);
    setShowResults(true);
  };

  const handleSelectPerson = (person) => {
    onSelectPerson(person);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 18px',
          background: focused
            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))'
            : 'rgba(255, 255, 255, 0.05)',
          border: focused ? '1.5px solid #a855f7' : '1.5px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          boxShadow: focused
            ? '0 8px 32px rgba(168, 85, 247, 0.15)'
            : '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        <span style={{ fontSize: '18px', opacity: focused ? 1 : 0.6, transition: 'opacity 0.3s' }}>
          ✨
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setShowResults(false), 200);
          }}
          placeholder="Busca una estrella..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            fontWeight: '500',
            letterSpacing: '0.5px',
            caretColor: '#a855f7',
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: '18px',
              padding: 0,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#fff')}
            onMouseLeave={(e) => (e.target.style.color = '#9ca3af')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            zIndex: 50,
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease-out',
          }}
        >
          {results.slice(0, 6).map((person, idx) => {
            const family = families.find((f) => f.id === person.family_id);
            return (
              <button
                key={person.id}
                onClick={() => handleSelectPerson(person)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 18px',
                  border: 'none',
                  background: 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderBottom: idx < results.slice(0, 6).length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)';
                  e.currentTarget.style.paddingLeft = '24px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.paddingLeft = '18px';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: `#${family?.color_hex || '9B59B6'}`,
                      boxShadow: `0 0 8px #${family?.color_hex || '9B59B6'}`,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                      {person.first_name} {person.last_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                      {family?.name}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
