import katex from 'katex';
import { formulaToLatex } from '../logic/latex';

export function MathFormula({ formula, className = '' }: { formula: string; className?: string }) {
  const html = katex.renderToString(formulaToLatex(formula), { throwOnError: false, output: 'html' });
  return <span className={className} aria-label={formula} dangerouslySetInnerHTML={{ __html: html }} />;
}
