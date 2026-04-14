import { useState, useEffect } from 'react';

const STORAGE_KEY = 'fs_access_granted';
const CORRECT_PASSWORD = import.meta.env.VITE_ACCESS_PASSWORD || 'estrellas2026';

export default function PasswordGate({ children }) {
  const [granted, setGranted] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shake, setShake] = useState(false);

  // Comprobar si ya tiene acceso guardado
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === CORRECT_PASSWORD) {
      setGranted(true);
    }
    setLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim().toLowerCase() === CORRECT_PASSWORD.toLowerCase()) {
      localStorage.setItem(STORAGE_KEY, CORRECT_PASSWORD);
      setGranted(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 600);
    }
  };

  // Mientras comprueba localStorage, no mostrar nada
  if (loading) return null;

  // Si tiene acceso, mostrar el contenido protegido
  if (granted) return children;

  // Pantalla de contraseña
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #080C18 0%, #0f172a 50%, #1a0a2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Estrellas de fondo */}
      <StarryBg />

      {/* Card central */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(168,85,247,0.2)',
          borderRadius: '20px',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌟</div>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 8px 0',
            letterSpacing: '0.5px',
          }}
        >
          FamilyStars
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: '#94a3b8',
            margin: '0 0 32px 0',
            lineHeight: '1.6',
          }}
        >
          Introduce el código de acceso para<br />
          explorar la constelación familiar
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              animation: shake ? 'shake 0.5s ease' : 'none',
            }}
          >
            <input
              type="password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              placeholder="Código de acceso"
              autoFocus
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${error ? '#ef4444' : 'rgba(168,85,247,0.3)'}`,
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '16px',
                textAlign: 'center',
                letterSpacing: '3px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                marginBottom: '12px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(168,85,247,0.8)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error
                  ? '#ef4444'
                  : 'rgba(168,85,247,0.3)';
              }}
            />

            {error && (
              <p
                style={{
                  color: '#ef4444',
                  fontSize: '13px',
                  margin: '0 0 12px 0',
                }}
              >
                Código incorrecto. Inténtalo de nuevo.
              </p>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s, transform 0.1s',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
              onMouseDown={(e) => (e.target.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
            >
              ✨ Acceder
            </button>
          </div>
        </form>

        <p
          style={{
            fontSize: '12px',
            color: '#475569',
            marginTop: '24px',
            lineHeight: '1.5',
          }}
        >
          ¿No tienes el código?<br />
          Contacta con un miembro de la familia
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

// Componente de estrellas de fondo (simple, sin canvas)
function StarryBg() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 3,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            background: '#ffffff',
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ${star.delay}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
