import type { GateType } from '../types';

export function GateSymbol({ type, active, label }: { type: GateType; active: boolean; label: string }) {
  const color = active ? '#0b9f8f' : '#6d7278'; const common = { fill: '#fff', stroke: color, strokeWidth: 2.5, vectorEffect: 'non-scaling-stroke' as const };
  if (type === 'INPUT' || type === 'CONST') return <g><rect x="-27" y="-20" width="54" height="40" rx="11" {...common}/><text className="gate-text" textAnchor="middle" y="6">{label}</text></g>;
  if (type === 'OUTPUT') return <g><circle r="23" {...common}/><text className="gate-text" textAnchor="middle" y="6">Y</text></g>;
  if (type === 'NOT') return <g><path d="M-30-24 L24 0 L-30 24 Z" {...common}/><circle cx="30" cy="0" r="6" {...common}/></g>;
  const isOr = ['OR','NOR','XOR','XNOR'].includes(type); const bubble = ['NAND','NOR','XNOR'].includes(type);
  return <g>
    {isOr ? <><path d="M-35-28 Q-14 0-35 28 Q18 28 36 0 Q18-28-35-28 Z" {...common}/>{(type === 'XOR' || type === 'XNOR') && <path d="M-43-28 Q-22 0-43 28" fill="none" stroke={color} strokeWidth="2.5"/>}</>
      : <path d="M-35-28 L0-28 A28 28 0 0 1 0 28 L-35 28 Z" {...common}/>} 
    {bubble && <circle cx="42" cy="0" r="6" {...common}/>}<text className="gate-label" textAnchor="middle" y="5">{type}</text>
  </g>;
}
