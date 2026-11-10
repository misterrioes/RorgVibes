import type { AstNode, Bit } from '../types';

export function evaluate(node: AstNode, values: Record<string, Bit>): Bit {
  if (node.type === 'variable') return values[node.name] ?? 0;
  if (node.type === 'constant') return node.value;
  if (node.type === 'not') return (1 - evaluate(node.operand, values)) as Bit;
  const a = evaluate(node.left, values); const b = evaluate(node.right, values);
  if (node.operator === 'AND') return (a & b) as Bit;
  if (node.operator === 'OR') return (a | b) as Bit;
  if (node.operator === 'XOR') return (a ^ b) as Bit;
  return (1 - (a ^ b)) as Bit;
}

export function variablesIn(node: AstNode): string[] {
  const names = new Set<string>();
  const walk = (n: AstNode) => { if (n.type === 'variable') names.add(n.name); else if (n.type === 'not') walk(n.operand); else if (n.type === 'binary') { walk(n.left); walk(n.right); } };
  walk(node); return [...names].sort();
}
