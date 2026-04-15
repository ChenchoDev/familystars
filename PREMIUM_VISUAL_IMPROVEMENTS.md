# FamilyStars — Mejoras visuales premium

## Resumen de cambios

| Mejora | Archivo | Tipo |
|--------|---------|------|
| 1. Animación de entrada | Canvas.jsx | Añadir |
| 2. Tamaño por generación | Canvas.jsx | Modificar |
| 3. Halo especial fallecidos | Canvas.jsx | Añadir |
| 4. Línea dorada parejas | Canvas.jsx | Modificar |
| 5. Filtro por familia | Constellation.jsx + nuevo componente | Añadir |
| 6. Exportar como imagen | Canvas.jsx + Constellation.jsx | Añadir |
| 7. Búsqueda con vuelo mejorado | SearchBar.jsx + Canvas.jsx | Modificar |

---

## MEJORA 1 — Animación de entrada (efecto universo formándose)

**Archivo:** `apps/frontend/src/components/constellation/Canvas.jsx`

Las estrellas ahora aparecen de una en una con un fade-in escalonado,
como si el universo se estuviera formando desde la oscuridad.

### Cambio en los nodos (después de crear `const node = g.selectAll...`)

Localizar donde se crean los nodos y añadir animación de entrada:

```javascript
// DESPUÉS de la cadena .on('click', ...) de los nodos, añadir:
// Animación de entrada escalonada
node.attr('opacity', 0)
  .attr('r', 0)
  .transition()
  .delay((d, i) => i * 40)        // cada estrella aparece 40ms después de la anterior
  .duration(600)
  .ease(d3.easeCubicOut)
  .attr('opacity', 1)
  .attr('r', (d) => {
    const person = persons.find(p => p.id === d.id);
    return getStarRadius(person, persons, relationships);
  });

// Animación de entrada de halos
halos.attr('opacity', 0)
  .transition()
  .delay((d, i) => i * 40 + 300)
  .duration(400)
  .attr('opacity', 0.4);

// Animación de entrada de labels
labels.attr('opacity', 0)
  .transition()
  .delay((d, i) => i * 40 + 500)
  .duration(400)
  .attr('opacity', 0.8);
```

---

## MEJORA 2 — Tamaño por generación (mayores = más grandes)

**Archivo:** `apps/frontend/src/components/constellation/Canvas.jsx`

El tamaño de cada estrella refleja su generación: los bisabuelos son
las estrellas más grandes y brillantes, los nietos las más pequeñas.

### Paso 2a — Añadir función de cálculo de generación

Añadir FUERA del componente, junto a `getBFSLevels`:

```javascript
// Calcular la generación de cada persona (0 = la más antigua encontrada)
function getGenerationMap(allPersons, allRelationships) {
  const genMap = {};

  // Encontrar raíces (personas sin padres conocidos)
  const hasParent = new Set();
  allRelationships.forEach(rel => {
    const aId = rel.person_a?.id || rel.person_a_id;
    const bId = rel.person_b?.id || rel.person_b_id;
    if (rel.type === 'parent') hasParent.add(bId);
    if (rel.type === 'child') hasParent.add(aId);
  });

  const roots = allPersons.filter(p => !hasParent.has(p.id));
  roots.forEach(r => { genMap[r.id] = 0; });

  // BFS desde las raíces
  const queue = [...roots.map(r => r.id)];
  let iterations = 0;
  while (queue.length && iterations < 1000) {
    iterations++;
    const cur = queue.shift();
    const curGen = genMap[cur] ?? 0;
    allRelationships.forEach(rel => {
      const aId = rel.person_a?.id || rel.person_a_id;
      const bId = rel.person_b?.id || rel.person_b_id;
      if (rel.type === 'parent' && aId === cur && !(bId in genMap)) {
        genMap[bId] = curGen + 1;
        queue.push(bId);
      }
    });
  }
  return genMap;
}

// Radio de estrella según generación (mayores = más grandes)
function getStarRadius(person, allPersons, allRelationships) {
  if (!person) return 20;
  const genMap = getGenerationMap(allPersons, allRelationships);
  const gen = genMap[person.id] ?? 2;
  const maxGen = Math.max(...Object.values(genMap), 1);
  // Radio entre 14 (más joven) y 28 (más mayor)
  const ratio = 1 - (gen / (maxGen + 1));
  return Math.round(14 + ratio * 14);
}
```

### Paso 2b — Usar el radio dinámico en los nodos

Localizar donde se crea `const node = g.selectAll('circle.star-node')` y
cambiar `.attr('r', STAR_RADIUS)` por:

```javascript
.attr('r', (d) => {
  const person = persons.find(p => p.id === d.id);
  return getStarRadius(person, persons, relationships);
})
```

También actualizar el hover para que el radio de hover sea proporcional:

```javascript
// En mouseenter, cambiar STAR_RADIUS * 1.5 por:
const baseR = getStarRadius(persons.find(p => p.id === d.id), persons, relationships);
sel.transition().duration(200)
  .attr('r', baseR * 1.5)
  ...

// En mouseleave, cambiar STAR_RADIUS por:
sel.transition().duration(200)
  .attr('r', baseR)
  ...
```

También actualizar halos y glows para que sean proporcionales al radio:

```javascript
// halos: cambiar STAR_RADIUS * 1.12 por:
.attr('r', (d) => {
  const person = persons.find(p => p.id === d.id);
  return getStarRadius(person, persons, relationships) * 1.12;
})

// glows: cambiar STAR_RADIUS * 1.5 por:
.attr('r', (d) => {
  const person = persons.find(p => p.id === d.id);
  return getStarRadius(person, persons, relationships) * 1.5;
})
```

Y actualizar las imágenes de avatar y clipPaths para usar el radio correcto:

```javascript
// images: cambiar STAR_RADIUS * 2 y STAR_RADIUS por:
.attr('width', (d) => {
  const person = persons.find(p => p.id === d.id);
  const r = getStarRadius(person, persons, relationships);
  return r * 2;
})
.attr('height', (d) => {
  const person = persons.find(p => p.id === d.id);
  const r = getStarRadius(person, persons, relationships);
  return r * 2;
})
.attr('x', (d) => {
  const person = persons.find(p => p.id === d.id);
  return (d.x || 0) - getStarRadius(person, persons, relationships);
})
.attr('y', (d) => {
  const person = persons.find(p => p.id === d.id);
  return (d.y || 0) - getStarRadius(person, persons, relationships);
})
```

Y en el tick actualizar también:

```javascript
images
  .attr('x', (d) => {
    const person = persons.find(p => p.id === d.id);
    return d.x - getStarRadius(person, persons, relationships);
  })
  .attr('y', (d) => {
    const person = persons.find(p => p.id === d.id);
    return d.y - getStarRadius(person, persons, relationships);
  });
```

---

## MEJORA 3 — Halo especial para personas fallecidas

**Archivo:** `apps/frontend/src/components/constellation/Canvas.jsx`

Las estrellas de personas fallecidas tienen un halo azul-plateado
más tenue, como una estrella que se apaga. Respetuoso y bello.

### Paso 3a — Añadir campo `is_deceased` a los nodos

En la preparación de datos, actualizar el map de nodos:

```javascript
const nodes = persons.map((person) => ({
  id: person.id,
  name: `${person.first_name} ${person.last_name}`,
  family_id: person.family_id,
  avatar: person.avatar_url,
  is_deceased: !!person.death_date || !!person.is_deceased,  // AÑADIR
}));
```

### Paso 3b — Halo adicional para fallecidos

Después de crear los `halos` normales, añadir este bloque:

```javascript
// ── HALO ESPECIAL PARA FALLECIDOS ──
const deceasedNodes = nodes.filter(n => n.is_deceased);

// Halo azul exterior pulsante
const deceasedHalos = g
  .selectAll('.deceased-halo')
  .data(deceasedNodes, d => d.id)
  .enter()
  .append('circle')
  .attr('class', 'deceased-halo')
  .attr('r', (d) => {
    const person = persons.find(p => p.id === d.id);
    return getStarRadius(person, persons, relationships) * 1.8;
  })
  .attr('cx', d => d.x || 0)
  .attr('cy', d => d.y || 0)
  .attr('fill', 'none')
  .attr('stroke', '#93c5fd')           // azul claro
  .attr('stroke-width', 1.5)
  .attr('opacity', 0.35)
  .attr('stroke-dasharray', '3,4')     // línea punteada
  .attr('pointer-events', 'none');

// Animación de rotación del halo punteado
function animateDeceasedHalos() {
  let angle = 0;
  function rotate() {
    angle += 0.3;
    deceasedHalos.attr('transform', d => `rotate(${angle}, ${d.x}, ${d.y})`);
    requestAnimationFrame(rotate);
  }
  rotate();
}
if (deceasedNodes.length > 0) animateDeceasedHalos();

// Sobreescribir color del nodo fallecido a gris-azulado
node.filter(d => d.is_deceased)
  .attr('fill', '#64748b')             // gris azulado
  .attr('opacity', 0.7)
  .attr('filter', 'drop-shadow(0 0 4px rgba(147,197,253,0.4))');
```

Y actualizar el tick para mover los halos de fallecidos:

```javascript
// En simulation.on('tick'), añadir:
deceasedHalos.attr('cx', d => d.x).attr('cy', d => d.y);
```

---

## MEJORA 4 — Línea dorada para parejas con partículas

**Archivo:** `apps/frontend/src/components/constellation/Canvas.jsx`

Las líneas de pareja pasan de ser líneas discontinuas grises a ser
líneas doradas sólidas con partículas de luz viajando entre ellos.

### Paso 4a — Separar links de pareja del resto

Reemplazar la creación de `link` con dos selectores separados:

```javascript
// Links normales (no pareja)
const link = g
  .selectAll('line.normal-link')
  .data(links.filter(l => l.type !== 'partner'))
  .enter()
  .append('line')
  .attr('class', 'normal-link')
  .attr('stroke', (d) => {
    const sourcePerson = persons.find((p) => p.id === (d.source?.id || d.source));
    const family = families?.find((f) => f.id === sourcePerson?.family_id);
    return family ? `#${family.color_hex}` : '#666';
  })
  .attr('stroke-width', 1.5)
  .attr('opacity', 0.25)
  .attr('stroke-dasharray', 'none');

// Links de pareja — dorados y especiales
const partnerLinks = g
  .selectAll('line.partner-link')
  .data(links.filter(l => l.type === 'partner'))
  .enter()
  .append('line')
  .attr('class', 'partner-link')
  .attr('stroke', '#f59e0b')           // dorado
  .attr('stroke-width', 2.5)
  .attr('opacity', 0.6)
  .attr('stroke-dasharray', 'none')
  .attr('filter', 'drop-shadow(0 0 3px rgba(245,158,11,0.5))');
```

### Paso 4b — Actualizar tick para mover ambos tipos de links

```javascript
// En simulation.on('tick'):
// ANTES: link.attr('x1', ...) etc.
// DESPUÉS: actualizar ambos

link
  .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
  .attr('x2', d => d.target.x).attr('y2', d => d.target.y);

partnerLinks
  .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
  .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
```

### Paso 4c — Partículas doradas continuas entre parejas

Las partículas doradas entre parejas se añaden automáticamente al sistema
de partículas existente. Añadir este bloque después de arrancar la simulación:

```javascript
// ── PARTÍCULAS DORADAS ENTRE PAREJAS (siempre activas) ──
const partnerParticles = [];
links.filter(l => l.type === 'partner').forEach(link => {
  const srcNode = nodes.find(n => n.id === (link.source?.id || link.source));
  const tgtNode = nodes.find(n => n.id === (link.target?.id || link.target));
  if (!srcNode || !tgtNode) return;
  for (let i = 0; i < 3; i++) {
    partnerParticles.push({
      fromNode: srcNode, toNode: tgtNode,
      t: i / 3, speed: 0.003 + Math.random() * 0.002,
      color: '#f59e0b', size: 2, maxAlpha: 0.7, level: 0,
      reverse: i % 2 === 0,  // algunas van en dirección contraria
    });
  }
});

// Arrancar loop de partículas de pareja (independiente del canvas de partículas)
if (partnerParticles.length > 0 && particleCanvasRef.current) {
  const partnerRef = { current: partnerParticles };

  function animatePartnerParticles() {
    // Reutilizamos animateParticles pero con ref propio
    // Las partículas doradas se mezclan con el canvas existente
    partnerRef.current.forEach(p => {
      if (p.reverse) {
        p.t -= p.speed;
        if (p.t < -0.1) p.t = 1.1;
      } else {
        p.t += p.speed;
        if (p.t > 1.1) p.t = -0.1;
      }
    });
    requestAnimationFrame(animatePartnerParticles);
  }

  // Añadir las partículas de pareja al array global
  activeParticlesRef.current = [
    ...activeParticlesRef.current,
    ...partnerParticles,
  ];

  // Si no hay animación activa, arrancarla
  if (!particleAnimRef.current && particleCanvasRef.current) {
    particleAnimRef.current = animateParticles(
      particleCanvasRef.current,
      activeParticlesRef,
      () => currentTransformRef.current
    );
  }
}
```

---

## MEJORA 5 — Filtro por familia

**Archivo:** `apps/frontend/src/pages/Constellation.jsx`

Un selector en la UI que al elegir una familia atenúa todas las demás
y solo ilumina esa constelación.

### Paso 5a — Añadir estado en Constellation.jsx

```javascript
const [familyFilter, setFamilyFilter] = useState(null); // null = todas
```

### Paso 5b — Pasar el filtro al Canvas

```jsx
<ConstellationCanvas
  persons={persons}
  families={families}
  relationships={relationships}
  onSelectPerson={handleSelectPerson}
  personToAnimate={personToAnimate}
  familyFilter={familyFilter}   // AÑADIR
/>
```

### Paso 5c — Añadir selector de familia en la UI de Constellation.jsx

Dentro del overlay de la constelación, junto al SearchBar:

```jsx
{/* Filtro de familia */}
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
```

### Paso 5d — Recibir y aplicar el filtro en Canvas.jsx

Añadir `familyFilter` a los props:

```javascript
export default function ConstellationCanvas({
  persons, families, relationships,
  onSelectPerson, personToAnimate,
  familyFilter   // AÑADIR
}) {
```

Y añadir este `useEffect` que reacciona al cambio de filtro:

```javascript
// Efecto del filtro de familia
useEffect(() => {
  if (!svgRef.current) return;
  const svg = d3.select(svgRef.current);

  if (familyFilter === null) {
    // Restaurar todo
    svg.selectAll('circle.star-node').transition().duration(400).attr('opacity', 1);
    svg.selectAll('.star-label').transition().duration(400).attr('opacity', 0.8);
    svg.selectAll('.star-halo').transition().duration(400).attr('opacity', 0.4);
    svg.selectAll('.star-glow').transition().duration(400).attr('opacity', 0.15);
    svg.selectAll('line').transition().duration(400).attr('opacity', d =>
      d.type === 'partner' ? 0.6 : 0.25
    );
    svg.selectAll('.constellation-label').transition().duration(400)
      .attr('opacity', window.innerWidth < 640 ? 0.25 : 0.12);
  } else {
    // Atenuar lo que no es de la familia seleccionada
    svg.selectAll('circle.star-node').transition().duration(400)
      .attr('opacity', d => d.family_id === familyFilter ? 1 : 0.06);
    svg.selectAll('.star-label').transition().duration(400)
      .attr('opacity', d => d.family_id === familyFilter ? 0.9 : 0.05);
    svg.selectAll('.star-halo').transition().duration(400)
      .attr('opacity', d => d.family_id === familyFilter ? 0.6 : 0.03);
    svg.selectAll('.star-glow').transition().duration(400)
      .attr('opacity', d => d.family_id === familyFilter ? 0.3 : 0.02);
    svg.selectAll('.constellation-label').transition().duration(400)
      .attr('opacity', d => d.id === familyFilter ? 0.35 : 0.02);
  }
}, [familyFilter]);
```

---

## MEJORA 6 — Exportar constelación como imagen

**Archivo:** `apps/frontend/src/pages/Constellation.jsx`

Un botón que descarga la constelación actual como PNG.

### Paso 6a — Añadir ref al SVG y pasarlo desde Constellation

En `Canvas.jsx` el SVG ya tiene `svgRef`. Hay que exponerlo.
Añadir `useImperativeHandle` para exportar el método desde fuera:

```javascript
// Al inicio del componente Canvas, añadir:
import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

// Cambiar export default function por:
const ConstellationCanvas = forwardRef(function ConstellationCanvas(
  { persons, families, relationships, onSelectPerson, personToAnimate, familyFilter },
  ref
) {
  // ... todo el código igual ...

  // Antes del return, añadir:
  useImperativeHandle(ref, () => ({
    exportAsImage: () => {
      const svg = svgRef.current;
      if (!svg) return;

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svg);
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // Convertir SVG a PNG via canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = svg.clientWidth * 2;   // x2 para alta resolución
        canvas.height = svg.clientHeight * 2;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#080C18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const link = document.createElement('a');
        link.download = 'FamilyStars_Constelacion.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      };
      img.src = url;
    }
  }));

  return ( ... ); // igual que antes
});

export default ConstellationCanvas;
```

### Paso 6b — Botón de exportar en Constellation.jsx

```javascript
// Añadir ref al canvas
const canvasRef = useRef(null);

// En el JSX del Canvas:
<ConstellationCanvas
  ref={canvasRef}
  // ... resto de props ...
/>

// Botón de exportar (junto al filtro de familia):
<button
  onClick={() => canvasRef.current?.exportAsImage()}
  title="Descargar constelación como imagen"
  style={{
    padding: '8px 12px', borderRadius: '12px',
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
```

---

## MEJORA 7 — Búsqueda con vuelo de cámara mejorado

**Archivo:** `apps/frontend/src/components/search/SearchBar.jsx`

Al seleccionar una persona en el buscador, además de abrir su perfil,
la cámara vuela suavemente hasta su estrella con un zoom más dramático
y la estrella pulsa brevemente para destacarse.

### Cambio en SearchBar.jsx

La búsqueda ya llama a `onSelectPerson` que dispara `personToAnimate`
en `Canvas.jsx`. Solo hay que mejorar la animación en Canvas.

### Cambio en Canvas.jsx — useEffect de animación

Localizar el `useEffect` que reacciona a `personToAnimate` y reemplazarlo:

```javascript
useEffect(() => {
  if (!personToAnimate || !svgZoomRef.current || !svgRef.current) return;

  const targetNode = nodesRef.current.find(n => n.id === personToAnimate.id);
  if (!targetNode || targetNode.x === undefined) return;

  const svg = d3.select(svgRef.current);

  // Fase 1: zoom out rápido (efecto de perspectiva)
  const currentTransform = currentTransformRef.current;
  const zoomOut = d3.zoomIdentity
    .translate(currentTransform.x, currentTransform.y)
    .scale(Math.max(0.4, currentTransform.k * 0.6));

  svg.transition()
    .duration(300)
    .ease(d3.easeQuadIn)
    .call(svgZoomRef.current.transform, zoomOut)
    .on('end', () => {
      // Fase 2: volar hasta la estrella con zoom 2.2x
      const k = 2.2;
      const newTransform = d3.zoomIdentity
        .translate(dimensions.width / 2, dimensions.height / 2)
        .scale(k)
        .translate(-targetNode.x, -targetNode.y);

      svg.transition()
        .duration(900)
        .ease(d3.easeCubicInOut)
        .call(svgZoomRef.current.transform, newTransform)
        .on('end', () => {
          // Fase 3: pulso de la estrella al llegar
          svg.selectAll('circle.star-node')
            .filter(d => d.id === personToAnimate.id)
            .transition().duration(200)
            .attr('r', d => {
              const person = persons.find(p => p.id === d.id);
              return getStarRadius(person, persons, relationships) * 2.2;
            })
            .attr('filter', 'drop-shadow(0 0 16px rgba(255,255,255,1))')
            .transition().duration(400)
            .attr('r', d => {
              const person = persons.find(p => p.id === d.id);
              return getStarRadius(person, persons, relationships);
            })
            .attr('filter', 'drop-shadow(0 0 3px rgba(255,255,255,0.5))');
        });
    });
}, [personToAnimate, dimensions]);
```

---

## Orden de implementación recomendado

```
1. Mejora 2 (tamaño por generación) — base para las demás
2. Mejora 3 (fallecidos) — independiente, fácil
3. Mejora 4 (línea dorada parejas) — modificar links existentes
4. Mejora 1 (animación entrada) — enganchar al final
5. Mejora 7 (vuelo de cámara) — mejorar useEffect existente
6. Mejora 5 (filtro familia) — añadir en Constellation.jsx
7. Mejora 6 (exportar imagen) — requiere forwardRef al final
```

## Notas importantes

- La mejora 6 requiere cambiar `export default function` por `forwardRef`.
  Es el único cambio de estructura — el resto son adiciones.
- La mejora 2 hace que `STAR_RADIUS` deje de usarse directamente —
  se puede mantener como fallback pero `getStarRadius()` lo reemplaza.
- Las mejoras 3 y 4 son aditivas — no modifican código existente,
  solo añaden nuevos elementos al SVG.
- Las partículas doradas de pareja (mejora 4c) son opcionales —
  si hay problemas de rendimiento se pueden omitir sin afectar al resto.
