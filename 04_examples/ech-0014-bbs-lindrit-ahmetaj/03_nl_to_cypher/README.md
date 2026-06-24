# Phase 3 — NL → Cypher Pipeline

Diese Phase implementiert das **Hauptartefakt der Thesis**: eine KI-gestützte Abfrage-Pipeline, die deutsche natürlichsprachliche Fragen automatisch in Neo4j-Cypher übersetzt, die Übersetzungen gegen den Wissensgraphen ausführt und die Übersetzungsqualität gemäss drei Disposition-Metriken evaluiert (Korrektheit, Ergebnisqualität, Stabilität).

> **Methodische Grundlagen** dieser Phase — Pipeline-Architektur, System-Prompt-Design, sechs Designentscheidungen (Modellwahl, `temperature=0`, Few-Shot-Prompting, Token-Overlap-Scoring, Testset-Design), Stabilitätstest, Limitationen über drei Schichten — sind im Dokument [`../docs/03_nl_to_cypher_pipeline.md`](../docs/03_nl_to_cypher_pipeline.md) beschrieben. Dieses README beschränkt sich auf die **operativen Aspekte**.

---

## Was diese Phase macht

```
deutsche NL-Frage              nl_to_cypher.ipynb               evaluation_results.json
("Welche Mikros sind     ──────────────────────────────────►   (12 Testfälle, Scores,
 für S1 dringend                  │                              Stabilitätsläufe, Aggregate)
 empfohlen?")                     ├─ System-Prompt mit Schema
                                  ├─ Claude API: NL → Cypher
                                  ├─ Cypher gegen Neo4j ausführen
                                  ├─ Token-Overlap-Scoring 0/1/2
                                  ├─ 12 Testfälle × 1 Lauf
                                  ├─ 3 Stabilitätsläufe für A1, B2, C3
                                  └─ Aggregate Metriken + JSON-Export
```

| Aspekt | Wert |
| --- | --- |
| Eingabe | Neo4j-Graph aus Phase 2 + Anthropic API Key |
| Ausgabe | `evaluation_results.json` mit allen Resultaten + Stabilitäts-Tabellen im Notebook |
| Hauptdatei | `nl_to_cypher.ipynb` (29 Zellen, 15 Markdown + 14 Code) |
| LLM-Modell | `claude-sonnet-4-6` (default) |
| Laufzeit | ~70–90 Sekunden für vollen Evaluations-Lauf |
| API-Kosten | unter CHF 1.00 pro voller Lauf (Details siehe unten) |

---

## Voraussetzungen

- **Python ≥ 3.10** mit Jupyter (`pip install -r ../requirements.txt`)
- **Laufende Neo4j-Datenbank** aus Phase 2 (Container muss `running (healthy)` sein)
- **Anthropic API Key** mit Guthaben (siehe unten)

---

## Setup

### 1. Anthropic API Key besorgen

Auf <https://console.anthropic.com> einloggen oder Account erstellen. Dann:

1. **Settings → API Keys** öffnen
2. **Create Key** klicken
3. Name vergeben (z.B. `saga-thesis`), kopieren
4. **Wichtig:** Key wird nur einmal angezeigt — sofort in die `.env` übernehmen

Falls Guthaben nötig: **Settings → Billing → Add Credits**. Für eine ganze Thesis-Pipeline reicht ein einmaliges Credit-Topup von CHF 10 mehrfach (siehe Kostenabschätzung unten).

### 2. `.env` konfigurieren

Im Repo-Root die `.env` öffnen und folgende Zeile setzen oder ergänzen:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 3. Neo4j-Datenbank starten (falls noch nicht aktiv)

```bash
cd ../02_neo4j_import
docker compose up -d
cd ../03_nl_to_cypher
```

Verifizieren mit `docker compose ps` — die Datenbank muss `running (healthy)` sein, bevor das Notebook gestartet wird.

### 4. Environment laden und Notebook starten

```bash
# Aus dem Repo-Root
set -a
source .env
set +a

# Notebook starten
jupyter notebook 03_nl_to_cypher/nl_to_cypher.ipynb
```

---

## Verwendung

### Vollständiger Lauf

Im Notebook **Cell → Run All**. Dauer: ~70–90 Sekunden.

Die Ausführung produziert in dieser Reihenfolge:

1. Verbindungsbestätigung zu Neo4j und Anthropic
2. Schema- und Few-Shot-Definition
3. End-to-End-Demo mit der Frage "Welche Varianten hat der Mikro-Block HTTP?"
4. Definition des 12er-Testsets
5. **Hauptevaluation** — durchläuft alle 12 Testfälle und gibt pro Fall Score und Laufzeit aus
6. Resultatstabelle (Pandas DataFrame)
7. Detaileinsicht in einen einzelnen Testfall (default: A1)
8. **Stabilitätstest** — A1, B2, C3 je dreimal mit `temperature=0`
9. Aggregierte Metriken (Korrektheit, Ø-Score, pro Kategorie, pro Komplexität)
10. JSON-Export

### Einzelne Zelle re-runnen

Nach einem vollen Lauf bleiben alle Variablen im Notebook-State. Du kannst dann gezielt einzelne Aspekte neu inspizieren, ohne alles erneut auszuführen:

- **Anderen Testfall ansehen**: in der Zelle "Detaileinsicht" `target_id = "A1"` zu z.B. `"C3"` ändern und nur diese Zelle erneut ausführen
- **Einzelne Frage testen**: am Ende des Notebooks eine neue Zelle hinzufügen mit
  ```python
  print(generate_cypher("Deine deutsche Frage hier?"))
  ```
- **Modell wechseln**: in der Setup-Zelle `MODEL = "claude-opus-4-6"` setzen und ab dort neu ausführen (Cells 2 onwards)

### Ergebnis-Datei verschieben

`evaluation_results.json` wird ins Notebook-Working-Directory geschrieben (also `03_nl_to_cypher/`). Für saubere Repo-Struktur danach verschieben:

```bash
mv 03_nl_to_cypher/evaluation_results.json data/output/
```

(Oder die `open(...)` -Zeile in der entsprechenden Notebook-Zelle direkt auf `"../data/output/evaluation_results.json"` umstellen.)

---

## Erwartete Resultate

### Aggregierte Metriken (typisch für V8.0 + Sonnet 4.6)

| Metrik | Erwarteter Bereich |
| --- | --- |
| **Korrektheit (binär)** | 70–85 % (8–10 von 12) |
| **Ergebnisqualität (Ø Score)** | 1.2–1.6 / 2.0 |
| **Stabilität (Cypher konstant)** | 3/3 bei `temperature=0` |
| **Stabilität (Score-Konsistenz)** | 3/3 bei `temperature=0` |

Diese Werte sind Erwartungen, keine Garantien. Pro Lauf kann es leichte Schwankungen geben — die genaue Zahl landet in `evaluation_results.json` und wird im Thesis-Anhang reproduziert.

### Struktur von `evaluation_results.json`

```json
{
  "model": "claude-sonnet-4-6",
  "n_cases": 12,
  "korrektheit": 0.83,
  "mean_score": 1.42,
  "stability": [
    {
      "Test": "A1",
      "Komplexität": "low",
      "Cypher konstant": "✓",
      "Scores": [2, 2, 2],
      "Score-Konsistenz": "✓"
    }
    // ...
  ],
  "cases": [
    {
      "id": "A1",
      "category": "Traceability",
      "complexity": "low",
      "question": "An welcher Stelle im Standard befindet sich...",
      "generated_cypher": "MATCH (d:Document)-[:DEFINES]->(macro:Macro)...",
      "score": 2,
      "correct": true,
      "actual_rows": 1,
      "expected_rows": 1,
      "error": null,
      "duration_s": 2.34
    }
    // ...
  ]
}
```

Diese Datei ist die Datenbasis für die Evaluations-Tabellen im Thesis-Kapitel 7 und wird als Anhang mit eingereicht.

---

## Kostenabschätzung

Ein voller Evaluations-Lauf macht **21 API-Calls** (12 Testfälle + 9 Stabilitätsläufe):

| Komponente | Tokens pro Call (geschätzt) |
| --- | ---: |
| System-Prompt (Schema + Few-Shots + Regeln) | ~3'500 |
| User-Message (deutsche NL-Frage) | ~50–150 |
| Cypher-Antwort des Modells | ~300–700 |

**Pro vollem Lauf**: rund 75'000–95'000 Input-Tokens und 8'000–12'000 Output-Tokens.

Mit den Preisen von `claude-sonnet-4-6` (Stand 2026) liegt ein voller Lauf typischerweise **deutlich unter CHF 1.00**. Aktuelle Preise unter <https://www.anthropic.com/pricing>.

Tipps für die Kosten-Kontrolle:

- Während der Notebook-Entwicklung erste Tests mit nur 2–3 Testfällen statt allen 12 (in der Hauptevaluations-Zelle die `for case in TEST_CASES`-Schleife temporär auf `TEST_CASES[:3]` einschränken)
- Stabilitätstest abschalten, falls man nur die Hauptevaluation laufen will (Zellen 22 überspringen)
- Bei Wechsel zu Opus den Kostenrahmen um Faktor 5 nach oben anpassen — Sonnet ist für diese Aufgabe ausreichend

---

## Testset anpassen oder erweitern

Die 12 Testfälle sind in der Notebook-Zelle "TEST_CASES" definiert. Pro Fall braucht es vier Felder:

```python
{
    "id": "A1",                          # Identifier, sollte einzigartig sein
    "category": "Traceability",          # eine der vier Klassen
    "complexity": "low",                 # low / mid / high
    "question": "An welcher Stelle...",  # deutsche NL-Frage
    "ground_truth": (                    # Referenz-Cypher (siehe Hinweis unten)
        "MATCH (d:Document)..."
    ),
},
```

**Hinweis zur Ground Truth:** Die Referenz-Cypher sollte für Entitäten **beide id und title** zurückgeben, damit das Token-Overlap-Scoring (siehe Methodik-Doku §8) sowohl ID-basierte als auch Title-basierte LLM-Antworten als korrekt erkennt.

Beispiel-Pattern:

```python
"ground_truth": (
    "MATCH ...\n"
    "RETURN m.id AS mikro_id, m.title AS mikro_title"
),
```

Beim Erweitern auf z.B. 20 Testfälle einfach weitere Einträge anhängen — die ganze Pipeline (Evaluation, Aggregation, JSON-Export) skaliert automatisch.

---

## Walkthrough mit eCH-Experten

Für das qualitative Walkthrough mit Maria oder eCH-Fachpersonen (Disposition §4.3.2) gibt es eine eigene Notebook-Zelle "Detaileinsicht in einen einzelnen Testfall". Sie zeigt:

- Die NL-Frage
- Den vom LLM generierten Cypher
- Das generierte Resultat (erste 10 Zeilen)
- Das Ground-Truth-Resultat (erste 10 Zeilen)
- Den Score und ob als korrekt gewertet

Durch Ändern von `target_id = "A1"` zu z.B. `"B2"` oder `"D3"` und Re-Run der Zelle inspiziert man andere Testfälle. Das ist die zentrale Anlaufstelle für den qualitativen Teil der Evaluation.

---

## Wenn etwas schiefgeht

### `AuthenticationError: Invalid API key`

Der `ANTHROPIC_API_KEY` in der Shell ist nicht gesetzt oder falsch. Prüfen:

```bash
echo $ANTHROPIC_API_KEY    # sollte mit sk-ant-api03-... beginnen
```

Falls leer: `set -a; source .env; set +a` ausführen, dann Notebook-Kernel neu starten (im Notebook: **Kernel → Restart**).

### `BadRequestError: temperature parameter not supported`

Das verwendete Modell akzeptiert keinen `temperature`-Parameter — wahrscheinlich `claude-opus-4-7`. Wechsle in der Setup-Zelle zurück zu `claude-sonnet-4-6` oder `claude-opus-4-6`.

### `ServiceUnavailable: Connection refused (Neo4j)`

Neo4j-Container läuft nicht. Aus `02_neo4j_import/` heraus `docker compose up -d` ausführen, ~15 Sekunden warten, dann Notebook erneut starten.

### `RuntimeError: Ground-Truth fehlerhaft für XX`

Eine Referenz-Cypher in `TEST_CASES` enthält einen Syntax- oder Logikfehler. Die Fehlermeldung zeigt den betroffenen Testfall. Cypher-Statement im Neo4j-Browser direkt ausführen, um den Fehler zu lokalisieren.

### `RateLimitError`

Mehrere Notebooks gleichzeitig oder zu viele Calls in kurzer Zeit. Eine Minute warten, dann erneut versuchen. Im Notebook ist kein Auto-Retry eingebaut — bei wiederholten Problemen Auto-Retry-Logik um `generate_cypher()` hinzufügen.

### Score überraschend niedrig (z.B. < 50 %)

Mehrere mögliche Ursachen:

1. **Falsches Modell** — wenn auf Haiku oder ein älteres Sonnet zurückgefallen, sinkt die Qualität spürbar
2. **Schema-Beschreibung veraltet** — falls am Neo4j-Schema etwas geändert wurde, aber `SCHEMA_DE` im Notebook nicht
3. **Einzelne Testfälle haben Syntax-Probleme** — Detaileinsicht-Zelle nutzen, um zu sehen, welcher Cypher generiert wird

---

## Dateien in diesem Verzeichnis

| Datei | Zweck |
| --- | --- |
| `nl_to_cypher.ipynb` | Vollständige Pipeline + Evaluation (29 Zellen) |
| `README.md` | Dieses Dokument |

---

## Weiterführend

| Bezug | Pfad |
| --- | --- |
| Methodische Grundlagen | [`../docs/03_nl_to_cypher_pipeline.md`](../docs/03_nl_to_cypher_pipeline.md) |
| Vorige Phase (Phase 2) | [`../02_neo4j_import/README.md`](../02_neo4j_import/README.md) |
| Baseline-Queries (Ground-Truth-Referenz) | [`../02_neo4j_import/baseline_queries.cypher`](../02_neo4j_import/baseline_queries.cypher) |
| Anthropic API Docs | <https://docs.claude.com> |
| Anthropic Pricing | <https://www.anthropic.com/pricing> |
