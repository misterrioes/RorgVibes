import type { TruthTable } from '../types';

interface Props { table: TruthTable; activeRow: number | null; onActiveRow: (row: number | null) => void; onToggle: (row: number) => void }
export function TruthTableView({ table, activeRow, onActiveRow, onToggle }: Props) {
  return <div className="table-wrap"><table className="truth-table">
    <thead><tr><th>#</th>{table.variables.map(v => <th key={v}>{v}</th>)}<th>Y</th></tr></thead>
    <tbody>{table.rows.map(row => <tr key={row.index} className={activeRow === row.index ? 'active-row' : ''}
      onMouseEnter={() => onActiveRow(row.index)} onMouseLeave={() => onActiveRow(null)} onClick={() => onActiveRow(row.index)}>
      <td className="row-number">{row.index}</td>{table.variables.map(v => <td key={v}>{row.inputs[v]}</td>)}
      <td><button className={`bit bit-${row.output}`} aria-label={`Ausgang von Zeile ${row.index + 1}: ${row.output}; umschalten`} onClick={event => { event.stopPropagation(); onToggle(row.index); }}>{row.output}</button></td>
    </tr>)}</tbody>
  </table></div>;
}
