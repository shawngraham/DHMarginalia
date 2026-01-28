import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
import { buildNetwork } from '../engine/networkProcessor.js';

/**
 * Network Card — renders a force-directed graph using D3-Force + SVG.
 */
export function createNetworkCard(container, table, options = {}) {
  const {
    sourceCol = 'source',
    targetCol = 'target',
    title = 'Network',
    width = 600,
    height = 500,
  } = options;

  const { nodes, edges } = buildNetwork(table, sourceCol, targetCol);

  if (nodes.length === 0) {
    container.innerHTML = `<div class="card"><p class="card-title">${title}</p><p>No network data found.</p></div>`;
    return;
  }

  // Group tail: if > 15 nodes, scale visibility by centrality
  const maxCentrality = Math.max(...nodes.map(n => n.centrality), 0.001);
  const TOP_N = 15;
  const sortedByCentrality = [...nodes].sort((a, b) => b.centrality - a.centrality);
  const topNodeIds = new Set(sortedByCentrality.slice(0, TOP_N).map(n => n.id));

  // Prepare simulation data
  const simNodes = nodes.map(n => ({
    id: n.id,
    centrality: n.centrality,
    isTop: topNodeIds.has(n.id),
    x: width / 2 + (Math.random() - 0.5) * 100,
    y: height / 2 + (Math.random() - 0.5) * 100,
  }));

  const nodeMap = new Map(simNodes.map(n => [n.id, n]));
  const simLinks = edges.map(e => ({
    source: nodeMap.get(e.source),
    target: nodeMap.get(e.target),
  })).filter(l => l.source && l.target);

  // Run force simulation synchronously
  const simulation = forceSimulation(simNodes)
    .force('link', forceLink(simLinks).id(d => d.id).distance(60))
    .force('charge', forceManyBody().strength(-80))
    .force('center', forceCenter(width / 2, height / 2))
    .stop();

  for (let i = 0; i < 120; i++) simulation.tick();

  // Build SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Network graph with ${nodes.length} nodes and ${edges.length} edges`);

  let svgContent = `<text x="10" y="20" font-size="14" font-weight="bold" fill="var(--color-text)">${title}</text>`;

  // Edges
  for (const link of simLinks) {
    svgContent += `<line x1="${link.source.x}" y1="${link.source.y}" x2="${link.target.x}" y2="${link.target.y}" stroke="var(--color-border)" stroke-width="1" opacity="0.5"/>`;
  }

  // Nodes
  for (const node of simNodes) {
    const radius = 3 + (node.centrality / maxCentrality) * 12;
    const opacity = node.isTop ? 1 : 0.5;
    svgContent += `<circle cx="${node.x}" cy="${node.y}" r="${radius}" fill="var(--color-accent)" opacity="${opacity}">
      <title>${node.id} (centrality: ${node.centrality.toFixed(3)})</title>
    </circle>`;
    if (node.isTop) {
      svgContent += `<text x="${node.x + radius + 3}" y="${node.y + 4}" font-size="10" fill="var(--color-text)">${node.id}</text>`;
    }
  }

  svg.innerHTML = svgContent;

  const card = document.createElement('div');
  card.className = 'card';
  card.appendChild(svg);

  // Accessibility: hidden summary
  const summary = document.createElement('div');
  summary.className = 'sr-only';
  summary.setAttribute('aria-label', 'Network summary');
  summary.innerHTML = `<p>${nodes.length} people/entities, ${edges.length} connections. Top by centrality: ${
    sortedByCentrality.slice(0, 5).map(n => `${n.id} (${n.centrality.toFixed(3)})`).join(', ')
  }</p>`;
  card.appendChild(summary);

  container.innerHTML = '';
  container.appendChild(card);

  return { nodes: simNodes, edges: simLinks };
}
