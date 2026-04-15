import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as d3 from 'd3';

const STAR_RADIUS = 20;

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
        t: -(i / count) * 0.8,
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

    const transform = getCurrentTransform();

    particlesRef.current.forEach(p => {
      p.t += p.speed;
      if (p.t > 1.1) p.t = -Math.random() * 0.3;

      const t = Math.max(0, Math.min(1, p.t));

      const wx = p.fromNode.x + (p.toNode.x - p.fromNode.x) * t;
      const wy = p.fromNode.y + (p.toNode.y - p.fromNode.y) * t;

      const sx = transform.x + wx * transform.k;
      const sy = transform.y + wy * transform.k;

      const alpha = Math.sin(t * Math.PI) * p.maxAlpha;
      if (alpha <= 0) return;

      const hex = p.color.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      ctx.beginPath();
      ctx.arc(sx, sy, p.size * transform.k, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();

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

// MEJORA 6: Cambiar export default function por forwardRef
const ConstellationCanvas = forwardRef(function ConstellationCanvas(
  { persons, families, relationships, onSelectPerson, personToAnimate, familyFilter },
  ref
) {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 1400, height: 800 });
  const svgZoomRef = useRef(null);
  const nodesRef = useRef([]);
  const particleCanvasRef = useRef(null);
  const particleAnimRef = useRef(null);
  const activeParticlesRef = useRef([]);
  const currentTransformRef = useRef({ x: 0, y: 0, k: 1 });

  // Get container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 1400,
          height: containerRef.current.clientHeight || 800,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // MEJORA 7: Animate to selected person with improved camera flight
  useEffect(() => {
    if (!personToAnimate || !svgZoomRef.current || !svgRef.current) return;

    // Find the target node with current position
    const targetNode = nodesRef.current.find((n) => n.id === personToAnimate.id);
    if (!targetNode || targetNode.x === undefined || targetNode.y === undefined) return;

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
            const person = persons.find(p => p.id === personToAnimate.id);
            const baseR = getStarRadius(person, persons, relationships);
            svg.selectAll('circle.star-node')
              .filter(d => d.id === personToAnimate.id)
              .transition().duration(200)
              .attr('r', baseR * 2.2)
              .attr('filter', 'drop-shadow(0 0 16px rgba(255,255,255,1))')
              .transition().duration(400)
              .attr('r', baseR)
              .attr('filter', 'drop-shadow(0 0 3px rgba(255,255,255,0.5))');
          });
      });
  }, [personToAnimate, dimensions, persons, relationships]);

  useEffect(() => {
    if (!svgRef.current || !persons?.length) return;

    const CANVAS_WIDTH = dimensions.width;
    const CANVAS_HEIGHT = dimensions.height;

    // Prepare data
    const nodes = persons.map((person) => ({
      id: person.id,
      name: `${person.first_name} ${person.last_name}`,
      family_id: person.family_id,
      avatar: person.avatar_url,
      is_deceased: !!person.death_date || !!person.is_deceased,  // MEJORA 3: campo de fallecido
    }));

    const links = relationships
      ?.filter((rel) => {
        const personIds = nodes.map((n) => n.id);
        // Backend returns { person_a: { id: ... }, person_b: { id: ... } }
        const aId = rel.person_a?.id || rel.person_a_id;
        const bId = rel.person_b?.id || rel.person_b_id;
        return personIds.includes(aId) && personIds.includes(bId);
      })
      .map((rel) => ({
        source: rel.person_a?.id || rel.person_a_id,
        target: rel.person_b?.id || rel.person_b_id,
        type: rel.type,
      })) || [];

    // Create simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(150)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2))
      .force('collide', d3.forceCollide().radius((STAR_RADIUS * 2) / 2));

    // Store nodes reference for animation
    nodesRef.current = nodes;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', CANVAS_WIDTH)
      .attr('height', CANVAS_HEIGHT)
      .style('background-color', '#080C18');

    // Clear previous content
    svg.selectAll('*').remove();

    // Add zoom behavior
    const g = svg.append('g');
    const zoom = d3.zoom().on('zoom', (event) => {
      g.attr('transform', event.transform);
      currentTransformRef.current = event.transform;
    });
    svg.call(zoom);
    svgZoomRef.current = zoom;

    // Close panel on empty canvas click
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

    // MEJORA 4: Links normales (no pareja)
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

    // MEJORA 4: Links de pareja — dorados y especiales
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

    // ── CLIP PATHS para avatares (en svg raíz, no en g) ──
    const defs = svg.select('defs').empty()
      ? svg.insert('defs', ':first-child')
      : svg.select('defs');

    nodes.forEach((n) => {
      const person = persons.find((p) => p.id === n.id);
      if (person?.avatar_url) {
        const r = getStarRadius(person, persons, relationships);
        defs.append('clipPath')
          .attr('id', `clip-${n.id}`)
          .append('circle')
          .attr('r', r)
          .attr('cx', n.x || 0)
          .attr('cy', n.y || 0);
      }
    });

    // Prepare constellation labels with father's surname
    const constellationLabels = g.selectAll('.constellation-label').data(families || []).enter().append('text')
      .attr('class', 'constellation-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', (d) => window.innerWidth < 640 ? '48px' : '64px')
      .attr('font-weight', '100')
      .attr('letter-spacing', '8px')
      .attr('fill', (d) => `#${d.color_hex}`)
      .attr('opacity', (d) => window.innerWidth < 640 ? 0.25 : 0.12)
      .attr('pointer-events', 'none')
      .style('font-family', 'Segoe UI, sans-serif')
      .style('text-shadow', 'none')
      // Position at centroid of family nodes
      .attr('x', (family) => {
        const familyNodes = nodes.filter((n) => n.family_id === family.id);
        return familyNodes.length > 0
          ? familyNodes.reduce((sum, n) => sum + (n.x || CANVAS_WIDTH / 2), 0) / familyNodes.length
          : CANVAS_WIDTH / 2;
      })
      .attr('y', (family) => {
        const familyNodes = nodes.filter((n) => n.family_id === family.id);
        return familyNodes.length > 0
          ? familyNodes.reduce((sum, n) => sum + (n.y || CANVAS_HEIGHT / 2), 0) / familyNodes.length
          : CANVAS_HEIGHT / 2;
      })
      // Use display_name from family, fallback to name
      .text((family) => {
        return (family.display_name || family.name).toUpperCase();
      });

    // Draw pulsing halo effect for each star
    const halos = g
      .selectAll('.star-halo')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'star-halo')
      .attr('r', (d) => {
        const person = persons.find(p => p.id === d.id);
        return getStarRadius(person, persons, relationships) * 1.12;
      })
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        const family = families?.find((f) => f.id === d.family_id);
        return family ? `#${family.color_hex}` : '#9B59B6';
      })
      .attr('stroke-width', 1)
      .attr('opacity', 0.4)
      .attr('pointer-events', 'none');

    // Draw glow/shadow for each star
    const glows = g
      .selectAll('.star-glow')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'star-glow')
      .attr('r', (d) => {
        const person = persons.find(p => p.id === d.id);
        return getStarRadius(person, persons, relationships) * 1.5;
      })
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('fill', (d) => {
        const family = families?.find((f) => f.id === d.family_id);
        return family ? `#${family.color_hex}` : '#9B59B6';
      })
      .attr('opacity', 0.15)
      .attr('filter', 'blur(4px)')
      .attr('pointer-events', 'none');

    // ── MEJORA 3: HALO ESPECIAL PARA FALLECIDOS ──
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

    // Then draw the actual stars
    const node = g
      .selectAll('circle.star-node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'star-node')
      .attr('r', (d) => {
        const person = persons.find(p => p.id === d.id);
        return getStarRadius(person, persons, relationships);
      })
      .attr('fill', (d) => {
        if (d.is_deceased) return '#64748b';  // MEJORA 3: gris azulado para fallecidos
        const family = families?.find((f) => f.id === d.family_id);
        return family ? `#${family.color_hex}` : '#9B59B6';
      })
      .attr('opacity', (d) => d.is_deceased ? 0.7 : 1)  // MEJORA 3
      .attr('filter', (d) => d.is_deceased ? 'drop-shadow(0 0 4px rgba(147,197,253,0.4))' : 'drop-shadow(0 0 3px rgba(255,255,255,0.5))')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      )
      .on('mouseenter', function (event, d) {
        const sel = d3.select(this);
        const baseR = getStarRadius(persons.find(p => p.id === d.id), persons, relationships);
        sel.transition().duration(200)
          .attr('r', baseR * 1.5)
          .attr('opacity', 1)
          .attr('filter', 'drop-shadow(0 0 8px rgba(255,255,255,0.9))');
        // Highlight the glow
        g.selectAll('.star-glow').filter((node) => node.id === d.id)
          .transition().duration(200)
          .attr('opacity', 0.4)
          .attr('r', baseR * 2.5);

        // Find related persons
        const relatedIds = new Set([d.id]);
        links.forEach((link) => {
          const srcId = link.source?.id || link.source;
          const tgtId = link.target?.id || link.target;
          if (srcId === d.id) relatedIds.add(tgtId);
          if (tgtId === d.id) relatedIds.add(srcId);
        });

        // Dim unrelated stars
        node.transition().duration(200)
          .attr('opacity', (n) => (relatedIds.has(n.id) ? 1 : 0.18));
      })
      .on('mouseleave', function (event, d) {
        const sel = d3.select(this);
        const baseR = getStarRadius(persons.find(p => p.id === d.id), persons, relationships);
        sel.transition().duration(200)
          .attr('r', baseR)
          .attr('opacity', d.is_deceased ? 0.7 : 1)
          .attr('filter', d.is_deceased ? 'drop-shadow(0 0 4px rgba(147,197,253,0.4))' : 'drop-shadow(0 0 3px rgba(255,255,255,0.5))');
        // Reset glow
        g.selectAll('.star-glow').filter((node) => node.id === d.id)
          .transition().duration(200)
          .attr('opacity', 0.15)
          .attr('r', baseR * 1.5);

        // Restore all stars opacity
        node.transition().duration(200).attr('opacity', (n) => n.is_deceased ? 0.7 : 1);
      })
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

        // En móvil, limpiar partículas automáticamente tras 2.5 segundos
        if (window.innerWidth < 768) {
          setTimeout(() => {
            if (particleAnimRef.current) {
              cancelAnimationFrame(particleAnimRef.current);
              particleAnimRef.current = null;
            }
            activeParticlesRef.current = [];
            if (particleCanvasRef.current) {
              const ctx = particleCanvasRef.current.getContext('2d');
              particleCanvasRef.current.width = particleCanvasRef.current.width;
              ctx.clearRect(0, 0, particleCanvasRef.current.width, particleCanvasRef.current.height);
            }
          }, 2500);
        }
      });

    // ── AVATAR IMAGES (después de círculos, antes de labels) ──
    const nodesWithAvatar = nodes.filter((n) => {
      const person = persons.find((p) => p.id === n.id);
      return !!person?.avatar_url;
    });

    const images = g
      .selectAll('image.star-avatar')
      .data(nodesWithAvatar, (d) => d.id)
      .enter()
      .append('image')
      .attr('class', 'star-avatar')
      .attr('href', (d) => {
        const person = persons.find((p) => p.id === d.id);
        return person?.avatar_url || '';
      })
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
      .attr('clip-path', (d) => `url(#clip-${d.id})`)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .style('cursor', 'pointer')
      .style('pointer-events', 'none');

    // Draw name labels under stars
    const labels = g
      .selectAll('.star-label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'star-label')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y + 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#fff')
      .attr('opacity', 0.8)
      .attr('pointer-events', 'none')
      .text((d) => d.name);

    // ── MEJORA 1: Animación de entrada escalonada ──
    node.attr('opacity', 0)
      .attr('r', 0)
      .transition()
      .delay((d, i) => i * 40)
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr('opacity', (d) => d.is_deceased ? 0.7 : 1)
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

    // Update positions on simulation tick
    simulation.on('tick', () => {
      // MEJORA 4: Actualizar ambos tipos de links
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);

      partnerLinks
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      glows.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      halos.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      // MEJORA 3: Mover halos de fallecidos
      deceasedHalos.attr('cx', d => d.x).attr('cy', d => d.y);

      images
        .attr('x', (d) => {
          const person = persons.find(p => p.id === d.id);
          return d.x - getStarRadius(person, persons, relationships);
        })
        .attr('y', (d) => {
          const person = persons.find(p => p.id === d.id);
          return d.y - getStarRadius(person, persons, relationships);
        });

      // Actualizar posición de clipPaths
      nodes.forEach((n) => {
        const person = persons.find((p) => p.id === n.id);
        if (person?.avatar_url) {
          defs.select(`#clip-${n.id} circle`)
            .attr('cx', n.x || 0)
            .attr('cy', n.y || 0);
        }
      });

      labels.attr('x', (d) => d.x).attr('y', (d) => d.y + getStarRadius(persons.find(p => p.id === d.id), persons, relationships) + 20);

      // Update constellation labels positions dynamically
      constellationLabels.each(function (family) {
        const familyPersons = nodes.filter((p) => p.family_id === family.id);
        if (familyPersons.length > 0) {
          const avgX = familyPersons.reduce((sum, p) => sum + p.x, 0) / familyPersons.length;
          const avgY = familyPersons.reduce((sum, p) => sum + p.y, 0) / familyPersons.length;
          d3.select(this).attr('x', avgX).attr('y', avgY);
        }
      });
    });

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

    // Drag handlers
    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
      if (particleAnimRef.current) {
        cancelAnimationFrame(particleAnimRef.current);
      }
      activeParticlesRef.current = [];
    };
  }, [persons, families, relationships, dimensions]);

  // MEJORA 5: Efecto del filtro de familia
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    if (familyFilter === null) {
      // Restaurar todo
      svg.selectAll('circle.star-node').transition().duration(400).attr('opacity', d => d.is_deceased ? 0.7 : 1);
      svg.selectAll('.star-label').transition().duration(400).attr('opacity', 0.8);
      svg.selectAll('.star-halo').transition().duration(400).attr('opacity', 0.4);
      svg.selectAll('.star-glow').transition().duration(400).attr('opacity', 0.15);
      svg.selectAll('line').transition().duration(400).attr('opacity', d => {
        if (d.type === 'partner') return 0.6;
        return 0.25;
      });
      svg.selectAll('.constellation-label').transition().duration(400)
        .attr('opacity', window.innerWidth < 640 ? 0.25 : 0.12);
    } else {
      // Atenuar lo que no es de la familia seleccionada
      svg.selectAll('circle.star-node').transition().duration(400)
        .attr('opacity', d => d.family_id === familyFilter ? (d.is_deceased ? 0.7 : 1) : 0.06);
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

  // MEJORA 6: Exponer método exportAsImage via useImperativeHandle
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
});

export default ConstellationCanvas;
