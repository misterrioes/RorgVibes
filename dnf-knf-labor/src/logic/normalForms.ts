import type { AstNode, TruthRow, TruthTable } from '../types';

export interface FormulaTerm { rowIndex: number; text: string }
export interface CanonicalForm { text: string; terms: FormulaTerm[] }

const literal = (name: string, positive: boolean) => positive ? name : `¬${name}`;

export function canonicalDNF(table: TruthTable): CanonicalForm {
  const selected = table.rows.filter(row => row.output === 1);
  if (!selected.length) return { text: '0', terms: [] };
  if (selected.length === table.rows.length) return { text: '1', terms: [] };
  const terms = selected.map(row => ({ rowIndex: row.index, text: table.variables.map(v => literal(v, row.inputs[v] === 1)).join('·') }));
  return { terms, text: terms.map(term => term.text).join(' + ') };
}

export function canonicalKNF(table: TruthTable): CanonicalForm {
  const selected = table.rows.filter(row => row.output === 0);
  if (!selected.length) return { text: '1', terms: [] };
  if (selected.length === table.rows.length) return { text: '0', terms: [] };
  const terms = selected.map(row => ({ rowIndex: row.index, text: `(${table.variables.map(v => literal(v, row.inputs[v] === 0)).join('+')})` }));
  return { terms, text: terms.map(term => term.text).join('·') };
}

export function rowExplanation(row: TruthRow, variables: string[], mode: 'dnf' | 'knf'): string {
  const values = variables.map(v => `${v} = ${row.inputs[v]}`).join(', ');
  return mode === 'dnf'
    ? `Dieser Minterm ist genau dann 1, wenn ${values} gilt. Eine 0 wird negiert, damit das Literal in genau dieser Zeile wahr ist.`
    : `Dieser Maxterm ist genau dann 0, wenn ${values} gilt. Eine 1 wird negiert, damit die Klammer ausschließlich in dieser Zeile falsch ist.`;
}

export function astToLinear(node: AstNode, parentPrecedence = 0): string {
  if (node.type === 'variable') return node.name;
  if (node.type === 'constant') return String(node.value);
  if (node.type === 'not') {
    const inner = astToLinear(node.operand, 5);
    return `¬${node.operand.type === 'binary' ? `(${astToLinear(node.operand)})` : inner}`;
  }
  const precedence = node.operator === 'AND' ? 4 : node.operator === 'XOR' || node.operator === 'XNOR' ? 3 : 2;
  const symbol = { AND: '·', OR: '+', XOR: '⊕', XNOR: '⊙' }[node.operator];
  const value = `${astToLinear(node.left, precedence)}${symbol}${astToLinear(node.right, precedence + 1)}`;
  return precedence < parentPrecedence ? `(${value})` : value;
}
