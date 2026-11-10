import type { AstNode } from '../types';
import { parseFormula } from './parser';

function render(node: AstNode, parent = 0): string {
  if (node.type === 'variable') return node.name;
  if (node.type === 'constant') return String(node.value);
  if (node.type === 'not') return `\\overline{${render(node.operand)}}`;
  const p = node.operator === 'AND' ? 4 : node.operator === 'XOR' || node.operator === 'XNOR' ? 3 : 2;
  const op = { AND: '\\cdot ', OR: '+', XOR: '\\oplus ', XNOR: '\\odot ' }[node.operator];
  const value = `${render(node.left, p)}${op}${render(node.right, p + 1)}`;
  return p < parent ? `\\left(${value}\\right)` : value;
}
export function formulaToLatex(formula: string): string { try { return render(parseFormula(formula)); } catch { return formula; } }
