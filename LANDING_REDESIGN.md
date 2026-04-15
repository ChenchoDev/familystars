# FamilyStars — Nueva Landing Page

## Instrucción

Reemplazar el archivo completo `apps/frontend/src/pages/Landing.jsx`
con el siguiente código.

---

```jsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Canvas con mini-constelación animada de fondo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Estrellas de fondo
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
    }));

    // Nodos de constelación decorativa
    const nodes = Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 180 + Math.random() * 120;
      return {
        x: window.innerWidth / 2 + Math.cos(angle) * radius,
        y: window.innerHeight / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 4 + 3,
        color: ['#a855f7', '#7c3aed', '#3b82f6', '#06b6d4', '#8b5cf6'][Math.floor(Math.random() * 5)],
        phase: Math.random() * Math.PI * 2,
      };
    });

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.012;

      // Dibujar estrellas de fondo
      stars.forEach(s => {
        const alpha = 0.15 + 0.4 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });

      // Mover nodos suavemente
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        // Fuerza suave hacia el centro
        n.vx += (cx - n.x) * 0.00008;
        n.vy += (cy - n.y) * 0.00008;
        // Límites suaves
        if (n.x < 80) n.vx += 0.05;
        if (n.x > window.innerWidth - 80) n.vx -= 0.05;
        if (n.y < 80) n.vy += 0.05;
        if (n.y > window.innerHeight - 80) n.vy -= 0.05;
      });

      // Dibujar líneas entre nodos cercanos
      nodes.forEach((a, i) => {
        nodes.forEach((b, j) => {
          if (j <= i) return;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 280) {
            const alpha = (1 - dist / 280) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // Dibujar nodos con halo pulsante
      nodes.forEach(n => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + n.phase);

        // Halo exterior
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3.5 * (1 + pulse * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}18`;
        ctx.fill();

        // Halo medio
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 2, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}30`;
        ctx.fill();

        // Núcleo
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      });

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const btnPrimary = {
    padding: '16px 40px',
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    border: 'none', borderRadius: '50px', color: '#fff',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(168,85,247,0.4)',
    transition: 'all 0.2s', letterSpacing: '0.3px',
  };

  const btnSecondary = {
    padding: '16px 40px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '50px', color: '#e2e8f0',
    fontSize: '16px', fontWeight: '600', cursor: 'pointer',
    transition: 'all 0.2s', letterSpacing: '0.3px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080C18', color: '#fff', overflowX: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Canvas de fondo */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* Contenido */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <header style={{
          padding: '20px 40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(168,85,247,0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(8,12,24,0.6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              boxShadow: '0 4px 16px rgba(168,85,247,0.4)',
            }}>🌟</div>
            <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '0.5px' }}>FamilyStars</span>
          </div>
          <button
            onClick={() => navigate('/app')}
            style={{ ...btnPrimary, padding: '10px 24px', fontSize: '14px' }}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.04)'; e.target.style.boxShadow = '0 12px 40px rgba(168,85,247,0.6)'; }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 8px 32px rgba(168,85,247,0.4)'; }}
          >
            Explorar el universo →
          </button>
        </header>

        {/* Hero */}
        <section style={{
          minHeight: '92vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 24px',
        }}>
          <div style={{
            display: 'inline-block', background: 'rgba(168,85,247,0.12)',
            border: '1px solid rgba(168,85,247,0.25)', borderRadius: '50px',
            padding: '6px 18px', fontSize: '13px', color: '#c084fc',
            fontWeight: '600', marginBottom: '32px', letterSpacing: '0.5px',
          }}>
            ✦ Un proyecto familiar hecho con amor
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 76px)',
            fontWeight: '900', lineHeight: '1.1',
            margin: '0 0 24px', maxWidth: '820px',
            background: 'linear-gradient(135deg, #fff 0%, #c084fc 50%, #818cf8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Cada persona de tu familia<br />es una estrella
          </h1>

          <p style={{
            fontSize: 'clamp(17px, 2.5vw, 22px)', color: '#94a3b8',
            maxWidth: '560px', lineHeight: '1.7', margin: '0 0 48px',
          }}>
            FamilyStars transforma tu árbol genealógico en una constelación viva e interactiva.
            Conecta generaciones, preserva historias y comparte el universo de tu familia.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/app')}
              style={btnPrimary}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(168,85,247,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(168,85,247,0.4)'; }}
            >
              ✨ Explorar la constelación
            </button>
            <button
              onClick={() => document.getElementById('centinela').scrollIntoView({ behavior: 'smooth' })}
              style={btnSecondary}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >
              Quiero colaborar
            </button>
          </div>

          {/* Scroll hint */}
          <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', animation: 'bounce 2s ease-in-out infinite' }}>
            <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, rgba(168,85,247,0.6))', margin: '0 auto' }} />
          </div>
        </section>

        {/* Cómo funciona */}
        <section style={{ padding: '100px 24px', maxWidth: '1000px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', color: '#7c3aed', fontWeight: '700', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Cómo funciona
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', margin: '0 0 64px', lineHeight: '1.2' }}>
            Tan sencillo como<br />mirar al cielo
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[
              {
                num: '01',
                icon: '🌟',
                title: 'Cada persona, una estrella',
                desc: 'Añade a los miembros de tu familia. Cada uno se convierte en una estrella dentro de su constelación familiar.',
              },
              {
                num: '02',
                icon: '🔗',
                title: 'Las relaciones, líneas de luz',
                desc: 'Conecta padres, hijos, parejas y hermanos. Las líneas que los unen forman tu constelación única.',
              },
              {
                num: '03',
                icon: '📸',
                title: 'Las fotos, su brillo',
                desc: 'Añade fotos a cada estrella. Su cara aparece en la constelación para que nunca se olvide quién fue.',
              },
              {
                num: '04',
                icon: '✉️',
                title: 'Comparte el universo',
                desc: 'Envía el enlace a tu familia. Que cada uno explore, descubra y recuerde de dónde viene.',
              },
            ].map((step, i) => (
              <div key={i} style={{
                padding: '32px 28px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(168,85,247,0.12)',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', letterSpacing: '1px' }}>{step.num}</span>
                  <span style={{ fontSize: '28px' }}>{step.icon}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px', color: '#f1f5f9' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.7', margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Frase */}
        <section style={{
          padding: '80px 24px', textAlign: 'center',
          borderTop: '1px solid rgba(168,85,247,0.08)',
          borderBottom: '1px solid rgba(168,85,247,0.08)',
          background: 'rgba(124,58,237,0.04)',
        }}>
          <blockquote style={{
            fontSize: 'clamp(22px, 3.5vw, 38px)', fontWeight: '300',
            fontStyle: 'italic', color: '#cbd5e1', maxWidth: '700px',
            margin: '0 auto', lineHeight: '1.5',
          }}>
            "Somos la suma de quienes nos precedieron.<br />
            <span style={{ color: '#a855f7', fontWeight: '600' }}>FamilyStars</span> es el mapa de ese camino."
          </blockquote>
        </section>

        {/* Sección Centinela */}
        <section id="centinela" style={{ padding: '100px 24px', maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: '28px', padding: '64px 48px',
          }}>
            <div style={{ fontSize: '52px', marginBottom: '20px' }}>⭐</div>
            <p style={{ color: '#a855f7', fontWeight: '700', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Únete al proyecto
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '800', margin: '0 0 20px', lineHeight: '1.2' }}>
              ¿Quieres ser<br />Centinela de tu familia?
            </h2>
            <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: '1.8', maxWidth: '540px', margin: '0 auto 16px' }}>
              Un <strong style={{ color: '#c084fc' }}>Centinela</strong> es el guardián de su constelación familiar.
              Se encarga de que los datos de su rama sean correctos, aprueba nuevas incorporaciones
              y ayuda a que la historia de su familia no se pierda.
            </p>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 40px' }}>
              Si tienes una familia que merezca estar aquí y quieres ser su guardián,
              escríbeme. Juntos construimos este universo.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <a
                href="mailto:chenchomarin@gmail.com?subject=Quiero ser Centinela de mi familia en FamilyStars&body=Hola Chencho,%0A%0AMi nombre es [tu nombre] y me gustaría ser el Centinela de la familia [nombre de la familia].%0A%0AUn saludo,"
                style={{
                  ...btnPrimary, textDecoration: 'none', display: 'inline-block',
                  fontSize: '15px',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(168,85,247,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(168,85,247,0.4)'; }}
              >
                ✉️ Escribirme a chenchomarin@gmail.com
              </a>
              <p style={{ color: '#475569', fontSize: '12px' }}>
                Respondo a todos los mensajes personalmente
              </p>
            </div>

            {/* Lo que implica ser Centinela */}
            <div style={{ marginTop: '48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', textAlign: 'left' }}>
              {[
                { icon: '✅', text: 'Apruebas quién entra en tu constelación' },
                { icon: '✏️', text: 'Editas y corriges datos de tu familia' },
                { icon: '📸', text: 'Subes fotos y preservas la memoria' },
                { icon: '🔐', text: 'Controlas la privacidad de tu rama' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', padding: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: '800', margin: '0 0 16px' }}>
            Tu familia te está esperando
          </h2>
          <p style={{ color: '#64748b', fontSize: '16px', margin: '0 0 40px' }}>
            Entra y encuentra tu estrella en la constelación
          </p>
          <button
            onClick={() => navigate('/app')}
            style={btnPrimary}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(168,85,247,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(168,85,247,0.4)'; }}
          >
            ✨ Entrar a FamilyStars
          </button>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '32px 40px', textAlign: 'center',
          borderTop: '1px solid rgba(168,85,247,0.08)',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <p style={{ color: '#334155', fontSize: '13px', margin: 0 }}>
            Un universo para no perder a nadie · FamilyStars 2026
          </p>
          <p style={{ color: '#1e293b', fontSize: '12px', margin: 0 }}>
            Hecho con amor por Chencho · <a href="mailto:chenchomarin@gmail.com" style={{ color: '#475569', textDecoration: 'none' }}>chenchomarin@gmail.com</a>
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        * { box-sizing: border-box; }
        ::selection { background: rgba(168,85,247,0.3); }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
```
