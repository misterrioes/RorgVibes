import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../src/App';

describe('Anwendung', () => {
  it('schaltet Ausgänge um und aktualisiert Formeln', () => {
    render(<App/>);
    fireEvent.click(screen.getByLabelText('Ausgang von Zeile 1: 0; umschalten'));
    expect(screen.getByLabelText('Ausgang von Zeile 1: 1; umschalten')).toBeInTheDocument();
    expect(screen.getAllByLabelText('¬A·¬B·¬C').length).toBeGreaterThan(0);
  });
  it('behält freie Eingabe bis zu einer Tabellenänderung', () => {
    render(<App/>); const editor = screen.getByLabelText('Boolesche Formel');
    fireEvent.change(editor, { target: { value: 'A⊕B' } }); expect(editor).toHaveValue('A⊕B');
    fireEvent.click(screen.getByLabelText('Ausgang von Zeile 1: 0; umschalten')); expect(editor).not.toHaveValue('A⊕B');
  });
  it('zeigt Parserfehler und erzeugt gültige Schaltungen', () => {
    render(<App/>); const editor = screen.getByLabelText('Boolesche Formel');
    fireEvent.change(editor, { target: { value: 'A·' } }); fireEvent.click(screen.getByRole('button', { name: /Schaltplan erstellen/ })); expect(screen.getByRole('alert')).toHaveTextContent('UND-Operator');
    fireEvent.change(editor, { target: { value: 'A⊕B' } }); fireEvent.click(screen.getByRole('button', { name: /Schaltplan erstellen/ })); expect(screen.getByRole('img', { name: 'Interaktiver Schaltplan' })).toBeInTheDocument();
  });
});
