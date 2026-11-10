import type { AstNode, Token } from '../types';

export class FormulaSyntaxError extends Error {
  constructor(message: string, public position: number) { super(`Syntaxfehler an Position ${position + 1}: ${message}`); }
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const map: Record<string, Token['type']> = { '¬': 'NOT', '·': 'AND', '+': 'OR', '⊕': 'XOR', '⊙': 'XNOR', '(': 'LPAREN', ')': 'RPAREN' };
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (/\s/.test(char)) continue;
    if (/[A-Z]/.test(char)) tokens.push({ type: 'VAR', value: char, position: i });
    else if (char === '0' || char === '1') tokens.push({ type: 'CONST', value: char, position: i });
    else if (map[char]) tokens.push({ type: map[char], value: char, position: i });
    else throw new FormulaSyntaxError(`Unbekanntes Zeichen „${char}“. Erlaubt sind A–Z, 0, 1, ¬, ·, ⊕, ⊙, + und Klammern.`, i);
  }
  tokens.push({ type: 'EOF', value: '', position: input.length });
  return tokens;
}

export function parseFormula(input: string): AstNode {
  if (!input.trim()) throw new FormulaSyntaxError('Die Formel ist leer.', 0);
  const tokens = tokenize(input); let index = 0;
  const peek = () => tokens[index]; const take = () => tokens[index++];
  const primary = (): AstNode => {
    const token = peek();
    if (token.type === 'NOT') { take(); return { type: 'not', operand: primary() }; }
    if (token.type === 'VAR') { take(); return { type: 'variable', name: token.value }; }
    if (token.type === 'CONST') { take(); return { type: 'constant', value: Number(token.value) as 0 | 1 }; }
    if (token.type === 'LPAREN') { take(); const value = or(); if (peek().type !== 'RPAREN') throw new FormulaSyntaxError('Schließende Klammer „)“ fehlt.', peek().position); take(); return value; }
    const after = index > 0 ? tokens[index - 1] : null;
    const detail = after?.type === 'AND' ? 'Nach dem UND-Operator · fehlt ein Operand.' : after?.type === 'OR' ? 'Nach dem ODER-Operator + fehlt ein Operand.' : 'Hier wird eine Variable, Konstante, Negation oder Klammer erwartet.';
    throw new FormulaSyntaxError(detail, token.position);
  };
  const chain = (lower: () => AstNode, types: Token['type'][], operators: Record<string, 'AND' | 'OR' | 'XOR' | 'XNOR'>): AstNode => {
    let left = lower();
    while (types.includes(peek().type)) { const token = take(); left = { type: 'binary', operator: operators[token.type], left, right: lower() }; }
    return left;
  };
  const and = () => chain(primary, ['AND'], { AND: 'AND' });
  const xor = () => chain(and, ['XOR', 'XNOR'], { XOR: 'XOR', XNOR: 'XNOR' });
  const or = () => chain(xor, ['OR'], { OR: 'OR' });
  const result = or();
  if (peek().type !== 'EOF') {
    if (['VAR', 'CONST', 'LPAREN', 'NOT'].includes(peek().type)) throw new FormulaSyntaxError('Zwischen zwei Ausdrücken fehlt ein Operator. Implizite Multiplikation ist nicht erlaubt.', peek().position);
    throw new FormulaSyntaxError(`Unerwartetes Zeichen „${peek().value}“.`, peek().position);
  }
  return result;
}
