import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const STAR_RADIUS = 20;

export default function ConstellationCanvas({ persons, families, relationships, onSelectPerson, personToAnimate }) {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 1400, height: 800 });
  const svgZoomRef = useRef(null);
  const nodesRef = useRef([]);

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

  // Animate to selected person
  useEffect(() => {
    if (!personToAnimate || !svgZoomRef.current || !svgRef.current) return;

    // Find the target node with current position
    const targetNode = nodesRef.current.find((n) => n.id === personToAnimate.id);
    if (!targetNode || targetNode.x === undefined || targetNode.y === undefined) return;

    const svg = d3.select(svgRef.current);
    const x = targetNode.x;
    const y = targetNode.y;

    // Calculate zoom level (1.8x to focus nicely on the star)
    const k = 1.8;

    // Create new transform to center on node
    const newTransform = d3.zoomIdentity
      .translate(dimensions.width / 2, dimensions.height / 2)
      .scale(k)
      .translate(-x, -y);

    // Animate the transition
    svg
      .transition()
      .duration(800) // 800ms smooth animation
      .ease(d3.easeCubicInOut)
      .call(svgZoomRef.current.transform, newTransform);
  }, [personToAnimate, dimensions]);

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
    });
    svg.call(zoom);
    svgZoomRef.current = zoom;

    // Close panel on empty canvas click
    svg.on('click', function (event) {
      if (event.target === this) {
        onSelectPerson(null);
      }
    });

    // Draw links with family colors
    const link = g
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        const sourcePerson = persons.find((p) => p.id === d.source.id);
        const family = families?.find((f) => f.id === sourcePerson?.family_id);
        return family ? `#${family.color_hex}` : '#666';
      })
      .attr('stroke-width', 2)
      .attr('opacity', 0.3)
      .attr('stroke-dasharray', (d) => (d.type === 'partner' ? '5,5' : 'none'));

    // ── CLIP PATHS para avatares (en svg raíz, no en g) ──
    const defs = svg.select('defs').empty()
      ? svg.insert('defs', ':first-child')
      : svg.select('defs');

    nodes.forEach((n) => {
      const person = persons.find((p) => p.id === n.id);
      if (person?.avatar) {
        defs.append('clipPath')
          .attr('id', `clip-${n.id}`)
          .append('circle')
          .attr('r', STAR_RADIUS)
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
      .attr('r', STAR_RADIUS * 1.12)
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
      .attr('r', STAR_RADIUS * 1.5)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('fill', (d) => {
        const family = families?.find((f) => f.id === d.family_id);
        return family ? `#${family.color_hex}` : '#9B59B6';
      })
      .attr('opacity', 0.15)
      .attr('filter', 'blur(4px)')
      .attr('pointer-events', 'none');

    // Then draw the actual stars
    const node = g
      .selectAll('circle.star-node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'star-node')
      .attr('r', STAR_RADIUS)
      .attr('fill', (d) => {
        const family = families?.find((f) => f.id === d.family_id);
        return family ? `#${family.color_hex}` : '#9B59B6';
      })
      .attr('opacity', 1)
      .attr('filter', 'drop-shadow(0 0 3px rgba(255,255,255,0.5))')
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
        sel.transition().duration(200)
          .attr('r', STAR_RADIUS * 1.5)
          .attr('opacity', 1)
          .attr('filter', 'drop-shadow(0 0 8px rgba(255,255,255,0.9))');
        // Highlight the glow
        g.selectAll('.star-glow').filter((node) => node.id === d.id)
          .transition().duration(200)
          .attr('opacity', 0.4)
          .attr('r', STAR_RADIUS * 2.5);

        // Find related persons
        const relatedIds = new Set([d.id]);
        links.forEach((link) => {
          if (link.source.id === d.id) relatedIds.add(link.target.id);
          if (link.target.id === d.id) relatedIds.add(link.source.id);
        });

        // Dim unrelated stars
        node.transition().duration(200)
          .attr('opacity', (n) => (relatedIds.has(n.id) ? 1 : 0.18));
      })
      .on('mouseleave', function (event, d) {
        const sel = d3.select(this);
        sel.transition().duration(200)
          .attr('r', STAR_RADIUS)
          .attr('opacity', 1)
          .attr('filter', 'drop-shadow(0 0 3px rgba(255,255,255,0.5))');
        // Reset glow
        g.selectAll('.star-glow').filter((node) => node.id === d.id)
          .transition().duration(200)
          .attr('opacity', 0.15)
          .attr('r', STAR_RADIUS * 1.5);

        // Restore all stars opacity
        node.transition().duration(200).attr('opacity', 1);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        const person = persons.find((p) => p.id === d.id);
        if (person && onSelectPerson) {
          onSelectPerson(person);
        }
      });

    // ── AVATAR IMAGES (después de círculos, antes de labels) ──
    const nodesWithAvatar = nodes.filter((n) => {
      const person = persons.find((p) => p.id === n.id);
      return !!person?.avatar;
    });

    const images = g
      .selectAll('image.star-avatar')
      .data(nodesWithAvatar, (d) => d.id)
      .enter()
      .append('image')
      .attr('class', 'star-avatar')
      .attr('href', (d) => {
        const person = persons.find((p) => p.id === d.id);
        return person?.avatar || '';
      })
      .attr('width', STAR_RADIUS * 2)
      .attr('height', STAR_RADIUS * 2)
      .attr('x', (d) => (d.x || 0) - STAR_RADIUS)
      .attr('y', (d) => (d.y || 0) - STAR_RADIUS)
      .attr('clip-path', (d) => `url(#clip-${d.id})`)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .style('cursor', 'pointer')
      .style('pointer-events', 'all')
      .on('click', (event, d) => {
        event.stopPropagation();
        const person = persons.find((p) => p.id === d.id);
        if (person && onSelectPerson) onSelectPerson(person);
      });

    // Draw name labels under stars
    const labels = g
      .selectAll('.star-label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'star-label')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y + STAR_RADIUS + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#fff')
      .attr('opacity', 0.8)
      .attr('pointer-events', 'none')
      .text((d) => d.name);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      glows.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      halos.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      images
        .attr('x', (d) => d.x - STAR_RADIUS)
        .attr('y', (d) => d.y - STAR_RADIUS);

      // Actualizar posición de clipPaths
      nodes.forEach((n) => {
        const person = persons.find((p) => p.id === n.id);
        if (person?.avatar) {
          defs.select(`#clip-${n.id} circle`)
            .attr('cx', n.x || 0)
            .attr('cy', n.y || 0);
        }
      });

      labels.attr('x', (d) => d.x).attr('y', (d) => d.y + STAR_RADIUS + 20);

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
    };
  }, [persons, families, relationships, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        ref={svgRef}
        className="constellation-canvas w-full h-full"
        style={{ cursor: 'grab', display: 'block' }}
      />
    </div>
  );
}
