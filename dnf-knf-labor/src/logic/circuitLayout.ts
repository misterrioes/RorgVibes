import type { CircuitGraph, LayoutNode } from '../types';

export interface CircuitLayout { nodes: LayoutNode[]; width: number; height: number }

export function layoutCircuit(graph: CircuitGraph): CircuitLayout {
  const byId = new Map(graph.nodes.map(n => [n.id, n])); const depths = new Map<string, number>();
  const depth = (id: string): number => {
    if (depths.has(id)) return depths.get(id)!;
    const node = byId.get(id)!; const value = node.type === 'INPUT' || node.type === 'CONST' ? 0 : 1 + Math.max(...node.inputs.map(depth));
    depths.set(id, value); return value;
  };
  graph.nodes.forEach(n => depth(n.id));
  const maxLayer = Math.max(...depths.values()); const layers = new Map<number, typeof graph.nodes>();
  graph.nodes.forEach(n => { const d = depths.get(n.id)!; layers.set(d, [...(layers.get(d) ?? []), n]); });
  const maxCount = Math.max(...[...layers.values()].map(v => v.length));
  const width = Math.max(780, 180 + maxLayer * 190); const height = Math.max(360, 110 + maxCount * 120);
  const nodes: LayoutNode[] = graph.nodes.map(node => {
    const layer = depths.get(node.id)!; const siblings = layers.get(layer)!; const index = siblings.findIndex(n => n.id === node.id);
    const spacing = height / (siblings.length + 1); const small = node.type === 'INPUT' || node.type === 'OUTPUT' || node.type === 'CONST';
    return { ...node, layer, x: 60 + layer * ((width - 140) / Math.max(1, maxLayer)), y: spacing * (index + 1), width: small ? 58 : 82, height: small ? 44 : 64 };
  });
  return { nodes, width, height };
}
