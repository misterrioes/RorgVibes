import type { FormulaTerm } from '../logic/normalForms';
import { MathFormula } from './MathFormula';

interface Props { title: string; formula: string; terms?: FormulaTerm[]; activeRow: number | null; onActiveRow: (row: number | null) => void; tone?: string }
export function FormulaCard({ title, formula, terms, activeRow, onActiveRow, tone = '' }: Props) {
  return <article className={`formula-card ${tone}`}><div className="formula-heading"><h3>{title}</h3><span className="equiv-badge">≡ Y</span></div>
    <div className="formula-display">
      {terms?.length ? terms.map((term, i) => <span key={term.rowIndex}><button className={`term ${activeRow === term.rowIndex ? 'active-term' : ''}`}
        onMouseEnter={() => onActiveRow(term.rowIndex)} onMouseLeave={() => onActiveRow(null)} onFocus={() => onActiveRow(term.rowIndex)} onClick={() => onActiveRow(term.rowIndex)}><MathFormula formula={term.text} /></button>{i < terms.length - 1 && <span className="operator">{title.includes('DNF') ? '+' : '·'}</span>}</span>)
        : <MathFormula formula={formula} />}
    </div>
  </article>;
}
