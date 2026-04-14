# FamilyStars — Protección por contraseña (Password Gate)

## Objetivo

Añadir una pantalla de contraseña entre la landing y la constelación.
Cualquiera que intente acceder a `/app` sin la contraseña correcta
verá la pantalla de acceso. Una vez introducida correctamente,
se guarda en localStorage y no vuelve a pedirla.

---

## Lo que NO hay que tocar

- `Landing.jsx` — no se modifica
- `Constellation.jsx` — no se modifica
- El backend — no necesita ningún cambio
- Las rutas del admin — el admin tiene su propio sistema de auth

---

## Archivos a crear o modificar

```
apps/frontend/src/
├── pages/
│   └── PasswordGate.jsx    ← CREAR
├── App.jsx                  ← MODIFICAR (añadir lógica de protección)
└── .env                     ← MODIFICAR (añadir variable de contraseña)
```

---

## Paso 1 — Variable de entorno en Netlify y local

**Archivo:** `apps/frontend/.env`

```
VITE_ACCESS_PASSWORD=estrellas2026
```

También añadirla en Netlify:
- Dashboard de Netlify → Site → **Environment variables**
- Añadir: `VITE_ACCESS_PASSWORD` = `estrellas2026` (o la que decida Chencho)
- Hacer redeploy tras añadirla

La contraseña puede ser cualquier palabra fácil de recordar y compartir
por WhatsApp con la familia. No es un sistema de seguridad bancario,
es una barrera de acceso familiar.

---

## Paso 2 — Crear PasswordGate.jsx

**Archivo:** `apps/frontend/src/pages/PasswordGate.jsx`

```jsx
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
```

---

## Paso 3 — Modificar App.jsx

Envolver la ruta `/app` con el `PasswordGate`:

**Archivo:** `apps/frontend/src/App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Constellation from './pages/Constellation';
import Admin from './pages/Admin';
import PasswordGate from './pages/PasswordGate';
import './styles/index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing — pública, sin protección */}
        <Route path="/" element={<Landing />} />

        {/* Constelación — protegida por contraseña */}
        <Route
          path="/app"
          element={
            <PasswordGate>
              <Constellation />
            </PasswordGate>
          }
        />

        {/* Admin — protegido por JWT (su propio sistema) */}
        <Route path="/admin" element={<AdminRoute />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function AdminRoute() {
  const token = localStorage.getItem('fs_token');
  if (!token) return <Navigate to="/" />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') return <Navigate to="/" />;
    return <Admin />;
  } catch {
    return <Navigate to="/" />;
  }
}

export default App;
```

---

## Cómo funciona

```
Usuario entra a /app
        |
        v
PasswordGate comprueba localStorage
        |
   -----+-----
   |         |
Tiene      No tiene
contraseña contraseña
correcta   guardada
   |         |
   v         v
Constellation  Pantalla de
se renderiza   contraseña
               |
         Introduce código
               |
          -----+------
          |          |
       Correcto   Incorrecto
          |          |
   Guarda en     Animación
   localStorage  de shake +
   y entra       mensaje error
```

---

## Cómo cambiar la contraseña en el futuro

1. Cambiar `VITE_ACCESS_PASSWORD` en Netlify → Variables de entorno
2. Hacer redeploy
3. Todos los usuarios con la contraseña antigua verán la pantalla de acceso
   de nuevo — el localStorage tiene la contraseña antigua que ya no coincide

---

## Cómo compartir el acceso con la familia

Simplemente por WhatsApp:

```
Hola! Os comparto nuestro árbol genealógico familiar 🌟

🔗 https://familystarss.netlify.app/app
🔑 Código: estrellas2026

Explorad, haced zoom, pulsad en las estrellas...
```

---

## Notas importantes

- El admin (`/admin`) NO usa este sistema — tiene su propio JWT.
  No envolver `/admin` con PasswordGate.
- La contraseña se almacena en `localStorage` como texto plano.
  No es seguridad bancaria, es una barrera de acceso familiar sencilla.
- Si alguien comparte la contraseña con otros, no hay forma de saberlo.
  Para control más fino, implementar el sistema de roles completo en Fase 3.
- La variable `VITE_ACCESS_PASSWORD` es visible en el bundle de JavaScript
  compilado — cualquier persona técnica podría encontrarla inspeccionando
  el código. Para el uso familiar previsto esto es completamente aceptable.
