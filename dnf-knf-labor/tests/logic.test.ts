import { describe, expect, it } from 'vitest';
import { createTruthTable } from '../src/logic/truthTable';
import { canonicalDNF, canonicalKNF } from '../src/logic/normalForms';
import { simplifiedDNF, simplifiedKNF } from '../src/logic/minimization';
import { parseFormula } from '../src/logic/parser';
import { evaluate } from '../src/logic/evaluator';
import { buildCircuit, simulateCircuit } from '../src/logic/circuitBuilder';
import type { Bit } from '../src/types';

const evaluateFormula = (formula: string, inputs: Record<string, Bit>) => evaluate(parseFormula(formula), inputs);

describe('Normalformen', () => {
  for (const count of [2, 3, 4]) it(`bildet kanonische und vereinfachte Formen für ${count} Variablen äquivalent ab`, () => {
    const length = 2 ** count;
    const patterns: Bit[][] = [Array(length).fill(0), Array(length).fill(1), Array.from({ length }, (_, i) => (i % 3 === 0 ? 1 : 0) as Bit)];
    for (const outputs of patterns) {
      const table = createTruthTable(count, outputs);
      for (const formula of [canonicalDNF(table).text, canonicalKNF(table).text, simplifiedDNF(table), simplifiedKNF(table)]) {
        table.rows.forEach(row => expect(evaluateFormula(formula, row.inputs), `${formula}, Zeile ${row.index}`).toBe(row.output));
      }
    }
  });

  it('liefert das vorgegebene Beispiel minimal', () => {
    const table = createTruthTable(3, [1,1,0,0,0,1,0,1]);
    expect(simplifiedDNF(table).replaceAll(' ', '')).toBe('¬A·¬B+A·C');
    expect(simplifiedKNF(table).replaceAll(' ', '')).toBe('(A+¬B)·(¬A+C)');
  });

  it('behandelt konstante Funktionen korrekt', () => {
    const zero = createTruthTable(3); const one = createTruthTable(3, Array(8).fill(1));
    expect([canonicalDNF(zero).text, canonicalKNF(zero).text, simplifiedDNF(zero), simplifiedKNF(zero)]).toEqual(['0','0','0','0']);
    expect([canonicalDNF(one).text, canonicalKNF(one).text, simplifiedDNF(one), simplifiedKNF(one)]).toEqual(['1','1','1','1']);
  });
});

describe('Parser und Auswertung', () => {
  it('beachtet NOT, AND, XOR und OR in dieser Priorität', () => {
    const ast = parseFormula('¬A+B·C⊕D+E');
    expect(ast.type).toBe('binary');
    expect(evaluate(ast, { A:1,B:1,C:1,D:1,E:0 })).toBe(0);
  });
  it('unterstützt verschachtelte Negationen und XNOR', () => {
    expect(evaluateFormula('¬(¬(A⊙B))', { A:1,B:1 })).toBe(1);
    expect(evaluateFormula('¬(A·B+C)', { A:1,B:1,C:0 })).toBe(0);
  });
  it('meldet implizite Multiplikation und fehlende Operanden verständlich', () => {
    expect(() => parseFormula('AB')).toThrow(/Implizite Multiplikation/);
    expect(() => parseFormula('A·')).toThrow(/UND-Operator/);
  });
});

describe('Schaltnetz', () => {
  const formulas = ['(A+B)·¬C', '¬(A·B)', '¬(A+B)', '¬(A⊕B)', 'A⊙B+C'];
  for (const formula of formulas) it(`entspricht dem AST für ${formula}`, () => {
    const ast = parseFormula(formula); const graph = buildCircuit(ast);
    for (let index = 0; index < 8; index++) {
      const inputs = { A: ((index >> 2) & 1) as Bit, B: ((index >> 1) & 1) as Bit, C: (index & 1) as Bit };
      expect(simulateCircuit(graph, inputs)[graph.outputId]).toBe(evaluate(ast, inputs));
    }
  });
  it('faltet negierte binäre Operatoren in ANSI-Gatter', () => {
    expect(buildCircuit(parseFormula('¬(A·B)')).nodes.some(n => n.type === 'NAND')).toBe(true);
    expect(buildCircuit(parseFormula('¬(A+B)')).nodes.some(n => n.type === 'NOR')).toBe(true);
    expect(buildCircuit(parseFormula('¬(A⊕B)')).nodes.some(n => n.type === 'XNOR')).toBe(true);
  });
});
