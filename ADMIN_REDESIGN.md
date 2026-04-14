# FamilyStars — Rediseño completo del dashboard de admin

## Problema actual

1. `AdminLayout.jsx` — el objeto `PANELS` está roto: solo tiene `stats` y
   `families` (mal asignado a `PendingPanel`). Personas, Relaciones y
   Pendientes NO aparecen en el menú. Estilo Tailwind básico sin personalidad.

2. `Auth.jsx` — mezcla Tailwind con inline styles, visualmente inconsistente.

3. Todos los paneles usan Tailwind que en producción no genera todas las
   clases correctamente (problema ya visto con los modales).

## Objetivo

Reescribir `AdminLayout.jsx` y `Auth.jsx` completamente con estilos inline,
siguiendo el mismo lenguaje visual del `PhotoUploader.jsx` — que ya está bien.

Paleta de referencia (extraída del PhotoUploader):
```
Fondo página:      #111827
Fondo sidebar:     #1f2937
Fondo cards:       #1f2937
Fondo inputs:      #111827
Bordes:            #374151
Acento principal:  #7c3aed / #a855f7
Texto primario:    #ffffff
Texto secundario:  #9ca3af
Texto terciario:   #6b7280
Peligro:           #dc2626
Éxito:             #059669
```

---

## Archivo 1 — AdminLayout.jsx (reescribir completo)

**Archivo:** `apps/frontend/src/components/admin/AdminLayout.jsx`

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsPanel from './StatsPanel';
import FamiliesPanel from './FamiliesPanel';
import PersonsPanel from './PersonsPanel';
import RelationshipsPanel from './RelationshipsPanel';
import PendingPanel from './PendingPanel';

const PANELS = {
  stats:         { name: 'Resumen',    icon: '📊', component: StatsPanel },
  families:      { name: 'Familias',   icon: '⭐', component: FamiliesPanel },
  persons:       { name: 'Personas',   icon: '👤', component: PersonsPanel },
  relationships: { name: 'Relaciones', icon: '🔗', component: RelationshipsPanel },
  pending:       { name: 'Pendientes', icon: '⏳', component: PendingPanel },
};

export default function AdminLayout({ user }) {
  const [activePanel, setActivePanel] = useState('stats');
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();
  const Panel = PANELS[activePanel].component;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#111827', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: '220px',
        flexShrink: 0,
        background: '#1f2937',
        borderRight: '1px solid #374151',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #374151',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0,
            }}>
              🌟
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: '700', fontSize: '15px', lineHeight: 1 }}>
                FamilyStars
              </div>
              <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '3px' }}>
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {Object.entries(PANELS).map(([key, panel]) => {
            const isActive = activePanel === key;
            return (
              <button
                key={key}
                onClick={() => setActivePanel(key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(124,58,237,0.25)' : 'transparent',
                  color: isActive ? '#a855f7' : '#9ca3af',
                  fontWeight: isActive ? '600' : '400',
                  fontSize: '14px',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  outline: isActive ? '1px solid rgba(168,85,247,0.3)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{panel.icon}</span>
                <span style={{ flex: 1 }}>{panel.name}</span>
                {key === 'pending' && pendingCount > 0 && (
                  <span style={{
                    background: '#dc2626',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    flexShrink: 0,
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #374151',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div>
            <div style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: '600' }}>
              {user?.name || 'Admin'}
            </div>
            <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px', wordBreak: 'break-all' }}>
              {user?.email}
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/'); }}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#9ca3af',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            ← Volver a la app
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{
          padding: '18px 32px',
          borderBottom: '1px solid #374151',
          background: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>{PANELS[activePanel].icon}</span>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 }}>
              {PANELS[activePanel].name}
            </h2>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            background: '#111827',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid #374151',
          }}>
            FamilyStars Admin
          </div>
        </div>

        {/* Panel content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <Panel onPendingCountChange={setPendingCount} />
        </div>
      </div>
    </div>
  );
}
```

---

## Archivo 2 — Auth.jsx (reescribir completo)

**Archivo:** `apps/frontend/src/pages/Auth.jsx`

```jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/client';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) verifyToken(token);
  }, [token]);

  const verifyToken = async (t) => {
    try {
      setLoading(true);
      const response = await authAPI.verify(t);
      localStorage.setItem('token', response.data.token);
      setSuccess('¡Autenticado! Redirigiendo...');
      setTimeout(() => {
        navigate(response.data.role === 'admin' ? '/admin' : '/app');
      }, 1500);
    } catch {
      setError('Token inválido o expirado. Solicita un nuevo enlace.');
      setLoading(false);
    }
  };

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await authAPI.magicLink(email);
      setSuccess('¡Enlace enviado! Revisa tu email.');
    } catch {
      setError('Error al enviar el enlace. Verifica el email.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.data.token);
      navigate(response.data.role === 'admin' ? '/admin' : '/app');
    } catch {
      setError('Email o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: '#111827',
    border: '1px solid #374151',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const btnPrimary = {
    width: '100%',
    padding: '13px',
    background: loading ? '#374151' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.2s',
    marginTop: '4px',
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '9px',
    background: active ? 'rgba(124,58,237,0.25)' : 'transparent',
    border: active ? '1px solid rgba(168,85,247,0.3)' : '1px solid #374151',
    borderRadius: '8px',
    color: active ? '#a855f7' : '#9ca3af',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #080C18 0%, #0f172a 50%, #1a0a2e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Estrellas de fondo */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 2 + 1}px`,
          background: '#fff',
          borderRadius: '50%',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.4 + 0.1,
          animation: `twinkle ${Math.random() * 3 + 2}s ${Math.random() * 3}s ease-in-out infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(31,41,55,0.9)',
        border: '1px solid #374151',
        borderRadius: '20px',
        padding: '36px 32px',
        position: 'relative',
        zIndex: 10,
        backdropFilter: 'blur(20px)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', margin: '0 auto 14px',
            boxShadow: '0 8px 24px rgba(168,85,247,0.3)',
          }}>
            🌟
          </div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 6px' }}>
            FamilyStars Admin
          </h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
            Accede al panel de administración
          </p>
        </div>

        {/* Verificando token */}
        {token && loading && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Verificando acceso...</p>
          </div>
        )}

        {/* Formularios */}
        {!token && (
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                onClick={() => { setStep('email'); setError(null); setSuccess(null); }}
                style={tabStyle(step === 'email')}
              >
                Magic Link
              </button>
              <button
                onClick={() => { setStep('login'); setError(null); setSuccess(null); }}
                style={tabStyle(step === 'login')}
              >
                Contraseña
              </button>
            </div>

            {/* Magic Link */}
            {step === 'email' && (
              <form onSubmit={handleSendMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
                    onBlur={(e) => (e.target.style.borderColor = '#374151')}
                  />
                </div>
                <button type="submit" disabled={loading} style={btnPrimary}>
                  {loading ? 'Enviando...' : '✉️ Recibir enlace de acceso'}
                </button>
              </form>
            )}

            {/* Login con contraseña */}
            {step === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
                    onBlur={(e) => (e.target.style.borderColor = '#374151')}
                  />
                </div>
                <div>
                  <label style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
                    onBlur={(e) => (e.target.style.borderColor = '#374151')}
                  />
                </div>
                <button type="submit" disabled={loading} style={btnPrimary}>
                  {loading ? 'Entrando...' : '🔑 Entrar'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(220,38,38,0.1)',
            border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: '10px',
            color: '#fca5a5',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        {/* Éxito */}
        {success && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(5,150,105,0.1)',
            border: '1px solid rgba(5,150,105,0.3)',
            borderRadius: '10px',
            color: '#6ee7b7',
            fontSize: '13px',
          }}>
            {success}
          </div>
        )}

        {/* Volver */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a
            href="/"
            style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.target.style.color = '#a855f7')}
            onMouseLeave={(e) => (e.target.style.color = '#6b7280')}
          >
            ← Volver al inicio
          </a>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
```

---

## Notas importantes

- **El objeto PANELS estaba roto** — solo tenía `stats` y `families`
  (este último asignado incorrectamente a `PendingPanel`).
  El nuevo código tiene los 5 paneles correctamente asignados.

- **Todos los estilos son inline** — no dependen de Tailwind en producción,
  igual que el `PhotoUploader.jsx` que ya funciona bien.

- **El token de auth** se guarda como `'token'` en localStorage (no `'fs_token'`).
  Verificar que el `AdminRoute` en `App.jsx` usa la misma clave:
  ```javascript
  const token = localStorage.getItem('token'); // ← debe ser 'token', no 'fs_token'
  ```

- Los paneles internos (StatsPanel, FamiliesPanel, etc.) mantienen su estilo
  actual — no hay que reescribirlos ahora. El rediseño es solo el layout
  exterior y el login.
