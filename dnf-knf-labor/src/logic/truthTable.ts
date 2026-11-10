import type { Bit, TruthTable } from '../types';

export const variableNames = (count: number) => ['A', 'B', 'C', 'D'].slice(0, count);

export function createTruthTable(count: number, outputs?: Bit[]): TruthTable {
  if (count < 2 || count > 4) throw new Error('Es sind nur zwei bis vier Eingänge erlaubt.');
  const variables = variableNames(count);
  const rows = Array.from({ length: 2 ** count }, (_, index) => ({
    index,
    inputs: Object.fromEntries(variables.map((v, column) => [v, ((index >> (count - column - 1)) & 1) as Bit])),
    output: outputs?.[index] ?? 0,
  }));
  return { variables, rows };
}

export function setOutputs(table: TruthTable, action: 'zero' | 'one' | 'invert' | 'random'): TruthTable {
  return { ...table, rows: table.rows.map(row => ({ ...row, output: action === 'zero' ? 0 : action === 'one' ? 1 : action === 'invert' ? (1 - row.output) as Bit : (Math.random() >= .5 ? 1 : 0) })) };
}
