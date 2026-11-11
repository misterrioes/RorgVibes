import { useMemo, useState } from 'react';
import type { Bit, CircuitGraph } from './types';
import { createTruthTable, setOutputs } from './logic/truthTable';
import { canonicalDNF, canonicalKNF, rowExplanation } from './logic/normalForms';
import { simplifiedDNF, simplifiedKNF } from './logic/minimization';
import { parseFormula } from './logic/parser';
import { buildCircuit } from './logic/circuitBuilder';
import { TruthTableView } from './components/TruthTableView';
import { FormulaCard } from './components/FormulaCard';
import { CircuitViewer } from './components/CircuitViewer';

type FormulaChoice = 'canonicalDnf' | 'canonicalKnf' | 'simpleDnf' | 'simpleKnf';

export default function App() {
  const [table, setTable] = useState(() => createTruthTable(3));
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [choice, setChoice] = useState<FormulaChoice>('simpleDnf');
  const [explain, setExplain] = useState(true);
  const canonicalDnf = useMemo(() => canonicalDNF(table), [table]); const canonicalKnf = useMemo(() => canonicalKNF(table), [table]);
  const simpleDnf = useMemo(() => simplifiedDNF(table), [table]); const simpleKnf = useMemo(() => simplifiedKNF(table), [table]);
  const formulas: Record<FormulaChoice, string> = { canonicalDnf: canonicalDnf.text, canonicalKnf: canonicalKnf.text, simpleDnf, simpleKnf };
  const [editor, setEditor] = useState('0'); const [error, setError] = useState(''); const [graph, setGraph] = useState<CircuitGraph | null>(null);

  const updateTable = (next: typeof table) => { setTable(next); const f = choice === 'canonicalDnf' ? canonicalDNF(next).text : choice === 'canonicalKnf' ? canonicalKNF(next).text : choice === 'simpleDnf' ? simplifiedDNF(next) : simplifiedKNF(next); setEditor(f); setActiveRow(null); };
  const changeCount = (count: number) => updateTable(createTruthTable(count));
  const chooseFormula = (next: FormulaChoice) => { setChoice(next); setEditor(formulas[next]); setError(''); };
  const toggleOutput = (index: number) => updateTable({ ...table, rows: table.rows.map(row => row.index === index ? { ...row, output: (1 - row.output) as Bit } : row) });
  const createCircuit = () => { try { const ast = parseFormula(editor); setGraph(buildCircuit(ast)); setError(''); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Die Formel konnte nicht gelesen werden.'); } };
  const selectedRow = activeRow === null ? null : table.rows[activeRow];

  return <div className="app">
    <nav className="collection-nav" aria-label="Lernstrecke">
      <a href="/minifloat/" aria-label="Vorheriges Labor: Minifloat">← <span>Zurück</span></a>
      <a className="collection-home" href="/"><b>03</b><span>Digitalentwurf</span><small>Übersicht</small></a>
      <a href="/murmel/" aria-label="Nächstes Labor: Murmel-Systeme"><span>Weiter</span> →</a>
    </nav>
    <header className="hero"><div><p className="eyebrow">RECHNERORGANISATION · INTERAKTIVES LABOR</p><h1>Von der Wahrheitstabelle<br/><em>zum Schaltplan.</em></h1><p className="hero-copy">Erkunde, wie einzelne Zeilen zu Normalformen werden — und wie aus einer booleschen Formel ein lebendiges digitales Schaltnetz entsteht.</p></div><div className="hero-mark" aria-hidden="true"><span>A</span><i/><span>B</span><b>Y</b></div></header>

    <main>
      <section className="section" aria-labelledby="truth-title"><div className="section-head"><div><span className="step">01</span><h2 id="truth-title">Wahrheitstabelle &amp; Normalformen</h2></div><label className="toggle"><input type="checkbox" checked={explain} onChange={e => setExplain(e.target.checked)}/><span/> Erklärmodus</label></div>
        <div className="truth-grid"><div className="table-panel panel">
          <div className="input-count"><span>Eingangssignale</span><div className="segmented">{[2,3,4].map(n => <button key={n} className={table.variables.length === n ? 'selected' : ''} onClick={() => changeCount(n)}>{n}</button>)}</div></div>
          <TruthTableView table={table} activeRow={activeRow} onActiveRow={setActiveRow} onToggle={toggleOutput}/>
          <div className="table-actions"><button onClick={() => updateTable(setOutputs(table, 'zero'))}>Alle 0</button><button onClick={() => updateTable(setOutputs(table, 'one'))}>Alle 1</button><button onClick={() => updateTable(setOutputs(table, 'random'))}>⚄ Zufall</button><button onClick={() => updateTable(setOutputs(table, 'invert'))}>↕ Invertieren</button><button onClick={() => updateTable(createTruthTable(table.variables.length))}>↺ Zurücksetzen</button></div>
        </div>
        <div className="formulas-panel"><div className="formula-grid"><FormulaCard title="Kanonische DNF" formula={canonicalDnf.text} terms={canonicalDnf.terms} activeRow={activeRow} onActiveRow={setActiveRow}/><FormulaCard title="Kanonische KNF" formula={canonicalKnf.text} terms={canonicalKnf.terms} activeRow={activeRow} onActiveRow={setActiveRow}/><FormulaCard title="Vereinfachte DNF" formula={simpleDnf} activeRow={activeRow} onActiveRow={setActiveRow} tone="simplified"/><FormulaCard title="Vereinfachte KNF" formula={simpleKnf} activeRow={activeRow} onActiveRow={setActiveRow} tone="simplified"/></div>
          {explain && <div className="explanation"><div className="explanation-icon">i</div><div><strong>{selectedRow ? `Zeile ${selectedRow.index}: ${selectedRow.output ? 'Minterm der DNF' : 'Maxterm der KNF'}` : 'So entsteht die Formel'}</strong><p>{selectedRow ? rowExplanation(selectedRow, table.variables, selectedRow.output ? 'dnf' : 'knf') : 'Fahre über eine Tabellenzeile oder einen Term. Du siehst dann, welche Belegung er beschreibt und weshalb einzelne Variablen negiert werden.'}</p></div></div>}
          <label className="formula-choice"><span>Formel für den Schaltplan</span><select value={choice} onChange={e => chooseFormula(e.target.value as FormulaChoice)}><option value="canonicalDnf">Kanonische DNF</option><option value="canonicalKnf">Kanonische KNF</option><option value="simpleDnf">Vereinfachte DNF</option><option value="simpleKnf">Vereinfachte KNF</option></select></label>
        </div></div>
      </section>

      <section className="section circuit-section" aria-labelledby="circuit-title"><div className="section-head"><div><span className="step">02</span><h2 id="circuit-title">Schaltplan-Generator</h2></div><span className="local-badge">● Lokal im Browser</span></div>
        <div className="editor-card"><label htmlFor="formula">Boolesche Formel</label><div className={`editor-row ${error ? 'has-error' : ''}`}><textarea id="formula" value={editor} onChange={e => setEditor(e.target.value)} spellCheck={false} aria-describedby="syntax-note error-message"/><button className="primary" onClick={createCircuit}>Schaltplan erstellen <span>→</span></button></div>
          <div id="syntax-note" className="syntax"><span>Syntax:</span> ¬ NICHT <i/> · UND <i/> ⊕ XOR <i/> ⊙ XNOR <i/> + ODER <i/> ( ) Klammern</div>{error && <div id="error-message" role="alert" className="error">⚠ {error}</div>}
        </div>
        {graph ? <CircuitViewer key={editor + graph.nodes.length} graph={graph} explain={explain}/> : <div className="empty-circuit"><div className="empty-symbol">⊢</div><h3>Noch kein Schaltplan</h3><p>Gib eine Formel ein und klicke auf „Schaltplan erstellen“.</p></div>}
      </section>
    </main><footer><span>Logiklabor</span><p>Didaktisches Werkzeug für die Rechnerorganisation · Alle Berechnungen finden lokal statt.</p></footer>
  </div>;
}
