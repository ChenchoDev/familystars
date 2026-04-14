# FamilyStars — Partículas luminosas al seleccionar estrella

## Qué hace

Al hacer clic en una estrella, partículas de luz viajan desde ella
por las líneas de conexión hacia sus familiares. La intensidad y cantidad
de partículas decrece con la distancia:
- Nivel 1 (padre, madre, pareja, hermano): muchas partículas, brillantes
- Nivel 2 (abuelos, tíos): partículas medias, menos brillantes
- Nivel 3 (bisabuelos, primos): pocas partículas, muy tenues
Al deseleccionar (clic en vacío o cerrar panel): partículas desaparecen.

---

## Implementación en Canvas.jsx

**Archivo:** `apps/frontend/src/components/constellation/Canvas.jsx`

### Paso 1 — Añadir ref para el canvas de partículas

Al principio del componente, junto a los otros refs:

```javascript
const particleCanvasRef = useRef(null);
const particleAnimRef = useRef(null);   // para cancelar el loop
const activeParticlesRef = useRef([]);  // partículas activas
```

### Paso 2 — Añadir el canvas de partículas en el JSX

Sustituir el return actual:

```jsx
// ANTES
return (
  <div ref={containerRef} className="w-full h-full">
    <svg ref={svgRef} ... />
  </div>
);

// DESPUÉS
return (
  <div ref={containerRef} className="w-full h-full" style={{ position: 'relative' }}>
    <svg
      ref={svgRef}
      className="constellation-canvas w-full h-full"
      style={{ cursor: 'grab', display: 'block' }}
    />
    <canvas
      ref={particleCanvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  </div>
);
```

### Paso 3 — Funciones de partículas

Añadir estas funciones FUERA del componente (antes del `export default`):

```javascript
// Calcular distancia BFS desde un nodo a todos los demás
function getBFSLevels(startId, allLinks) {
  const levels = { [startId]: 0 };
  const queue = [startId];
  while (queue.length) {
    const cur = queue.shift();
    allLinks.forEach(link => {
      const srcId = link.source?.id || link.source;
      const tgtId = link.target?.id || link.target;
      if (srcId === cur && !(tgtId in levels)) {
        levels[tgtId] = levels[cur] + 1;
        queue.push(tgtId);
      }
      if (tgtId === cur && !(srcId in levels)) {
        levels[srcId] = levels[cur] + 1;
        queue.push(srcId);
      }
    });
  }
  return levels;
}

// Crear partículas desde un nodo hacia sus conexiones
function spawnParticles(fromNode, allNodes, allLinks, familyColor) {
  const levels = getBFSLevels(fromNode.id, allLinks);
  const particles = [];

  allLinks.forEach(link => {
    const srcId = link.source?.id || link.source;
    const tgtId = link.target?.id || link.target;
    const isConnected = srcId === fromNode.id || tgtId === fromNode.id;
    if (!isConnected) return;

    const otherId = srcId === fromNode.id ? tgtId : srcId;
    const level = levels[otherId] || 99;
    if (level > 3) return;

    const otherNode = allNodes.find(n => n.id === otherId);
    if (!otherNode) return;

    // Más partículas cuanto más cerca
    const count = level === 1 ? 5 : level === 2 ? 3 : 1;
    const speed = 0.004 + Math.random() * 0.002;

    for (let i = 0; i < count; i++) {
      particles.push({
        fromNode,
        toNode: otherNode,
        t: -(i / count) * 0.8,  // desfase para que no salgan todas a la vez
        speed,
        level,
        color: familyColor,
        size: level === 1 ? 3 : level === 2 ? 2 : 1.5,
        maxAlpha: level === 1 ? 0.9 : level === 2 ? 0.55 : 0.25,
      });
    }
  });

  return particles;
}

// Loop de animación de partículas
function animateParticles(canvasEl, particlesRef, getCurrentTransform) {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');

  function frame() {
    const rect = canvasEl.getBoundingClientRect();
    canvasEl.width = rect.width;
    canvasEl.height = rect.height;
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Obtener la transformación actual del zoom de D3
    const transform = getCurrentTransform();

    particlesRef.current.forEach(p => {
      p.t += p.speed;
      if (p.t > 1.1) p.t = -Math.random() * 0.3; // reiniciar con pequeño retraso

      const t = Math.max(0, Math.min(1, p.t));

      // Posición en el espacio del mundo
      const wx = p.fromNode.x + (p.toNode.x - p.fromNode.x) * t;
      const wy = p.fromNode.y + (p.toNode.y - p.fromNode.y) * t;

      // Aplicar transformación de zoom/pan de D3
      const sx = transform.x + wx * transform.k;
      const sy = transform.y + wy * transform.k;

      // Alpha: sube al salir, baja al llegar
      const alpha = Math.sin(t * Math.PI) * p.maxAlpha;
      if (alpha <= 0) return;

      // Color con alpha
      const hex = p.color.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      ctx.beginPath();
      ctx.arc(sx, sy, p.size * transform.k, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();

      // Halo suave alrededor de la partícula
      if (p.level === 1) {
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * transform.k * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.2})`;
        ctx.fill();
      }
    });

    return requestAnimationFrame(frame);
  }

  return frame();
}
```

### Paso 4 — Estado del transform de D3

Necesitamos acceder al transform actual del zoom para que las partículas
sigan al canvas cuando el usuario hace zoom o pan.

Añadir junto a los otros refs al inicio del componente:

```javascript
const currentTransformRef = useRef({ x: 0, y: 0, k: 1 });
```

En el `useEffect` principal, dentro del handler de zoom, guardar el transform:

```javascript
const zoom = d3.zoom().on('zoom', (event) => {
  g.attr('transform', event.transform);
  // AÑADIR esta línea:
  currentTransformRef.current = event.transform;
});
```

### Paso 5 — Enganchar partículas al click en la estrella

Localizar el bloque del click en el nodo (línea ~288):

```javascript
.on('click', (event, d) => {
  event.stopPropagation();
  const person = persons.find((p) => p.id === d.id);
  if (person && onSelectPerson) {
    onSelectPerson(person);
  }
});
```

Sustituir por:

```javascript
.on('click', (event, d) => {
  event.stopPropagation();
  const person = persons.find((p) => p.id === d.id);
  if (person && onSelectPerson) {
    onSelectPerson(person);
  }

  // Cancelar animación anterior
  if (particleAnimRef.current) {
    cancelAnimationFrame(particleAnimRef.current);
    particleAnimRef.current = null;
  }

  // Obtener color de la familia del nodo seleccionado
  const family = families?.find((f) => f.id === d.family_id);
  const color = family ? `#${family.color_hex}` : '#a855f7';

  // Crear partículas
  activeParticlesRef.current = spawnParticles(d, nodes, links, color);

  // Arrancar loop de animación
  if (particleCanvasRef.current) {
    particleAnimRef.current = animateParticles(
      particleCanvasRef.current,
      activeParticlesRef,
      () => currentTransformRef.current
    );
  }
});
```

### Paso 6 — Limpiar partículas al clicar en vacío

Localizar el handler del click en el SVG vacío (línea ~122):

```javascript
svg.on('click', function (event) {
  if (event.target === this) {
    onSelectPerson(null);
  }
});
```

Sustituir por:

```javascript
svg.on('click', function (event) {
  if (event.target === this) {
    onSelectPerson(null);
    // Limpiar partículas
    if (particleAnimRef.current) {
      cancelAnimationFrame(particleAnimRef.current);
      particleAnimRef.current = null;
    }
    activeParticlesRef.current = [];
    if (particleCanvasRef.current) {
      const ctx = particleCanvasRef.current.getContext('2d');
      const r = particleCanvasRef.current.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
    }
  }
});
```

### Paso 7 — Limpiar al desmontar el componente

En el `return` de limpieza del `useEffect` principal:

```javascript
return () => {
  simulation.stop();
  // AÑADIR:
  if (particleAnimRef.current) {
    cancelAnimationFrame(particleAnimRef.current);
  }
  activeParticlesRef.current = [];
};
```

---

## Por qué usar canvas en vez de SVG para las partículas

Las partículas se actualizan 60 veces por segundo. Crear/destruir elementos
SVG a esa velocidad es muy lento y haría que la app fuera a trompicones.
Un canvas 2D con `clearRect` + `arc` es la forma estándar y eficiente de
animar partículas — el navegador lo maneja de forma nativa sin tocar el DOM.

---

## Resultado esperado

- Clic en Martín → partículas de color lila (Marín Iniesta) viajan
  hacia Chencho y Susana (nivel 1, brillantes y abundantes)
- Las partículas de Chencho y Susana continúan hacia los abuelos
  (nivel 2, más tenues)
- Y de ahí hacia bisabuelos (nivel 3, casi invisibles)
- Al cerrar el panel o clicar en vacío → partículas desaparecen

---

## Orden de implementación

```
1. Añadir particleCanvasRef, particleAnimRef, activeParticlesRef, currentTransformRef
2. Añadir <canvas> en el JSX (Paso 2)
3. Añadir las 3 funciones fuera del componente (Paso 3)
4. Actualizar el handler de zoom para guardar transform (Paso 4)
5. Sustituir el handler de click en estrella (Paso 5)
6. Sustituir el handler de click en vacío (Paso 6)
7. Añadir limpieza en el return del useEffect (Paso 7)
8. Redesplegar en Netlify
9. Probar: clicar en cualquier estrella y ver las partículas
```
