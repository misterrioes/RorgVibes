import type { AstNode, Bit, CircuitGraph, CircuitNode, SignalState } from '../types';

export function buildCircuit(ast: AstNode): CircuitGraph {
  const nodes: CircuitNode[] = []; let serial = 0;
  const inputs = new Map<string, string>();
  const add = (type: CircuitNode['type'], label: string, nodeInputs: string[] = [], extra: Partial<CircuitNode> = {}) => {
    const id = `${type.toLowerCase()}-${serial++}`; nodes.push({ id, type, label, inputs: nodeInputs, ...extra }); return id;
  };
  const visit = (node: AstNode): string => {
    if (node.type === 'variable') {
      if (!inputs.has(node.name)) inputs.set(node.name, add('INPUT', node.name, [], { variable: node.name }));
      return inputs.get(node.name)!;
    }
    if (node.type === 'constant') return add('CONST', String(node.value), [], { constant: node.value });
    if (node.type === 'not') {
      if (node.operand.type === 'binary') {
        const folded = { AND: 'NAND', OR: 'NOR', XOR: 'XNOR', XNOR: 'XOR' } as const;
        return add(folded[node.operand.operator], folded[node.operand.operator], [visit(node.operand.left), visit(node.operand.right)]);
      }
      return add('NOT', 'NOT', [visit(node.operand)]);
    }
    return add(node.operator, node.operator, [visit(node.left), visit(node.right)]);
  };
  const source = visit(ast); const outputId = add('OUTPUT', 'Y', [source]);
  const edges = nodes.flatMap(node => node.inputs.map((from, inputIndex) => ({ id: `${from}-${node.id}-${inputIndex}`, from, to: node.id, inputIndex })));
  return { nodes, edges, outputId, variables: [...inputs.keys()].sort() };
}

export function simulateCircuit(graph: CircuitGraph, inputValues: Record<string, Bit>): SignalState {
  const signals: SignalState = {}; const byId = new Map(graph.nodes.map(n => [n.id, n]));
  const resolve = (id: string): Bit => {
    if (signals[id] !== undefined) return signals[id];
    const node = byId.get(id)!; const values = node.inputs.map(resolve); let result: Bit;
    switch (node.type) {
      case 'INPUT': result = inputValues[node.variable!] ?? 0; break;
      case 'CONST': result = node.constant!; break;
      case 'NOT': result = (1 - values[0]) as Bit; break;
      case 'AND': result = (values[0] & values[1]) as Bit; break;
      case 'NAND': result = (1 - (values[0] & values[1])) as Bit; break;
      case 'OR': result = (values[0] | values[1]) as Bit; break;
      case 'NOR': result = (1 - (values[0] | values[1])) as Bit; break;
      case 'XOR': result = (values[0] ^ values[1]) as Bit; break;
      case 'XNOR': result = (1 - (values[0] ^ values[1])) as Bit; break;
      case 'OUTPUT': result = values[0]; break;
    }
    signals[id] = result; return result;
  };
  graph.nodes.forEach(n => resolve(n.id)); return signals;
}
