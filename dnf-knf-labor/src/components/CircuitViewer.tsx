import { useMemo, useRef, useState } from 'react';
import type { Bit, CircuitGraph, CircuitNode } from '../types';
import { layoutCircuit } from '../logic/circuitLayout';
import { simulateCircuit } from '../logic/circuitBuilder';
import { GateSymbol } from './GateSymbol';

const gateDescriptions: Record<string, string> = { AND: 'UND ist 1, wenn beide Eingänge 1 sind.', OR: 'ODER ist 1, wenn mindestens ein Eingang 1 ist.', NOT: 'NICHT kehrt das Eingangssignal um.', NAND: 'NAND ist ein negiertes UND.', NOR: 'NOR ist ein negiertes ODER.', XOR: 'XOR ist 1, wenn die Eingänge verschieden sind.', XNOR: 'XNOR ist 1, wenn die Eingänge gleich sind.' };

export function CircuitViewer({ graph, explain }: { graph: CircuitGraph; explain: boolean }) {
  const initial = Object.fromEntries(graph.variables.map(v => [v, 0 as Bit])); const [inputs, setInputs] = useState<Record<string, Bit>>(initial);
  const [zoom, setZoom] = useState(1); const [selected, setSelected] = useState<CircuitNode | null>(null); const svgRef = useRef<SVGSVGElement>(null);
  const layout = useMemo(() => layoutCircuit(graph), [graph]); const signals = useMemo(() => simulateCircuit(graph, inputs), [graph, inputs]);
  const nodeMap = new Map(layout.nodes.map(n => [n.id, n]));
  const reset = () => setInputs(Object.fromEntries(graph.variables.map(v => [v, 0 as Bit])));
  const svgString = () => { const svg = svgRef.current!.cloneNode(true) as SVGSVGElement; svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); svg.setAttribute('width', String(layout.width)); svg.setAttribute('height', String(layout.height)); return new XMLSerializer().serializeToString(svg); };
  const download = (blob: Blob, name: string) => { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 0); };
  const exportSvg = () => download(new Blob([svgString()], { type: 'image/svg+xml;charset=utf-8' }), 'schaltplan.svg');
  const exportPng = () => { const image = new Image(); const url = URL.createObjectURL(new Blob([svgString()], { type: 'image/svg+xml;charset=utf-8' })); image.onload = () => { const canvas = document.createElement('canvas'); canvas.width = layout.width * 2; canvas.height = layout.height * 2; const ctx = canvas.getContext('2d')!; ctx.scale(2, 2); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, layout.width, layout.height); ctx.drawImage(image, 0, 0); URL.revokeObjectURL(url); canvas.toBlob(blob => blob && download(blob, 'schaltplan.png'), 'image/png'); }; image.src = url; };
  return <div className="circuit-shell">
    <div className="circuit-toolbar"><button onClick={reset}>↺ Eingänge zurücksetzen</button><span className="toolbar-separator"/><button aria-label="Verkleinern" onClick={() => setZoom(z => Math.max(.5, z - .15))}>−</button><span>{Math.round(zoom * 100)} %</span><button aria-label="Vergrößern" onClick={() => setZoom(z => Math.min(2, z + .15))}>+</button><button onClick={() => setZoom(1)}>Einpassen</button><span className="toolbar-spacer"/><button onClick={exportSvg}>SVG</button><button onClick={exportPng}>PNG</button></div>
    <div className="circuit-stage"><svg ref={svgRef} className="circuit-svg" viewBox={`0 0 ${layout.width} ${layout.height}`} style={{ width: `${zoom * 100}%` }} role="img" aria-label="Interaktiver Schaltplan">
      <rect width="100%" height="100%" fill="#fffdf8"/>
      {graph.edges.map(edge => { const from = nodeMap.get(edge.from)!; const to = nodeMap.get(edge.to)!; const signal = signals[edge.from]; const x1 = from.x + from.width / 2; const x2 = to.x - to.width / 2; const targetY = to.y + (to.inputs.length > 1 ? (edge.inputIndex === 0 ? -14 : 14) : 0); return <g key={edge.id}><path d={`M${x1} ${from.y} C${(x1+x2)/2} ${from.y}, ${(x1+x2)/2} ${targetY}, ${x2} ${targetY}`} fill="none" stroke={signal ? '#0b9f8f' : '#a7adb2'} strokeWidth={signal ? 3 : 2}/><text x={(x1+x2)/2} y={(from.y+targetY)/2-6} className={`wire-value signal-${signal}`}>{signal}</text></g>; })}
      {layout.nodes.map(node => <g key={node.id} transform={`translate(${node.x} ${node.y})`} className={`gate-node ${node.type === 'INPUT' ? 'input-node' : ''}`} tabIndex={0} role={node.type === 'INPUT' ? 'button' : 'graphics-symbol'} aria-label={`${node.label}: Signal ${signals[node.id]}`}
        onClick={() => node.type === 'INPUT' ? setInputs(v => ({ ...v, [node.variable!]: (1 - v[node.variable!]) as Bit })) : setSelected(node)} onKeyDown={e => { if (node.type === 'INPUT' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setInputs(v => ({ ...v, [node.variable!]: (1 - v[node.variable!]) as Bit })); } }}>
        <GateSymbol type={node.type} active={signals[node.id] === 1} label={node.label}/><text x="0" y={node.height/2+18} textAnchor="middle" className={`node-value signal-${signals[node.id]}`}>{signals[node.id]}</text></g>)}
    </svg></div>
    {explain && selected && <div className="gate-explanation"><strong>{selected.label}-Gatter:</strong> {gateDescriptions[selected.type] ?? `Dieses Element führt das Signal ${signals[selected.id]} weiter.`} Aktueller Ausgang: <strong>{signals[selected.id]}</strong>.</div>}
  </div>;
}
