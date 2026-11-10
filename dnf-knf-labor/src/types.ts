export type Bit = 0 | 1;
export interface TruthRow { index: number; inputs: Record<string, Bit>; output: Bit }
export interface TruthTable { variables: string[]; rows: TruthRow[] }

export type AstNode =
  | { type: 'variable'; name: string }
  | { type: 'constant'; value: Bit }
  | { type: 'not'; operand: AstNode }
  | { type: 'binary'; operator: 'AND' | 'OR' | 'XOR' | 'XNOR'; left: AstNode; right: AstNode };

export interface Token { type: 'VAR' | 'CONST' | 'NOT' | 'AND' | 'OR' | 'XOR' | 'XNOR' | 'LPAREN' | 'RPAREN' | 'EOF'; value: string; position: number }
export interface Implicant { pattern: string; minterms: number[] }
export type GateType = 'INPUT' | 'CONST' | 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR' | 'OUTPUT';
export interface CircuitNode { id: string; type: GateType; label: string; inputs: string[]; variable?: string; constant?: Bit }
export interface CircuitEdge { id: string; from: string; to: string; inputIndex: number }
export interface CircuitGraph { nodes: CircuitNode[]; edges: CircuitEdge[]; outputId: string; variables: string[] }
export interface LayoutNode extends CircuitNode { x: number; y: number; width: number; height: number; layer: number }
export type SignalState = Record<string, Bit>;
