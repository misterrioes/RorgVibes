import type { Implicant, TruthTable } from '../types';

const ones = (pattern: string) => [...pattern].filter(c => c === '1').length;
const literalCount = (pattern: string) => [...pattern].filter(c => c !== '-').length;

function combine(a: Implicant, b: Implicant): Implicant | null {
  let differences = 0; let pattern = '';
  for (let i = 0; i < a.pattern.length; i++) {
    if (a.pattern[i] === b.pattern[i]) pattern += a.pattern[i];
    else if (a.pattern[i] !== '-' && b.pattern[i] !== '-') { differences++; pattern += '-'; }
    else return null;
  }
  if (differences !== 1) return null;
  return { pattern, minterms: [...new Set([...a.minterms, ...b.minterms])].sort((x, y) => x - y) };
}

export function primeImplicants(indices: number[], variableCount: number): Implicant[] {
  let current = indices.map(index => ({ pattern: index.toString(2).padStart(variableCount, '0'), minterms: [index] }));
  const primes: Implicant[] = [];
  while (current.length) {
    const used = new Set<number>(); const next = new Map<string, Implicant>();
    for (let i = 0; i < current.length; i++) for (let j = i + 1; j < current.length; j++) {
      if (ones(current[i].pattern) !== ones(current[j].pattern) + 1 && ones(current[j].pattern) !== ones(current[i].pattern) + 1) continue;
      const merged = combine(current[i], current[j]);
      if (merged) { used.add(i); used.add(j); next.set(merged.pattern, merged); }
    }
    current.forEach((item, i) => { if (!used.has(i) && !primes.some(p => p.pattern === item.pattern)) primes.push(item); });
    current = [...next.values()];
  }
  return primes.sort((a, b) => a.pattern.localeCompare(b.pattern));
}

function chooseCover(primes: Implicant[], targets: number[]): Implicant[] {
  if (!targets.length) return [];
  const candidates: number[][] = targets.map(target => primes.map((p, i) => p.minterms.includes(target) ? i : -1).filter(i => i >= 0));
  let products: number[][] = [[]];
  for (const choices of candidates) {
    products = products.flatMap(product => choices.map(choice => [...new Set([...product, choice])].sort((a, b) => a - b)));
    const unique = new Map(products.map(p => [p.join(','), p]));
    products = [...unique.values()].filter((p, i, all) => !all.some((q, j) => j !== i && q.length < p.length && q.every(v => p.includes(v))));
  }
  products.sort((a, b) => {
    const la = a.reduce((sum, i) => sum + literalCount(primes[i].pattern), 0);
    const lb = b.reduce((sum, i) => sum + literalCount(primes[i].pattern), 0);
    return la - lb || a.length - b.length || a.map(i => primes[i].pattern).join('|').localeCompare(b.map(i => primes[i].pattern).join('|'));
  });
  return products[0].map(i => primes[i]);
}

function minimize(indices: number[], variables: string[], form: 'dnf' | 'knf', totalRows: number): string {
  if (!indices.length) return form === 'dnf' ? '0' : '1';
  if (indices.length === totalRows) return form === 'dnf' ? '1' : '0';
  const cover = chooseCover(primeImplicants(indices, variables.length), indices);
  if (form === 'dnf') return cover.map(p => [...p.pattern].map((bit, i) => bit === '-' ? '' : bit === '1' ? variables[i] : `¬${variables[i]}`).filter(Boolean).join('·')).join(' + ');
  return cover.map(p => `(${[...p.pattern].map((bit, i) => bit === '-' ? '' : bit === '0' ? variables[i] : `¬${variables[i]}`).filter(Boolean).join('+')})`).join('·');
}

export const simplifiedDNF = (table: TruthTable) => minimize(table.rows.filter(r => r.output === 1).map(r => r.index), table.variables, 'dnf', table.rows.length);
export const simplifiedKNF = (table: TruthTable) => minimize(table.rows.filter(r => r.output === 0).map(r => r.index), table.variables, 'knf', table.rows.length);
