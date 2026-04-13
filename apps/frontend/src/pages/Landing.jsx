import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', overflow: 'hidden' }}>
      {/* Animated background stars */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header
          style={{
            padding: '24px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(168, 85, 247, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              }}
            >
              ⭐
            </div>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>FamilyStars</span>
          </div>
          <button
            onClick={() => navigate('/app')}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              border: 'none',
              color: '#fff',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 8px 16px rgba(168, 85, 247, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 12px 24px rgba(168, 85, 247, 0.5)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 8px 16px rgba(168, 85, 247, 0.3)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Usar la App
          </button>
        </header>

        {/* Hero Section */}
        <section
          style={{
            padding: '80px 40px',
            textAlign: 'center',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Tu Árbol Genealógico como Constelación
          </h1>
          <p style={{ fontSize: '20px', color: '#a0aec0', marginBottom: '40px', lineHeight: '1.6' }}>
            Visualiza tu familia como estrellas en el universo. Cada persona es una estrella, cada familia una constelación.
            Conecta, descubre y comparte tu historia.
          </p>
          <button
            onClick={() => navigate('/app')}
            style={{
              padding: '16px 48px',
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              border: 'none',
              color: '#fff',
              borderRadius: '24px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 12px 32px rgba(168, 85, 247, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 16px 48px rgba(168, 85, 247, 0.6)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 12px 32px rgba(168, 85, 247, 0.4)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ✨ Comienza Ahora (es Gratis)
          </button>
        </section>

        {/* Features Section */}
        <section
          style={{
            padding: '80px 40px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '60px',
              textAlign: 'center',
              color: '#fff',
            }}
          >
            Por qué FamilyStars
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '30px',
            }}
          >
            {[
              {
                icon: '🌟',
                title: 'Visual Premium',
                description: 'Visualiza tu árbol genealógico como una constelación animada. Interactivo, moderno y hermoso.',
              },
              {
                icon: '🔍',
                title: 'Búsqueda Rápida',
                description: 'Encuentra a cualquier familiar al instante. La cámara vuela hacia su estrella automáticamente.',
              },
              {
                icon: '📱',
                title: 'Funciona en Móvil',
                description: 'Aplicación web progresiva (PWA). Úsala sin instalar nada, funciona offline.',
              },
              {
                icon: '👥',
                title: 'Colaborativo',
                description: 'Invita a tu familia a sugerir personas y fotos. Todo se aprueba antes de publicar.',
              },
              {
                icon: '🔒',
                title: 'Privado & Seguro',
                description: 'Control total de quién ve qué. Sistema de permisos por rol.',
              },
              {
                icon: '💾',
                title: 'Gratis para Siempre',
                description: 'Sin publicidad, sin límites. Código abierto y lista para migrar a tu NAS.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: '30px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#a0aec0', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section
          style={{
            padding: '80px 40px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
            borderTop: '1px solid rgba(168, 85, 247, 0.2)',
            borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
          }}
        >
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#fff',
            }}
          >
            ¿Listo para explorar tu constelación?
          </h2>
          <p style={{ fontSize: '18px', color: '#a0aec0', marginBottom: '40px' }}>
            Empieza gratis, sin crear cuenta, sin complicaciones.
          </p>
          <button
            onClick={() => navigate('/app')}
            style={{
              padding: '16px 48px',
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              border: 'none',
              color: '#fff',
              borderRadius: '24px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 12px 32px rgba(168, 85, 247, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 16px 48px rgba(168, 85, 247, 0.6)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 12px 32px rgba(168, 85, 247, 0.4)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Entrar a FamilyStars
          </button>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: '40px',
            textAlign: 'center',
            borderTop: '1px solid rgba(168, 85, 247, 0.1)',
            color: '#64748b',
            fontSize: '12px',
          }}
        >
          <p>Un universo para no perder a nadie • FamilyStars 2026</p>
        </footer>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
