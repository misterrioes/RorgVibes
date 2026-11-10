# Logiklabor: DNF, KNF & Schaltpläne

Eine vollständig lokale, deutschsprachige React-Anwendung für Wahrheitstabellen, boolesche Normalformen und interaktive ANSI-Schaltnetze. Es gibt kein Backend und es werden keine Formeln oder Eingabewerte übertragen.

## Start

```bash
npm install
npm run dev
```

Produktionsbuild und Tests:

```bash
npm test
npm run build
```

## Formelsyntax

| Zeichen | Bedeutung | Priorität |
|---|---|---:|
| `( )` | Klammern | 1 |
| `¬` | NOT | 2 |
| `·` | AND | 3 |
| `⊕`, `⊙` | XOR, XNOR | 4 |
| `+` | OR | 5 |

Variablen sind einzelne Großbuchstaben `A–Z`, Konstanten `0` und `1`. Operatoren gleicher Priorität werden linksassoziativ ausgewertet. Implizite Multiplikation ist absichtlich nicht zulässig: `AB` muss als `A·B` geschrieben werden.

## Architektur und Entscheidungen

- `src/logic`: reine, von React unabhängige Fachlogik für Wahrheitstabellen, Normalformen, Quine–McCluskey-Minimierung, Parser, Auswertung, Netzaufbau und Layout.
- `src/components`: Darstellung und Interaktion. Formeln werden über KaTeX gesetzt, Schaltungen als eigenes SVG gerendert.
- Die minimierte DNF wird exakt über Primimplikanten und eine vollständige Überdeckungssuche bestimmt. Für die KNF wird dasselbe Verfahren auf die Nullzeilen angewendet. Gleichstände werden über Literalzahl, Termzahl und schließlich lexikografisch entschieden.
- Negierte binäre AST-Knoten werden zu NAND-, NOR- beziehungsweise XNOR-Gattern zusammengefasst. Das Netz wird unabhängig vom AST simuliert und in Tests gegen ihn geprüft.
- Das Layer-Layout ist bewusst klein und deterministisch und benötigt keine externe Graphbibliothek.

## Grenzen der ersten Version

KV-Diagramm, geführter Schrittmodus, Dark Mode, persistente Speicherung und CircuitVerse-Export sind nicht enthalten. SVG- und PNG-Export sind direkt in der Anwendung verfügbar.
