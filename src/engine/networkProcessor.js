import Graph from 'graphology';
import { betweenness } from 'graphology-metrics/centrality/index.js';

/**
 * Extracts unique nodes and edges from an Arquero table with source/target columns.
 * Returns { nodes: [{id, ...}], edges: [{source, target, ...}] }
 */
export function extractNetwork(table, sourceCol = 'source', targetCol = 'target') {
  const nodeSet = new Set();
  const edges = [];

  const sources = table.array(sourceCol);
  const targets = table.array(targetCol);

  for (let i = 0; i < sources.length; i++) {
    const s = String(sources[i] ?? '').trim();
    const t = String(targets[i] ?? '').trim();
    if (!s || !t) continue;

    nodeSet.add(s);
    nodeSet.add(t);
    edges.push({ source: s, target: t });
  }

  const nodes = Array.from(nodeSet).map(id => ({ id }));
  return { nodes, edges };
}

/**
 * Builds a Graphology graph and computes betweenness centrality.
 * Returns a Map of nodeId -> centrality score.
 */
export function computeCentrality(nodes, edges) {
  const graph = new Graph({ type: 'undirected', multi: false });

  for (const node of nodes) {
    if (!graph.hasNode(node.id)) {
      graph.addNode(node.id);
    }
  }

  for (const edge of edges) {
    // Skip self-loops
    if (edge.source === edge.target) continue;
    if (!graph.hasEdge(edge.source, edge.target)) {
      graph.addEdge(edge.source, edge.target);
    }
  }

  const centrality = betweenness(graph);
  return { graph, centrality };
}

/**
 * Full pipeline: table -> network with centrality scores.
 */
export function buildNetwork(table, sourceCol = 'source', targetCol = 'target') {
  const { nodes, edges } = extractNetwork(table, sourceCol, targetCol);
  const { graph, centrality } = computeCentrality(nodes, edges);

  const enrichedNodes = nodes.map(n => ({
    ...n,
    centrality: centrality[n.id] || 0,
  }));

  return { nodes: enrichedNodes, edges, graph };
}
