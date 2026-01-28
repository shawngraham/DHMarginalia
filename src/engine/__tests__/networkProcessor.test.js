import { describe, it, expect } from 'vitest';
import * as aq from 'arquero';
import { extractNetwork, computeCentrality, buildNetwork } from '../networkProcessor.js';

describe('Network Processor', () => {
  const sampleData = aq.from([
    { source: 'Alice', target: 'Bob' },
    { source: 'Bob', target: 'Charlie' },
    { source: 'Alice', target: 'Charlie' },
    { source: 'Charlie', target: 'Diana' },
    { source: 'Diana', target: 'Eve' },
  ]);

  describe('extractNetwork', () => {
    it('extracts correct number of unique nodes', () => {
      const { nodes } = extractNetwork(sampleData);
      expect(nodes.length).toBe(5); // Alice, Bob, Charlie, Diana, Eve
    });

    it('extracts correct number of edges', () => {
      const { edges } = extractNetwork(sampleData);
      expect(edges.length).toBe(5);
    });

    it('handles missing values gracefully', () => {
      const withMissing = aq.from([
        { source: 'Alice', target: 'Bob' },
        { source: null, target: 'Charlie' },
        { source: 'Diana', target: '' },
      ]);
      const { nodes, edges } = extractNetwork(withMissing);
      expect(nodes.length).toBe(2); // only Alice and Bob
      expect(edges.length).toBe(1);
    });
  });

  describe('computeCentrality', () => {
    it('computes betweenness centrality', () => {
      const { nodes, edges } = extractNetwork(sampleData);
      const { centrality } = computeCentrality(nodes, edges);
      expect(centrality).toBeDefined();
      expect(typeof centrality['Charlie']).toBe('number');
      // Charlie is the bridge node, should have highest centrality
      expect(centrality['Charlie']).toBeGreaterThan(centrality['Alice']);
    });

    it('handles self-loops without error', () => {
      const nodes = [{ id: 'A' }, { id: 'B' }];
      const edges = [{ source: 'A', target: 'A' }, { source: 'A', target: 'B' }];
      const { centrality } = computeCentrality(nodes, edges);
      expect(centrality).toBeDefined();
    });
  });

  describe('buildNetwork', () => {
    it('returns enriched nodes with centrality scores', () => {
      const result = buildNetwork(sampleData);
      expect(result.nodes.length).toBe(5);
      expect(result.nodes[0]).toHaveProperty('centrality');
      expect(result.edges.length).toBe(5);
    });
  });
});
