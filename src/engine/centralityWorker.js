/**
 * Web Worker for computing network centrality in a background thread.
 * Prevents UI freezing on large networks.
 *
 * Usage from main thread:
 *   const worker = new Worker(new URL('./centralityWorker.js', import.meta.url), { type: 'module' });
 *   worker.postMessage({ nodes, edges });
 *   worker.onmessage = (e) => { const { centrality } = e.data; };
 */
import Graph from 'graphology';
import { betweenness } from 'graphology-metrics/centrality/index.js';

self.onmessage = function (event) {
  const { nodes, edges } = event.data;

  try {
    const graph = new Graph({ type: 'undirected', multi: false });

    for (const node of nodes) {
      if (!graph.hasNode(node.id)) {
        graph.addNode(node.id);
      }
    }

    for (const edge of edges) {
      if (edge.source === edge.target) continue;
      if (!graph.hasEdge(edge.source, edge.target)) {
        graph.addEdge(edge.source, edge.target);
      }
    }

    const centrality = betweenness(graph);
    self.postMessage({ centrality, nodeCount: nodes.length, edgeCount: edges.length });
  } catch (err) {
    self.postMessage({ error: err.message });
  }
};
