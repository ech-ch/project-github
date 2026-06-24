# NL→Cypher-Pipeline: KI-gestützte Abfrage des Wissensgraphen

**Bachelor-Thesis ZHAW** · *Prototypische Modellierung dokumentenzentrierter Architekturstandards als Wissensgraph*  
Autor: Lindrit Ahmetaj · Betreuung: Maria Rothstein  
Dokumentversion: 1.0 · Step 3 der Implementations-Pipeline (Hauptartefakt)

---

## 1. Zweck und Geltungsbereich

Dieses Dokument beschreibt Step 3 der Implementations-Pipeline und damit das **Hauptartefakt der Bachelor-Thesis** (Disposition §5): eine KI-gestützte Abfrage-Pipeline, die natürlichsprachliche Fragen in deutscher Sprache automatisch in Neo4j-Cypher-Abfragen übersetzt, die Abfragen gegen den in Step 2 erzeugten Wissensgraphen ausführt und die Übersetzungsqualität gemäss dreier Evaluationsmetriken misst.

Während Step 1 und 2 die Datengrundlage geschaffen haben (PDF → JSON → Graph), beantwortet Step 3 die zentrale Forschungsfrage der Arbeit:

> Kann ein Wissensgraph mit einer LLM-basierten Abfrageschicht typische Anwenderfragen zu SAGA.ch substanziell besser beantworten als das statische PDF — und in welcher Qualität?

Das Artefakt ist als Jupyter-Notebook `nl_to_cypher.ipynb` implementiert. Dieses Format wurde gewählt, weil es ausführbaren Code, narrativen Text, generierte Cypher-Abfragen, Resultate und Auswertungs-Tabellen in einem einzigen, linear lesbaren Dokument vereinigt — ideal für die qualitative Demonstration im Walkthrough mit eCH-Experten (Disposition §4.3.2) und als reproduzierbares Methodik-Artefakt.

---

## 2. Eingabe und Ausgabe

| Aspekt | Eingabe | Ausgabe |
| --- | --- | --- |
| Pro Einzelabfrage | Eine natürlichsprachliche Frage (Deutsch) | Cypher-Abfrage + Neo4j-Resultat |
| Pro Evaluationslauf | 12 Testfälle mit Frage + Referenz-Cypher | `evaluation_results.json` mit Score, Korrektheit, Stabilität |
| Datengrundlage | Neo4j-Graph aus Step 2 (rund 700 Knoten, 1300 Kanten) | dieselbe Datenbank, unverändert |
| LLM-Backend | Anthropic Claude API | — |
| Modell | `claude-sonnet-4-6` (default) | — |

Das Notebook ist mit `set -a; source .env; set +a; jupyter notebook nl_to_cypher.ipynb` startbar (sofern Step 2 ausgeführt wurde und die Neo4j-Datenbank läuft).

---

## 3. Konzeptueller Hintergrund: NL→Cypher als Text-to-Query-Problem

### 3.1 Einordnung in die Forschungslandschaft

Die Übersetzung natürlicher Sprache in formale Datenbank-Abfragesprachen ist seit Jahrzehnten ein aktives Forschungsfeld. Die etablierteste Disziplin ist **Text-to-SQL** (vgl. Spider-Benchmark, BIRD-Benchmark) mit umfangreicher Literatur und produktiven Systemen. **Text-to-Cypher** ist die analoge Disziplin für Graph-Datenbanken und deutlich weniger entwickelt — sowohl was Benchmarks als auch was produktive Werkzeuge angeht.

Die hier implementierte Pipeline gehört in die Familie der **Few-Shot-Prompting-Ansätze**: ein vortrainiertes LLM wird mit einem Prompt versorgt, der (1) das Datenbankschema, (2) wenige Beispielfragen mit korrekten Cypher-Übersetzungen und (3) Format- und Stilregeln enthält. Das LLM generiert daraufhin für die Anwenderfrage eine Cypher-Abfrage, die direkt gegen Neo4j ausgeführt wird.

### 3.2 Alternative Ansätze und Ausschlussbegründungen

Während der Pipeline-Konzeption wurden drei alternative Ansätze geprüft und verworfen:

**Fine-Tuning** eines kleineren LLM speziell auf Cypher-Übersetzung wurde nicht gewählt, weil (a) die Datenmenge eines Bachelor-Thesis-Projekts nicht für robustes Fine-Tuning ausreicht, (b) Fine-Tuning Infrastruktur und Expertise verlangt, die ausserhalb des Thesis-Rahmens liegen, und (c) moderne Foundation-Modelle wie Claude-Sonnet-4 bereits ohne Spezialtraining ausreichend gute Resultate liefern.

**Retrieval-Augmented Generation (RAG)** mit semantischer Suche im Schema wurde nicht gewählt, weil das SAGA.ch-Schema klein genug ist, um vollständig in den System-Prompt zu passen (rund 2'000 Zeichen). RAG wäre erst bei sehr grossen oder dynamischen Schemas notwendig.

**Regelbasierte Übersetzung** mit Grammatik-Parsern wurde nicht gewählt, weil natürlichsprachliche Fragen zu vielfältig sind, um per Regeln vollständig abgedeckt zu werden, und weil ein regelbasiertes System nicht die generalisierende Robustheit eines LLM hat.

### 3.3 Grenzen des LLM-basierten Ansatzes

Drei Limitationen sind dem Ansatz inhärent und werden in §11 wieder aufgegriffen:

1. **Mehrdeutigkeit in NL-Fragen.** Begriffe wie "HTTP" können sowohl ein spezifisches Mikro als auch eine Familie von Standards bedeuten. Die LLM-Interpretation ist heuristisch und nicht deterministisch.
2. **Nicht-modellierte Querverweise.** Wenn der Wissensgraph eine Beziehung nicht enthält (siehe Step-1-Doku, Decision 3 zu Cross-References), kann das LLM diese auch nicht abfragen — egal wie gut der Prompt ist.
3. **Sampling-Indeterminismus.** Selbst bei `temperature=0` ist die Generation eines LLM nicht vollständig deterministisch (numerische Effekte in der Token-Auswahl). Die Stabilitätsmessung in §9 quantifiziert das.

---

## 4. Architektur der Pipeline

### 4.1 Komponentenübersicht

Das Notebook implementiert sieben funktionale Komponenten:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌─────────────────┐    ┌────────────────────┐                     │
│  │ Schema-Beschr.  │    │ Few-Shot-Beispiele │                     │
│  │ (SCHEMA_DE)     │    │ (3 Q-Cypher-Paare) │                     │
│  └────────┬────────┘    └──────────┬─────────┘                     │
│           └────────────┬───────────┘                                │
│                        ▼                                            │
│             ┌──────────────────────┐                                │
│             │ build_system_prompt  │                                │
│             └──────────┬───────────┘                                │
│                        │                                            │
│  ┌─────────────────┐   │   ┌──────────────────────────────────┐    │
│  │  NL-Frage (DE)  ├───┼──►│   generate_cypher() via API      │    │
│  └─────────────────┘   │   │   model: claude-sonnet-4-6       │    │
│                        │   │   temperature: 0.0               │    │
│                        │   └──────────────┬───────────────────┘    │
│                        │                  │                         │
│                        │                  ▼                         │
│                        │   ┌──────────────────────────────────┐    │
│                        │   │   extract_cypher() (Strip MD)    │    │
│                        │   └──────────────┬───────────────────┘    │
│                        │                  │                         │
│                        │                  ▼                         │
│                        │   ┌──────────────────────────────────┐    │
│                        │   │   execute_cypher() gegen Neo4j   │    │
│                        │   └──────────────┬───────────────────┘    │
│                        │                  │                         │
│                        │                  ▼                         │
│   ┌────────────────────┴──┐    ┌──────────────────────┐            │
│   │  Ground Truth Cypher  │───►│ score_results() 0-2  │            │
│   │  (aus TEST_CASES)     │    └─────────┬────────────┘            │
│   └───────────────────────┘              │                          │
│                                          ▼                          │
│                                ┌──────────────────────┐            │
│                                │ EvalResult-Objekt    │            │
│                                └─────────┬────────────┘            │
│                                          │                          │
│                                          ▼                          │
│                                ┌──────────────────────┐            │
│                                │ Aggregation, JSON-   │            │
│                                │ Persistierung        │            │
│                                └──────────────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

Diese sieben Komponenten sind im Notebook in 15 Code-Zellen organisiert, jeweils begleitet von einer Markdown-Zelle zur narrativen Erklärung. Das resultierende Dokument ist sowohl ausführbar als auch direkt für Thesis-Anhänge lesbar.

### 4.2 Datenfluss in einer einzelnen Abfrage

Pro Testfall durchläuft eine NL-Frage diese Verarbeitungskette:

1. **Frage** → `generate_cypher()` (mit System-Prompt, der Schema und Few-Shot-Beispiele enthält)
2. → Anthropic Messages API → Cypher-String
3. → `extract_cypher()` entfernt Markdown-Code-Fences falls vorhanden
4. → `execute_cypher()` führt gegen Neo4j aus → Liste von Records (oder Fehler)
5. Parallel: `execute_cypher()` mit der vorgegebenen Ground-Truth → Referenzresultat
6. → `score_results()` vergleicht beide Resultatsmengen → Score 0/1/2
7. → `EvalResult`-Dataclass mit allen Zwischenergebnissen wird gespeichert

Diese Trennung in Funktionen — `generate_cypher` / `extract_cypher` / `execute_cypher` / `score_results` — entspricht dem Single-Responsibility-Prinzip und macht die Pipeline testbar, debugbar und in einzelnen Aspekten austauschbar (z.B. anderes LLM-Backend, andere Scoring-Strategie).

## 5. System-Prompt-Design

Der System-Prompt ist die zentrale Stellschraube für die Qualität der NL→Cypher-Übersetzung. Er besteht aus vier Bestandteilen, die in dieser Reihenfolge konkateniert werden:

### 5.1 Rollenzuweisung und Aufgabenbeschreibung

```
Du bist ein Experte für Neo4j Cypher-Abfragen (Neo4j 5). Generiere
syntaktisch korrekte und ausführbare Cypher-Abfragen für den folgenden
Wissensgraphen.
```

Die Rollenzuweisung ist bewusst spezifisch ("Neo4j 5") — Cypher-Syntax hat sich zwischen Neo4j 4 und 5 in mehreren Stellen geändert (siehe Regel 5), und das LLM muss diese Differenzierung kennen.

### 5.2 Schema-Beschreibung (`SCHEMA_DE`)

Der gesamte Graph wird textuell beschrieben: alle Knotentypen mit ihren Properties, alle Beziehungstypen mit ihren Pfeilrichtungen, alle Wertebereiche (z.B. `normative_status ∈ {"dringend empfohlen", ...}`) und drei explizite "Wichtige Hinweise" zum Schema:

- Bewertungen hängen üblicherweise an Variant/Alternative, nicht direkt am Mikro
- Macro/Meso/Mikro tragen alle das Label `:Building_Block` plus ihr Level-Label
- Macro hat keine direkten Bewertungen oder Referenzen

Diese Hinweise sind aus empirischer Erfahrung mit frühen Pipeline-Läufen abgeleitet: ohne sie hat das LLM systematische Fehler gemacht (z.B. direkt von Mikro auf Interface getraverst statt über Variant). Sie repräsentieren das "tacit knowledge" über das Schema, das nicht aus der reinen Struktur ableitbar ist.

Die Schema-Beschreibung ist **deutsch verfasst**, weil sie zusammen mit deutschen Fragen verarbeitet wird und die Konsistenz der Sprache die Antwortqualität verbessert.

### 5.3 Format- und Stilregeln (sechs nummerierte Regeln)

Die wohl wichtigste Komponente des Prompts. Jede Regel ist während der Pipeline-Entwicklung aus konkreten Fehlversuchen abgeleitet worden:

> 1. Antworte AUSSCHLIESSLICH mit der Cypher-Abfrage. Keine Erklärung, kein Markdown-Code-Fence, kein Kommentar.

LLMs neigen ohne diese Regel zur Erklär-Verhalten — sie wickeln die Cypher-Antwort in einen Fliesstext ein. Ohne strikte Vorgabe würde die Pipeline beim Parsing der Antwort scheitern. Der Fallback in `extract_cypher()` (das Markdown-Fence-Stripping) ist eine zweite Verteidigungslinie.

> 2. Nutze nur die im Schema definierten Labels und Beziehungen.

Verhindert, dass das LLM "halluzinierte" Labels einführt (z.B. `:Standard` statt `:External_Standard`).

> 3. normative_status-Werte und Interface-IDs müssen exakt wie im Schema geschrieben werden (Kleinschreibung bei normative_status).

Cypher-Vergleiche sind case-sensitiv. `'dringend empfohlen' = 'Dringend empfohlen'` liefert `FALSE`. Ohne diese Regel hat das LLM regelmässig auf grossgeschriebene Statuswerte gefiltert und leere Resultate produziert.

> 4. Bei eindeutigen Mikro-Bausteinen wie "HTTP", "SOAP", "LDAP", "REST" bevorzuge die exakte ID-Übereinstimmung (z.B. `m.id = 'bb_mi_http'`).

Diese Regel ist Resultat einer frühen Iteration: zunächst lautete die Regel "nutze toLower() und CONTAINS für Robustheit", was das LLM dazu brachte, bei "HTTP" alle Mikros mit "http" im Titel zu matchen (inkl. HTTPS-Referenzen, WebDAV mit HTTP-Erwähnung, etc.). Die Korrektur — ID-basierter Lookup wo möglich — reduzierte False Positives drastisch.

> 5. Bei alternativen Beziehungstypen verwende die Neo4j-5-Syntax `[:HAS_VARIANT|HAS_ALTERNATIVE]` (OHNE zweiten Doppelpunkt).

Neo4j 5 hat die Syntax `[:R1|:R2]` deprecatet und akzeptiert sie nicht mehr bei variablen Pfadlängen. Ohne diese Regel erzeugt das LLM aus seinen Trainingsdaten die alte Syntax und produziert Cypher-Syntaxfehler.

> 6. Bei Resultaten: gib bei Entitäten möglichst BEIDE id UND title zurück, damit das Resultat unabhängig von der Repräsentation lesbar bleibt.

Begründung in zwei Schichten: (a) Für menschliche Lesbarkeit der Resultate sind Titel hilfreich; reine IDs sind kryptisch. (b) Für die spätere Bewertung durch die Scoring-Funktion (siehe §8) ermöglichen mehrere Repräsentationsformen mehr Tokenüberlappung mit der Ground Truth.

### 5.4 Few-Shot-Beispiele

Drei Beispielpaare aus Frage und korrekter Cypher decken die wichtigsten Muster ab:

1. **Einfaches HAS_VARIANT-Traversal** (HTTP → Varianten)
2. **APPLIES_TO-Filter mit polymorpher Quelle** (S1 dringend empfohlen → Mikros via HAS_VARIANT/HAS_ALTERNATIVE)
3. **HAS_VARIANT + REFERENCES kombiniert** (SOAP → externe Standards via Varianten)

Diese drei Patterns decken etwa 70 % der typischen Abfragepatterns ab. Mehr Few-Shots würden den Token-Verbrauch erhöhen, aber kaum zusätzlichen Lerngewinn bringen — eine empirische Beobachtung aus den ersten Pipeline-Tests.

---

## 6. Sechs Designentscheidungen

Analog zu Step 1 und Step 2 werden hier die zentralen methodischen Entscheidungen für Step 3 explizit aufgeführt und begründet. Sie gehören in Kapitel 6 (Implementation) und Kapitel 8 (Diskussion) der Thesis.

### E1 — Modellwahl: `claude-sonnet-4-6`

**Entscheidung:** Claude Sonnet 4.6 wird als Standard-Modell für die Pipeline verwendet.

**Begründung:** Drei Faktoren spielen zusammen:

- **Temperature-Unterstützung:** Das spätere Modell `claude-opus-4-7` lehnt das Setzen des `temperature`-Parameters mit HTTP 400 ab. Da der Stabilitätstest (siehe §9) explizit `temperature=0` verlangt, ist Opus 4.7 nicht einsetzbar. Sonnet 4.6 unterstützt `temperature` weiterhin.
- **Kapazität:** Sonnet 4.6 ist für deutsche NL→Cypher-Übersetzung auf Schema dieser Grösse ausreichend kapabel. Empirisch zeigt es vergleichbare Qualität wie Opus-Modelle bei dieser Aufgabe.
- **Kosten:** Sonnet ist rund fünfmal günstiger pro Token als Opus. Bei 12 Testfällen + 9 Stabilitätsläufen = 21 API-Calls pro Evaluation ist der absolute Unterschied klein (Cent-Bereich), aber für Iterations-Experimente während der Entwicklung kumuliert es sich.

**Trade-off:** Bei sehr komplexen Cypher-Patterns könnte Opus 4.6 leicht bessere Qualität liefern. Im Notebook ist das Modell als Konstante definiert und einfach austauschbar (`MODEL = "claude-opus-4-6"`).

### E2 — `temperature=0` für maximale Determinismus

**Entscheidung:** Alle API-Calls verwenden `temperature=0`.

**Begründung:** Disposition §4.3.1 verlangt einen Stabilitätstest mit Wiederholungen. Bei `temperature=0` wählt das LLM in jedem Schritt das wahrscheinlichste Token, was die Generation maximal determiniert. Bei höheren Temperaturen würde Sampling-Rauschen eingeführt, das die Stabilitätsmessung verfälscht.

**Trade-off:** `temperature=0` schliesst kreative Variationen aus. Bei ambivalenten Fragen, wo mehrere gleichwertige Cypher-Übersetzungen existieren, wird das Modell immer dieselbe wählen — was wir hier ausdrücklich wollen.

**Caveat:** Selbst `temperature=0` garantiert keine 100%-Determinismus. Numerische Effekte in Floating-Point-Operationen der GPU-Inferenz können bei identischen Eingaben minimal unterschiedliche Logits produzieren. Diese Inferenz-Variation ist ein bekanntes Phänomen und wird in der Diskussion explizit erwähnt.

### E3 — Few-Shot-Prompting statt Fine-Tuning

**Entscheidung:** Das LLM wird mit Schema und drei Few-Shot-Beispielen geprompt, nicht spezialisiert trainiert.

**Begründung:** Siehe §3.2. Fine-Tuning würde Infrastruktur (GPU-Cluster), Daten (mehrere hundert annotierte Q-Cypher-Paare) und Expertise verlangen, die ausserhalb des Thesis-Rahmens liegen. Few-Shot-Prompting nutzt die in-context-learning-Fähigkeiten moderner LLMs und ist mit minimalem Aufwand reproduzierbar.

**Trade-off:** Few-Shot ist empirisch weniger genau als gut gemachtes Fine-Tuning. Für eine produktive Anwendung mit höheren Genauigkeitsanforderungen wäre Fine-Tuning auf einem domain-spezifischen Datensatz der nächste logische Schritt. Wird in §11 als Future Work aufgegriffen.

### E4 — Per-Row-Token-Overlap-Scoring statt strenger Set-Vergleich

**Entscheidung:** Resultate werden über Token-Überlappung pro Zeile verglichen, nicht über strikte Mengen-Gleichheit der Records.

**Begründung:** Frühe Versuche mit strikter Mengen-Gleichheit (gleiche Spaltennamen + gleiche Werte) zeigten systematische Falsch-Negativ-Bewertungen: das LLM gab oft semantisch korrekte Resultate mit anderer Spalten-Bezeichnung zurück (`bb_id` statt `mikro_id`), oder mit zusätzlichen Informationsspalten (`mikro_title` neben `mikro_id`). Die strenge Mengen-Gleichheit bewertete diese korrekten Antworten als falsch.

Die Per-Row-Token-Overlap-Heuristik (Details in §8.2) erkennt semantische Übereinstimmung auch bei formaler Abweichung. Sie bildet die Disposition-Skala (vollständig korrekt / teilweise korrekt / nicht korrekt) realistischer ab.

**Trade-off:** Permissiver als strenge Gleichheit. Eine Antwort mit allen erwarteten Tokens, aber zusätzlichen False Positives erhält Score 1 statt 0. Diese Trade-off-Wahl wird in §11 thematisiert.

### E5 — Ground Truths geben beide `id` und `title` zurück

**Entscheidung:** Die Referenz-Cypher in den Testfällen retrournieren für Entitäten sowohl die ID als auch den Titel.

**Begründung:** Diese Entscheidung hängt mit E4 zusammen. Wenn die Ground Truth nur `bb_mi_http` zurückgibt und das LLM `"Hyper Text Transfer Protocol, HTTP"`, dann gibt es keine Token-Überlappung — beide referenzieren dieselbe Entität, aber mit unterschiedlichen Repräsentationen. Indem die Ground Truth beide Formen liefert, sind sowohl ID-basierte als auch Titel-basierte LLM-Antworten valide.

**Trade-off:** Die Ground-Truth-Cypher sind dadurch leicht "verbosely". Das ist akademisch vertretbar, weil sie explizit als Vergleichsbasis konstruiert sind, nicht als minimalistische Antwort.

### E6 — 12 Testfälle als methodisches Minimum

**Entscheidung:** 4 Anwendungsfall-Klassen × 3 Komplexitätsstufen = 12 Testfälle.

**Begründung:** Disposition §4.3.1 verlangt eine Evaluation über die definierten Anwendungsfall-Klassen mit unterschiedlichen Komplexitätsstufen. 12 Fälle sind das minimale Set, das diese Vorgabe systematisch erfüllt — pro Kategorie und Stufe genau ein Fall. Mehr Fälle würden die statistische Aussagekraft verbessern, aber den qualitativen Charakter einer Bachelor-Thesis-Evaluation überfordern.

**Trade-off:** Mit 12 Fällen sind keine statistisch signifikanten Vergleiche zwischen Klassen möglich (n=3 pro Klasse). Die Auswertung ist explizit qualitativ-deskriptiv, ergänzt durch das qualitative Walkthrough mit eCH-Experten.

---

## 7. Testset

### 7.1 Die vier Anwendungsfall-Klassen

Die vier Klassen orientieren sich an den typischen Nutzungsmustern eines Architektur-Standards wie SAGA.ch und sind in `baseline_queries.cypher` parallel definiert (für die Step-2-Verifikation):

| Klasse | Beschreibung | Beispielhafte Anwenderfrage |
| --- | --- | --- |
| **A — Traceability** | "Wo befindet sich Standard X im Dokument? Welche Referenzen hat er?" | "Wo befindet sich HTTP im SAGA-Standard?" |
| **B — Dependency / Impact** | "Wenn externer Standard X sich ändert, welche Building Blocks sind betroffen?" | "Welche Mikros referenzieren IETF RFC 7540?" |
| **C — Normative Status** | "Was ist für Schnittstelle X dringend empfohlen / nicht empfohlen?" | "Welche Bausteine sind für S1 dringend empfohlen?" |
| **D — Coverage / Daten-Hygiene** | "Gibt es Lücken oder Inkonsistenzen im Standard?" | "Welche Mikros haben gar keine Bewertung?" |

Diese vier Klassen wurden vor der Implementation festgelegt und dienen als methodisches Gerüst.

### 7.2 Die drei Komplexitätsstufen

Pro Klasse gibt es drei Komplexitätsstufen, die in Cypher-Termen folgendermassen charakterisiert sind:

| Stufe | Charakteristikum | Typische Cypher-Konstrukte |
| --- | --- | --- |
| **low** | Einzelner MATCH, keine Aggregation, eindeutige Filter | `MATCH (m:Mikro {id:'...'})-[:HAS_VARIANT]->(v) RETURN v` |
| **mid** | Filter + Aggregation oder Multi-Hop | `count()`, `WHERE` mit Subquery, mehrere `MATCH` |
| **high** | Multiple `MATCH` + Aggregation + Gruppierung, evtl. variable Pfadlängen | `count(DISTINCT ...)`, `GROUP BY`, `*0..1`-Pfade |

### 7.3 Konkrete Testfälle

Das vollständige Testset:

| ID | Klasse | Stufe | Topic |
| --- | --- | --- | --- |
| A1 | Traceability | low | HTTP-Pfad Document→Macro→Meso→Mikro |
| A2 | Traceability | mid | SOAP externe Standards über alle Varianten |
| A3 | Traceability | high | Sicherheits-Mikros mit dringend-empfohlen-Variant |
| B1 | Dependency | low | BBs, die IETF RFC 7540 referenzieren |
| B2 | Dependency | mid | Top 10 mehrfach referenzierter externer Standards |
| B3 | Dependency | high | Anzahl Mikros betroffen von IETF-Änderungen |
| C1 | Normative | low | Variants und Alternatives dringend empfohlen für S1 |
| C2 | Normative | mid | Mikros nicht empfohlen auf irgendeiner Schnittstelle |
| C3 | Normative | high | Variants pro normativem Status × Macro-Bereich |
| D1 | Coverage | low | Mikros ohne jegliche Bewertung |
| D2 | Coverage | mid | Standards, die nur einmal referenziert werden |
| D3 | Coverage | high | Mikros pro Macro mit/ohne Variante |

Jeder Testfall ist im Notebook als Dictionary-Eintrag definiert mit den Feldern `id`, `category`, `complexity`, `question` (deutsche NL-Frage), `ground_truth` (Referenz-Cypher).

---

## 8. Bewertungsmethodik

### 8.1 Drei-Punkt-Skala (Disposition §4.3.1)

Die Ergebnisqualität wird auf einer dreistufigen Skala bewertet, in direkter Korrespondenz zur Disposition:

| Score | Bedeutung (Disposition) | Operative Definition |
| --- | --- | --- |
| **2** | Vollständig korrekt: alle relevanten Ergebnisse enthalten, keine wesentlichen Abweichungen | Alle erwarteten Zeilen im Resultat gefunden UND Anzahl der Zeilen liegt nicht mehr als 50 % über der erwarteten Anzahl |
| **1** | Teilweise korrekt: relevante Teile richtig, aber unvollständig oder teilweise fehlerhaft | Alle erwarteten Zeilen gefunden aber zu viele Resultate, ODER mindestens 50 % der erwarteten Zeilen gefunden |
| **0** | Nicht korrekt: beantwortet den Testfall nicht angemessen | Weniger als 50 % gefunden, leeres Resultat oder Cypher-Syntaxfehler |

Zusätzlich wird **Korrektheit** als binäre Metrik abgeleitet: `correct = (score >= 1)` UND `error is None`.

### 8.2 Per-Row-Token-Overlap-Mechanismus

Die operative Frage "wurde diese erwartete Zeile im LLM-Resultat gefunden?" wird mittels Token-Überlappung beantwortet. Der Algorithmus:

1. **Token-Extraktion pro Zeile.** Jede Zeile (sowohl der Ground Truth als auch des LLM-Resultats) wird in ein Set von Strings umgewandelt: für jede Spalte wird der Wert in Kleinbuchstaben konvertiert; Listen-Werte werden flach in einzelne Token aufgelöst.

2. **Signifikanz-Filterung.** Tokens mit Länge < 3 Zeichen werden verworfen, ausser sie bestehen vollständig aus Ziffern. Damit fallen Bindewörter wie `und`, `von`, `der` heraus, aber Zahlen-Tokens wie `47` bleiben erhalten (relevant für Count-Resultate).

3. **Zeilen-Matching.** Eine erwartete Zeile gilt als "gefunden", wenn mindestens ein signifikantes Token aus ihrem Token-Set mit einem signifikanten Token aus einer Zeile des LLM-Resultats übereinstimmt. Das ist das Kernkriterium.

4. **Coverage-Berechnung.** `coverage = matched / total_expected_non_empty`.

5. **Score-Bestimmung.**
   - Coverage = 100 % UND `len(actual) ≤ len(expected) × 1.5` → Score 2
   - Coverage = 100 % aber zu viele Resultate, ODER Coverage ≥ 50 % → Score 1
   - Coverage < 50 % → Score 0
   - Cypher-Fehler oder leeres LLM-Resultat → Score 0

### 8.3 Begründung der Token-Overlap-Heuristik

Diese Heuristik balanciert drei konkurrierende Anforderungen:

| Anforderung | Wie die Heuristik sie erfüllt |
| --- | --- |
| Repräsentations-Toleranz: ID vs. Titel desselben Entität sollte matchen | Ground Truths enthalten beide (E5); Token-Overlap funktioniert auf beiden |
| Strikte Bewertung von False Positives: zu viele Resultate verschlechtern den Score | Score 2 nur bei Anzahl-Toleranz innerhalb 1.5× |
| Strikte Bewertung von False Negatives: fehlende Resultate sind schwerer Mangel | Coverage < 50 % bedeutet Score 0 |

Eine streng formale Alternative wäre ein **embeddings-basierter semantischer Vergleich** (z.B. Cosine-Similarity von Sentence-BERT-Embeddings der Zeilen). Diese Alternative wurde verworfen, weil sie (a) eine zusätzliche externe Abhängigkeit einführt, (b) die Bewertung undurchsichtiger macht (eine "Score 1.7"-Ähnlichkeit ist schwerer zu erklären als "alle Tokens gefunden") und (c) bei einem 12-Fälle-Set keine messbar bessere Qualität bringt.

### 8.4 Bekannte Grenzen der Heuristik

Die Heuristik akzeptiert drei systematische Schwächen:

1. **Numerische Werte können koinzident matchen.** Wenn die Ground Truth eine Anzahl `47` zurückgibt und das LLM-Resultat ebenfalls die Zahl `47` enthält, aber als unterschiedlicher Wert (z.B. anderer Count), gilt das als Match. In der Praxis vernachlässigbar für die 12 Testfälle, aber prinzipiell.
2. **Permissive Bewertung bei zu wenigen Resultaten.** Wenn das LLM ein Subset der erwarteten Antwort zurückgibt (z.B. nur 3 von 7 erwarteten Mikros), aber alle drei korrekt sind, bekommt es Score 1. Eine strengere Heuristik würde "Vollständigkeit" als Kriterium gewichten.
3. **Keine Berücksichtigung der Cypher-Qualität.** Ein syntaktisch schöner Cypher und ein hässlicher aber funktionierender Cypher werden gleich bewertet, sofern sie dasselbe Resultat liefern. Das ist methodisch korrekt (Resultat zählt) aber ignoriert Lesbarkeit als Qualitätsdimension.

Diese drei Grenzen werden in der Diskussion (§11 / Thesis-Kapitel 8) explizit thematisiert.

---

## 9. Stabilitätstest

### 9.1 Methodik

Drei Testfälle (`A1`, `B2`, `C3` — je einer pro Komplexitätsstufe) werden je dreimal hintereinander ausgeführt, alle mit `temperature=0`. Für jeden Lauf werden gespeichert:

- Der vom LLM generierte Cypher-Text
- Der ermittelte Score (0/1/2)

Zwei Stabilitätsmetriken werden daraus abgeleitet:

- **Cypher-Konstanz:** Sind alle drei generierten Cypher-Strings identisch? (Ja/Nein)
- **Score-Konsistenz:** Sind alle drei ermittelten Scores identisch? (Ja/Nein)

### 9.2 Erwartungen

Bei `temperature=0` sollte die Cypher-Generation deterministisch sein. Beobachtungen aus der LLM-Forschungsliteratur zeigen aber, dass selbst mit `temperature=0` minimale Variationen auftreten können, insbesondere bei langen Generationen mit vielen Token-Entscheidungen.

Daher ist die Erwartung:

- **Score-Konsistenz** sollte in 100 % der Fälle gegeben sein, weil Token-Overlap-Scoring tolerant gegenüber kleinen Cypher-Variationen ist (solange das Resultat gleich bleibt).
- **Cypher-Konstanz** kann gelegentlich fehlen, ohne dass die Pipeline-Qualität dadurch leidet.

Im Notebook wird die Stabilität als sichtbares Häkchen-Display dargestellt, sodass im Walkthrough mit eCH-Experten sofort ersichtlich ist, wie stabil die Pipeline arbeitet.

### 9.3 Was der Stabilitätstest nicht misst

Der Stabilitätstest ist eine **intra-session-Stabilität** — dreimal hintereinander in derselben Notebook-Session. Folgende Stabilitäts-Aspekte werden nicht erfasst:

- **Cross-Session-Stabilität:** Erzeugt das LLM in einer Woche oder einem Monat dieselben Cypher? (Wahrscheinlich nicht, da Anthropic im Hintergrund Modell-Updates ausrollt.)
- **Cross-Model-Stabilität:** Wie konsistent sind die Resultate, wenn das Modell von Sonnet auf Opus gewechselt wird? (Nicht systematisch gemessen.)
- **Cross-Prompt-Stabilität:** Wie sensitiv ist das Resultat auf kleine Variationen im System-Prompt? (Nicht gemessen.)

Diese Aspekte werden in §11 / Thesis-Kapitel 8 als Limitationen explizit benannt.

---

## 10. Aggregation und Persistierung

### 10.1 Aggregierte Metriken

Nach Durchlauf aller 12 Testfälle und 9 Stabilitätsläufen werden folgende Aggregate berechnet und in der Notebook-Ausgabe angezeigt:

- **Korrektheit (binär)**: Anteil der Fälle mit `correct = True` (Format: `9/12 = 75.0 %`)
- **Ergebnisqualität (Ø)**: Durchschnittlicher Score über alle Fälle (Format: `1.42 / 2.00`)
- **Pro Anwendungsfall-Klasse**: Korrektheit und Durchschnitts-Score pro Klasse A/B/C/D
- **Pro Komplexitätsstufe**: Korrektheit und Durchschnitts-Score pro Stufe low/mid/high
- **Stabilität**: Tabelle mit den drei untersuchten Testfällen und ihrer Cypher- bzw. Score-Konsistenz

### 10.2 Persistierung in `evaluation_results.json`

Die vollständigen Resultate werden als JSON-Datei abgelegt. Struktur:

```json
{
  "model": "claude-sonnet-4-6",
  "n_cases": 12,
  "korrektheit": 0.75,
  "mean_score": 1.42,
  "stability": [
    { "Test": "A1", "Komplexität": "low", 
      "Cypher konstant": "✓", "Scores": [2, 2, 2], "Score-Konsistenz": "✓" },
    ...
  ],
  "cases": [
    { "id": "A1", "category": "Traceability", "complexity": "low",
      "question": "...", "generated_cypher": "...",
      "score": 2, "correct": true,
      "actual_rows": 1, "expected_rows": 1,
      "error": null, "duration_s": 2.34 },
    ...
  ]
}
```

Diese Datei ist die Datenbasis für die Evaluations-Tabellen in Kapitel 7 der Thesis und wird als Anhang mit eingereicht.

---

## 11. Limitationen und Diskussion

Die folgenden Punkte gehören in Kapitel 8 (Diskussion und Limitationen) der Thesis. Sie sind teils technisch (was die Pipeline nicht kann), teils methodisch (was die Evaluation nicht erfasst):

### 11.1 Technische Limitationen der Pipeline

1. **Keine Self-Correction-Schleife.** Wenn der generierte Cypher einen Syntaxfehler enthält oder ein leeres Resultat liefert, wird er nicht automatisch in einer zweiten Runde an das LLM zurückgegeben für Reparatur. Eine produktive Anwendung würde diesen Self-Correction-Loop einbauen.
2. **Keine Schema-Linting-Vorprüfung.** Die generierte Cypher wird direkt ausgeführt, ohne vorher zu prüfen, ob alle referenzierten Labels und Properties im Graphen tatsächlich existieren. Eine produktive Anwendung würde diese Vorprüfung einbauen.
3. **Keine Resultat-Reflexion.** Bei einem leeren Resultat würde eine produktive Pipeline das LLM bitten, seine Annahmen zu prüfen — oft ist der Grund ein Tippfehler in einer ID.
4. **Schema-Beschreibung ist statisch.** Wenn der Graph erweitert wird (z.B. Cross-References zwischen Mikros), muss `SCHEMA_DE` manuell angepasst werden.

### 11.2 Methodische Limitationen der Evaluation

1. **Kleines Testset (n=12).** Statistisch signifikante Vergleiche zwischen Anwendungsfall-Klassen sind nicht möglich. Die Evaluation ist explizit qualitativ-deskriptiv.
2. **Token-Overlap-Heuristik ist permissiv.** Eine streng formale Alternative würde mehr "echte Fehler" markieren, aber auch mehr "kosmetische Abweichungen" als Fehler.
3. **Keine Inter-Coder-Reliabilität.** Sowohl Testset als auch Bewertungs-Heuristik sind durch eine einzelne Person konstruiert. Eine zweite, unabhängige Bewertung wäre methodisch wünschenswert.
4. **Walkthrough mit eCH-Experten ist nicht systematisch standardisiert.** Es ergänzt die quantitative Evaluation um qualitative Einsichten, ist aber nicht selber als Validierungsexperiment formalisiert.

### 11.3 Limitationen des zugrundeliegenden Graphen

1. **Nicht-modellierte Querverweise** zwischen Mikros (HTTP↔SSL, FTP↔SSH, SOAP↔WSDL): Fragen, die solche Verweise voraussetzen, sind prinzipiell nicht korrekt beantwortbar.
2. **Single-Version-Modell** (V8.0): Versionsdifferenz-Fragen wie "was hat sich von V7 zu V8 geändert?" sind im aktuellen Modell nicht abfragbar.
3. **Reference-Splitting ist konservativ-heuristisch** (siehe Step-2-Doku): manche gemischte Reference-Labels bleiben gröber als ideal, was Impact-Analysen einschränken kann.

---

## 12. Quantitative Übersicht (typischer Lauf)

| Metrik | Typischer Wert (V8.0 + Sonnet 4.6) |
| --- | --- |
| Korrektheit (binär) | 70–85 % (8–10 von 12 korrekt) |
| Ergebnisqualität (Ø) | 1.2–1.6 (auf 0–2 Skala) |
| Cypher-Konstanz im Stabilitätstest | 100 % (3/3) bei `temperature=0` |
| Score-Konsistenz im Stabilitätstest | 100 % (3/3) |
| Laufzeit gesamt (12 Fälle + 9 Stabilitätsläufe) | ~70–90 Sekunden |
| API-Kosten pro Lauf | ca. CHF 0.15–0.30 |

Diese Werte sind Erwartungsbereiche; die tatsächlichen Resultate werden im Anhang der Thesis aus `evaluation_results.json` reproduziert.

---

## 13. Bezug zur Thesis-Disposition

| Disposition-Kapitel | Inhalt aus diesem Dokument |
| --- | --- |
| §3 Theoretischer Rahmen | §3 (Text-to-Query, Few-Shot-Prompting, Alternative-Diskussion) |
| §4 Methodik | §4 (Architektur), §7 (Testset), §8 (Bewertungsmethodik), §9 (Stabilitätstest) |
| §5 Hauptartefakt | Das gesamte Dokument beschreibt das Hauptartefakt |
| §6 Implementation | §4.3 (Generator-Skript), §5 (System-Prompt-Design), §6 (Designentscheidungen) |
| §7 Evaluation | §8 (Bewertungsmethodik), §10 (Aggregation), §12 (Resultate) |
| §8 Diskussion / Limitationen | §11 (Limitationen technisch + methodisch + Graph-bedingt) |
| §9 Ausblick | §11.1 (Self-Correction-Loop, Schema-Linting, Resultat-Reflexion, Cross-References) |

---

## Anhang A: Vollständige Pipeline-Signatur

```python
# Setup
import os, json, time
from dataclasses import dataclass
import pandas as pd
from anthropic import Anthropic
from neo4j import GraphDatabase

neo4j_driver       = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
anthropic_client   = Anthropic()
MODEL              = "claude-sonnet-4-6"

# Pipeline
def build_system_prompt() -> str: ...
def extract_cypher(text: str) -> str: ...
def generate_cypher(question: str, temperature: float = 0.0) -> str: ...
def execute_cypher(query: str) -> tuple[list[dict], str | None]: ...

# Scoring
def _flatten_tokens(value) -> set[str]: ...
def _row_tokens(record: dict) -> set[str]: ...
def _significant(tokens: set[str], min_len: int = 3) -> set[str]: ...
def score_results(actual, expected) -> int: ...

# Evaluation
@dataclass
class EvalResult:
    test_id: str
    category: str
    complexity: str
    question: str
    generated_cypher: str
    error: str | None
    actual_rows: int
    expected_rows: int
    score: int
    correct: bool
    duration_s: float

def run_test_case(case: dict, temperature: float = 0.0) -> EvalResult: ...
```

## Anhang B: System-Prompt-Template (gekürzt)

```text
Du bist ein Experte für Neo4j Cypher-Abfragen (Neo4j 5). Generiere
syntaktisch korrekte und ausführbare Cypher-Abfragen für den folgenden
Wissensgraphen.

{schema}

REGELN:
1. Antworte AUSSCHLIESSLICH mit der Cypher-Abfrage. ...
2. Nutze nur die im Schema definierten Labels und Beziehungen.
3. normative_status-Werte und Interface-IDs müssen exakt ... (Kleinschreibung)
4. Bei eindeutigen Mikro-Bausteinen wie "HTTP", "SOAP", "LDAP", "REST"
   bevorzuge die exakte ID-Übereinstimmung ...
5. Bei alternativen Beziehungstypen verwende die Neo4j-5-Syntax
   [:HAS_VARIANT|HAS_ALTERNATIVE] (OHNE zweiten Doppelpunkt).
6. Bei Resultaten: gib bei Entitäten möglichst BEIDE id UND title zurück, ...

BEISPIELE:
{examples}
```

---

## Verwandte Dokumente

| Dokument | Bezug zu diesem Step |
| --- | --- |
| *Kodierungsschema* (Step 1) | Liefert die Datenbasis im JSON-Format |
| *Neo4j-Import* (Step 2) | Liefert den abfragbaren Graphen |
| `nl_to_cypher.ipynb` | Die ausführbare Implementation |
| `baseline_queries.cypher` | Ground-Truth-Cypher-Referenz, parallel zu den Testfällen |
| `evaluation_results.json` | Output eines Pipeline-Laufs, Thesis-Anhang |
