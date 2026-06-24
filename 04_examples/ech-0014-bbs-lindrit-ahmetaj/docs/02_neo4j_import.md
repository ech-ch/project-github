# Neo4j-Import: Von JSON zum Wissensgraphen

**Bachelor-Thesis ZHAW** · *Prototypische Modellierung dokumentenzentrierter Architekturstandards als Wissensgraph*  
Autor: Lindrit Ahmetaj · Betreuung: Maria Rothstein  
Dokumentversion: 1.0 · Step 2 der Implementations-Pipeline

---

## 1. Zweck und Geltungsbereich

Dieses Dokument beschreibt Step 2 der Implementations-Pipeline: die deterministische Überführung der strukturierten Building-Block-Repräsentation (`building_blocks.json`) in einen Neo4j-Wissensgraphen. Während Step 1 (siehe Dokument *Kodierungsschema und Konvertierungsdokumentation*) eine **manuelle** Modellierungsleistung war, ist Step 2 **vollständig automatisiert** und idempotent.

Das resultierende Graph-Artefakt ist die Datengrundlage für Step 3 (NL→Cypher-Pipeline) und damit die Voraussetzung für das Hauptartefakt der Thesis.

> **PDF (Quelldokument)** → **Excel (Erfassungsvorlage)** → **JSON (strukturierte Repräsentation)** → **Neo4j (Wissensgraph)** → NL-Pipeline → Evaluation

Step 2 ist die zentrale Stelle in der Pipeline, an der ein **Paradigmenwechsel** stattfindet: die Daten verlassen die hierarchische Welt der verschachtelten Strukturen (JSON) und werden zu einem Graphen mit benannten Knoten und gerichteten, typisierten Kanten. Dieser Wechsel ist nicht nur technisch — er ändert, welche Fragen man stellen kann und wie effizient sie beantwortbar sind. Die Begründung dieses Paradigmenwechsels gehört in Kapitel 3 (Theoretischer Rahmen) oder 4 (Methodik) der Thesis.

---

## 2. Eingabe und Ausgabe

| Aspekt | Eingabe | Ausgabe |
| --- | --- | --- |
| Artefakt | `building_blocks.json` | Neo4j-5-Datenbank |
| Format | Hierarchisches JSON (Dokumentmodell) | Property Graph |
| Speicherort | Dateisystem | Container-Volume `./neo4j_data/` |
| Zugriff | Lesen via `json.load()` | Bolt-Protokoll `bolt://localhost:7687` |
| Schema | Implizit (siehe Step-1-Doku §8) | Explizit deklariert (Constraints, Indexes) |
| Verwendung | Manuell les- und editierbar | Maschinell abfragbar via Cypher |

Das Import-Skript `import_saga.py` ist der einzige Berührungspunkt zwischen diesen beiden Welten. Es liest das JSON und erzeugt durch eine Folge von Cypher-Schreiboperationen den Graphen.

---

## 3. Paradigmenwechsel: Hierarchie → Graph

### 3.1 Was sich konzeptionell ändert

Die JSON-Struktur drückt die SAGA.ch-Inhalte als **Baum** aus: ein Document enthält Macros, jeder Macro enthält Mesos, jeder Meso enthält Mikros — und so weiter. Diese Hierarchie ist intuitiv und nahe am Aufbau des PDF-Quelldokuments.

Im Graph-Modell verschwinden zwei wesentliche Einschränkungen dieser Hierarchie:

1. **Eltern-Kind-Beziehungen sind nicht mehr exklusiv strukturell.** Ein Mikro kann nicht nur via `CONTAINS` zu seinem Meso, sondern via `REFERENCES` zu beliebig vielen externen Standards und via `APPLIES_TO` zu beliebig vielen Schnittstellen verbunden sein. Diese Querverbindungen waren im JSON nur als eingebettete Arrays vorhanden; im Graphen werden sie zu eigenständigen, traversierbaren Kanten.

2. **Externe Standards werden zu eigenständigen Entitäten.** Im JSON erscheint ein und dasselbe IETF RFC 7540 nur als String-Label in mehreren `references`-Arrays. Im Graphen wird daraus ein einziger `External_Standard`-Knoten, auf den mehrere Mikros oder Varianten verweisen. Damit werden Impact-Analysen ("Welche Mikros würden von einer Änderung an RFC 7540 betroffen sein?") überhaupt erst direkt abfragbar.

Dieser zweite Punkt — die **Promotion externer Standards zu eigenen Knoten** — ist eine zentrale konzeptionelle Designentscheidung der Arbeit (siehe §5, Entscheidung D2).

### 3.2 Property-Graph-Modell von Neo4j

Neo4j implementiert das **Property-Graph-Modell**, das sich an drei Stellen vom strengen Beziehungsmodell relationaler Datenbanken und vom RDF-Tripel-Modell des semantischen Webs unterscheidet:

| Aspekt | Property Graph | Relational | RDF |
| --- | --- | --- | --- |
| Knoten haben Labels | Mehrere möglich | Eine Tabelle = ein Typ | Klassen via `rdf:type` |
| Knoten haben Properties | Beliebige Key-Value-Paare | Feste Spalten pro Tabelle | Properties als eigene Tripel |
| Kanten sind eigenständig | Ja, mit Typ und Properties | Implizit durch Foreign Keys | Tripel sind die Kanten |
| Kanten haben Properties | Ja | Nein (nur via Verknüpfungstabelle) | Nur via Reifikation |

Diese drei Eigenschaften erlauben in deinem Wissensgraphen wesentliche Modellierungen, die in anderen Paradigmen umständlicher wären:

- **Doppellabels** für Macros/Mesos/Mikros: alle tragen sowohl `:Building_Block` als auch ihr Level-Label. Damit sind sowohl level-spezifische Abfragen (`MATCH (m:Mikro)`) als auch level-übergreifende (`MATCH (b:Building_Block)`) möglich.
- **Properties auf Kanten**: `[:APPLIES_TO {normative_status: "dringend empfohlen"}]` trägt die Bewertung direkt auf der Kante, ohne einen separaten Bewertungsknoten anlegen zu müssen.
- **Polymorphe Beziehungen** mit Property-Diskriminator: dieselbe `[:REFERENCES]`-Kante wird sowohl von Mikros, Variants als auch Alternatives ausgehend verwendet, und das Property `reference_type` unterscheidet die Kategorie.

---

## 4. Das Neo4j-Schema

### 4.1 Knotentypen (mit Labels und Properties)

Acht Knotentypen wurden definiert. Sieben davon werden aus dem JSON gespeist; das achte (`:Interface`) ist eine fixe Referenz mit drei Knoten S1/S2/S3.

| Label | Doppellabel | Properties (Pflicht ✓) | Anzahl im V8.0-Graphen |
| --- | --- | --- | ---: |
| `Document` | — | `id ✓`, `title ✓`, `version ✓` | 1 |
| `Building_Block:Macro` | ✓ | `id ✓`, `title ✓`, `semantic_summary` | 4 |
| `Building_Block:Meso` | ✓ | `id ✓`, `title ✓`, `semantic_summary` | 32 |
| `Building_Block:Mikro` | ✓ | `id ✓`, `title ✓`, `semantic_summary`, `notes` (optional, Array) | 186 |
| `Variant` | — | `id ✓`, `title ✓` | 113 |
| `Alternative` | — | `id ✓`, `title ✓` | 14 |
| `External_Standard` | — | `key ✓`, `label`, `organization`, `url` | ~330 |
| `Interface` | — | `id ✓` (`S1` / `S2` / `S3`), `description` | 3 |

Die Doppellabel-Strategie (`Building_Block:Macro` etc.) erlaubt es, mit einer einzigen Abfrage `MATCH (b:Building_Block)` alle Hierarchieebenen gemeinsam zu adressieren, ohne auf Spezifität bei `MATCH (m:Mikro)` zu verzichten. Dies ist eine bewusste Schema-Entscheidung mit operativer Konsequenz für die spätere Cypher-Generierung.

### 4.2 Beziehungstypen (mit Properties)

Sieben Beziehungstypen wurden definiert:

| Beziehung | Quell-Label(s) | Ziel-Label | Properties | Bedeutung |
| --- | --- | --- | --- | --- |
| `[:DEFINES]` | `Document` | `Macro` | — | Wurzel-Beziehung: das Dokument definiert die vier Domänen |
| `[:CONTAINS]` | `Macro`, `Meso` | `Meso`, `Mikro` | — | Strukturelle Hierarchie |
| `[:HAS_VARIANT]` | `Mikro` | `Variant` | — | Versionsbeziehung |
| `[:HAS_ALTERNATIVE]` | `Mikro` | `Alternative` | — | Funktionale Alternative |
| `[:REFERENCES]` | `Mikro`, `Variant`, `Alternative` | `External_Standard` | `reference_type` (z.B. `standard`, `rfc`, `specification_url`) | Verweis auf externen Standard |
| `[:APPLIES_TO]` | `Mikro`, `Variant`, `Alternative` | `Interface` | `normative_status` (`dringend empfohlen` / `empfohlen` / `unter beobachtung` / `nicht empfohlen`) | Normative Bewertung pro Schnittstelle |

Insgesamt erzeugt der V8.0-Import rund **1300 Beziehungen** auf den 700 Knoten.

### 4.3 Constraints und Indexes

Das Skript deklariert beim Initialisieren das folgende Schema:

```cypher
CREATE CONSTRAINT doc_id   IF NOT EXISTS FOR (d:Document)          REQUIRE d.id  IS UNIQUE
CREATE CONSTRAINT bb_id    IF NOT EXISTS FOR (b:Building_Block)    REQUIRE b.id  IS UNIQUE
CREATE CONSTRAINT var_id   IF NOT EXISTS FOR (v:Variant)           REQUIRE v.id  IS UNIQUE
CREATE CONSTRAINT alt_id   IF NOT EXISTS FOR (a:Alternative)       REQUIRE a.id  IS UNIQUE
CREATE CONSTRAINT ext_key  IF NOT EXISTS FOR (e:External_Standard) REQUIRE e.key IS UNIQUE
CREATE CONSTRAINT iface_id IF NOT EXISTS FOR (i:Interface)         REQUIRE i.id  IS UNIQUE
CREATE INDEX bb_title      IF NOT EXISTS FOR (b:Building_Block)    ON (b.title)
CREATE INDEX var_title     IF NOT EXISTS FOR (v:Variant)           ON (v.title)
CREATE INDEX ext_org       IF NOT EXISTS FOR (e:External_Standard) ON (e.organization)
```

Die Eindeutigkeits-Constraints sind **konstitutiv für die Idempotenz** des Imports: weil `id` (bzw. `key`) eindeutig ist, kann `MERGE` zuverlässig zwischen "bereits vorhanden" und "neu anlegen" entscheiden. Ohne diese Constraints wäre `MERGE` semantisch nicht idempotent.

Die `INDEX`-Deklarationen optimieren die spätere Abfrage-Performance — insbesondere im Notebook-Test (Step 3), wo häufig nach Titel-Fragmenten und Organisation gesucht wird.

### 4.4 Schema-Schaubild

```
                           ┌─────────────┐
                           │  Document   │
                           └──────┬──────┘
                                  │ :DEFINES
                                  ▼
                           ┌─────────────┐
                           │   :Macro    │
                           │ (4 Knoten)  │
                           └──────┬──────┘
                                  │ :CONTAINS
                                  ▼
                           ┌─────────────┐
                           │   :Meso     │
                           │ (32 Knoten) │
                           └──────┬──────┘
                                  │ :CONTAINS
                                  ▼
                           ┌─────────────┐
            ┌─────────────►│   :Mikro    │◄─────────────┐
            │              │ (186 Knoten)│              │
            │  :HAS_VARIANT└─────┬───────┘:HAS_ALTERN.  │
            │                    │                      │
   ┌────────┴────────┐           │              ┌───────┴────────┐
   │   :Variant      │           │              │ :Alternative   │
   │  (113 Knoten)   │           │              │  (14 Knoten)   │
   └────────┬────────┘           │              └────────┬───────┘
            │ :REFERENCES        │ :REFERENCES           │ :REFERENCES
            │ :APPLIES_TO        │ :APPLIES_TO           │ :APPLIES_TO
            ▼                    ▼                       ▼
       ┌──────────────────────────────────────────────────────┐
       │              :External_Standard                       │
       │              (~330 Knoten)                            │
       │              :Interface (S1, S2, S3)                  │
       └──────────────────────────────────────────────────────┘
```

Die polymorphen Kanten `:REFERENCES` und `:APPLIES_TO` gehen von drei unterschiedlichen Quell-Knotentypen aus — eine Eigenschaft, die im relationalen Modell zusätzliche Vermittlungstabellen verlangen würde, im Graphen aber natürlich abbildbar ist.

---

## 5. Sechs Designentscheidungen

Die folgenden sechs Entscheidungen wurden während der Schema-Definition und Import-Implementation getroffen und im Quellcode-Header von `import_saga.py` explizit dokumentiert. Sie gehören in Kapitel 6 (Implementation) der Thesis und sollten dort begründet werden.

### D1 — Single-Version-Graph (V8.0)

Das aktuelle Schema modelliert nur eine einzige Version des Standards. Die Versions-Information wird ausschliesslich am `:Document`-Knoten gespeichert (`d.version = "8.0"`). Building-Block-Knoten tragen keine Versions-Property.

**Begründung:** Reduktion der Modellkomplexität. Wenn später V9.0 dazukommt, kann das Schema rückwärtskompatibel erweitert werden, indem an Building-Block-Knoten eine `version`-Property eingeführt und im `MERGE`-Pattern berücksichtigt wird. Solange nur eine Version existiert, würde diese Property reine Redundanz darstellen.

**Trade-off:** Die Single-Version-Annahme verhindert, dass im jetzigen Modell Versions-Diff-Queries möglich sind ("Was hat sich von V8 zu V9 geändert?"). Dies ist eine bewusste Vereinfachung für die Bachelor-Thesis.

### D2 — Idempotenter Import (`MERGE` statt `CREATE`)

Jede Schreiboperation im Skript verwendet `MERGE` statt `CREATE`. Mehrfache Ausführungen auf demselben JSON führen zum identischen Graphen.

**Begründung:** Idempotenz ist eine notwendige Eigenschaft für die Reproduzierbarkeit der Pipeline (Disposition §4.3.1, Stabilitätsmetrik). Sie ermöglicht ausserdem inkrementelle Updates: wenn nach einer Korrektur am JSON nur einzelne Mikros geändert wurden, kann der gesamte Import einfach erneut ausgeführt werden, ohne die Datenbank zu löschen.

**Voraussetzung:** Die Eindeutigkeits-Constraints aus §4.3 — ohne sie wäre `MERGE` nicht atomar idempotent.

### D3 — Empty-Scope-Broadcasting

Wenn ein Assessment im JSON eine leere `interface_scope`-Liste hat (z.B. bei den Mikros *Telnet* oder *CORBA*, die im PDF mit "Nicht empfohlen" ohne expliziten Schnittstellen-Verweis gekennzeichnet sind), wird die Bewertung im Graphen auf alle drei Schnittstellen S1, S2 und S3 verteilt.

**Begründung:** Die SAGA.ch-Semantik für "kein Scope aufgeführt" ist *global gültig*. Die Übersetzung im JSON als leerer Array würde diese Information verlieren — der Graph würde dann *keine* `APPLIES_TO`-Kanten zeigen, was inhaltlich falsch wäre. Durch das Broadcasting wird sichergestellt, dass die Bewertung in jeder Schnittstellen-spezifischen Abfrage gefunden wird.

**Code-Stelle:** Funktion `upsert_assessments()` in `import_saga.py`.

### D4 — Konservatives Reference-Splitting

Eine `references`-Zeile mit dem Label `"RFC 1939, RFC 2449, RFC 6186"` enthält semantisch drei separate externe Standards. Das Skript splittet solche Labels in einzelne `External_Standard`-Knoten — aber nur, **wenn die Splitting-Heuristik hohe Konfidenz hat**.

Konkret splittet das Skript nur dann, wenn mindestens 70 % der durch Komma getrennten Tokens mit einem bekannten Präfix beginnen (`RFC`, `ISO`, `IEEE`, `ITU`, `W3C`, `OASIS`, ...). Andernfalls wird der gesamte Label als ein einziger Standard belassen.

**Begründung:** Aggressives Splitting würde Freitext-Anmerkungen mit Kommata fälschlich zerlegen ("Eine Beschreibung, die Kommata enthält"). Konservatives Splitting akzeptiert, dass manche gemischte Labels gröber bleiben als ideal — aber niemals fälschlich aufgespalten werden.

**Code-Stelle:** Funktion `split_references()` in `import_saga.py`, dort dokumentiert mit Doctest-Beispielen.

### D5 — Anmerkungen werden zu `notes`, nicht zu Standards

Reference-Zeilen mit `reference_type` ∈ {`anmerkung`, `bemerkung`, `information`} sind im PDF kommentierende Querverweise oder Sicherheitshinweise — keine autoritativen externen Standards. Sie werden daher **nicht** zu `:External_Standard`-Knoten promoviert, sondern als Strings in der `notes`-Array-Property des übergeordneten Mikro-Knotens gespeichert.

**Begründung:** Saubere Trennung autoritativer Referenzen (externe Standards, die als Knoten Impact-Analysen ermöglichen) von informellen Anmerkungen (Freitext zur menschlichen Lektüre). Dies hält die `External_Standard`-Knoten-Tabelle "rein" für ihre eigentliche Funktion.

**Trade-off:** Anmerkungen verlieren ihre Verknüpfung zur spezifischen Variante/Alternative — sie werden auf der Mikro-Ebene gesammelt. Im V8.0-Datensatz ist das eine akzeptable Vereinfachung.

### D6 — Platzhalter-Normalisierung

Werte wie `-`, `.`, `n`, `N`, `""` werden während des Imports in `null` umgewandelt. Damit landen im Graphen nur tatsächliche Werte, keine Platzhalter-Strings.

**Begründung:** In der Excel-Erfassung sind Bindestriche und Punkte häufig verwendete Platzhalter für "keine Information vorhanden". Würden sie 1:1 in den Graphen übernommen, würde z.B. `MATCH (e:External_Standard {organization:'-'})` Knoten zurückliefern — was logisch falsch wäre. Die Normalisierung ist die Garantie, dass leere Werte konsistent als leer behandelt werden.

**Code-Stelle:** Funktion `clean()` in `import_saga.py`.

---

## 6. Algorithmus des Imports

### 6.1 Drei Phasen

Der Import läuft in drei sequenziellen Phasen:

**Phase 1: Schema-Setup**

- Constraints und Indexes anlegen (siehe §4.3)
- Die drei Interface-Knoten S1/S2/S3 anlegen
- Den Document-Knoten anlegen

Diese Phase ist konstant: sie produziert immer dasselbe Resultat, unabhängig vom JSON-Inhalt.

**Phase 2: Hierarchischer Durchlauf**

Das Skript iteriert von oben nach unten durch die JSON-Hierarchie:

```
for jedes Macro in building_blocks:
    upsert Macro
    erzeuge Beziehung Document --DEFINES--> Macro
    
    for jedes Meso in meso_blocks:
        upsert Meso
        erzeuge Beziehung Macro --CONTAINS--> Meso
        
        for jedes Mikro in mikro_blocks:
            upsert Mikro
            erzeuge Beziehung Meso --CONTAINS--> Mikro
            
            verarbeite References von Mikro
            verarbeite Assessments von Mikro
            
            for jede Variant von Mikro:
                upsert Variant
                erzeuge Beziehung Mikro --HAS_VARIANT--> Variant
                verarbeite References von Variant
                verarbeite Assessments von Variant
            
            for jede Alternative von Mikro:
                upsert Alternative
                erzeuge Beziehung Mikro --HAS_ALTERNATIVE--> Alternative
                verarbeite References von Alternative
                verarbeite Assessments von Alternative
            
            speichere gesammelte Notes am Mikro
```

**Phase 3: Smoke-Test (`graph_summary`)**

Nach Abschluss zählt das Skript Knoten pro Label und Beziehungen pro Typ. Diese Zahlen werden im Terminal ausgegeben und können gegen die Erwartungswerte aus §10 abgeglichen werden — eine sofortige Vollständigkeits-Prüfung des Imports.

### 6.2 Idempotenz durch MERGE

Jede Schreiboperation verwendet `MERGE` statt `CREATE`. Die Semantik von `MERGE` ist:

> Wenn ein Knoten mit dieser Eigenschaft bereits existiert, verwende ihn. Andernfalls erzeuge ihn.

Konkret für einen Mikro-Knoten:

```cypher
MERGE (b:Building_Block:Mikro {id: 'bb_mi_http'})
SET   b.title = 'Hyper Text Transfer Protocol, HTTP',
      b.semantic_summary = 'Für die Web-Kommunikation muss HTTP...'
```

Beim ersten Lauf wird der Knoten angelegt. Beim zweiten, dritten und tausendsten Lauf wird derselbe Knoten gefunden, und nur die Properties werden überschrieben — was bei unveränderten Daten ein Noop ist.

Analog für Beziehungen:

```cypher
MATCH (p:Meso {id: 'bb_me_anwendungsprotokolle'})
MATCH (b:Mikro {id: 'bb_mi_http'})
MERGE (p)-[:CONTAINS]->(b)
```

Wenn die Kante schon existiert, wird sie nicht dupliziert.

### 6.3 Transaktionsstrategie

Jede einzelne Schreiboperation läuft in einer **eigenen Transaktion** (`session.execute_write(...)`). Bei einem Import von rund 700 Knoten und 1300 Kanten ergeben sich damit etwa 2000 Transaktionen.

**Trade-off:** Diese feingranulare Transaktionsstrategie ist nicht maximal performant — eine batchweise Ausführung mit `UNWIND` über grosse Arrays wäre schneller. Sie ist aber **deutlich robuster** gegenüber teilweisen Fehlern: wenn eine einzelne Mikro-Zeile aufgrund inkonsistenter Daten fehlschlägt, wird sie skippt, und der Rest des Imports läuft weiter. Bei einem Bachelor-Thesis-Datensatz von dieser Grösse ist die Robustheit wichtiger als die Performance — der gesamte Import dauert auf einem M4 MacBook Air rund 10 Sekunden.

---

## 7. Cypher-Pattern für jeden Schritt

In diesem Abschnitt sind die zentralen Cypher-Statements aus `import_saga.py` aufgeführt, mit kurzer Erläuterung der jeweiligen Konstruktion.

### 7.1 Document-Knoten

```cypher
MERGE (d:Document {id: $id})
SET   d.title = $title,
      d.version = $version
```

Einfacher Knoten, kein Doppellabel, eindeutig durch `id`. Beim ersten Aufruf angelegt, danach idempotent.

### 7.2 Macro mit Document-Verbindung

```cypher
MERGE (b:Building_Block:Macro {id: $id})
SET   b.title = $title,
      b.semantic_summary = $summary
WITH b
MATCH (d:Document {id: $did})
MERGE (d)-[:DEFINES]->(b)
```

Das `WITH b` ist eine Cypher-Eigenheit: es führt das Ergebnis der ersten Klausel weiter in die nächste. Damit wird sichergestellt, dass die `DEFINES`-Kante nur entsteht, wenn der Macro-Knoten erfolgreich gemerged wurde.

### 7.3 Meso und Mikro analog

Identisches Muster wie Macro, mit `Meso` bzw. `Mikro` als Doppellabel und der Parent-Beziehung über `CONTAINS`.

### 7.4 Variant unter einem Mikro

```cypher
MERGE (v:Variant {id: $vid})
SET   v.title = $title
WITH v
MATCH (m:Mikro {id: $mid})
MERGE (m)-[:HAS_VARIANT]->(v)
```

### 7.5 Reference mit Splitting

Die komplexeste Stelle:

```cypher
MERGE (e:External_Standard {key: $key})
ON CREATE SET e.label = $key, e.organization = $org, e.url = $url
ON MATCH  SET e.organization = coalesce(e.organization, $org),
              e.url          = coalesce(e.url, $url)
WITH e
MATCH (s:Variant {id: $sid})        -- oder :Mikro / :Alternative
MERGE (s)-[r:REFERENCES]->(e)
SET   r.reference_type = $rtype
```

Drei Besonderheiten:

1. **`ON CREATE` / `ON MATCH` differenzieren** das Verhalten zwischen erstmaliger Anlage und späterem Wiederfinden. Beim ersten Anlegen wird das Label gleich dem `key` gesetzt (Fallback). Beim Wiederfinden werden bestehende Werte nicht überschrieben — nur ergänzt, falls vorher leer (`coalesce`).
2. **Das Quell-Label `:Variant` wird dynamisch eingesetzt** (`source_label` im Python-Code). Dieselbe Funktion wird mit `:Mikro`, `:Variant` oder `:Alternative` aufgerufen — siehe §8.2.
3. **Vorher wurde der Label-String durch `split_references()` getokenisiert** (D4). Wenn drei Tokens entstehen, wird das Pattern dreimal mit unterschiedlichem `$key` ausgeführt — drei separate `External_Standard`-Knoten werden erzeugt und drei `REFERENCES`-Kanten zur Quelle angelegt.

### 7.6 Assessment mit Broadcasting

```cypher
MATCH (s:Variant {id: $sid})            -- oder :Mikro / :Alternative
MATCH (i:Interface {id: $iid})
MERGE (s)-[a:APPLIES_TO {normative_status: $status}]->(i)
```

Hier ist die polymorphe Eigenschaft besonders sichtbar: dieselbe Beziehungs-Konstruktion wird mit `:Mikro`, `:Variant` und `:Alternative` als Quell-Label aufgerufen. Vor dem Cypher-Aufruf normalisiert der Python-Code den Status (`lower()`) und expandiert leere Scopes auf S1+S2+S3 (D3).

### 7.7 Notes-Sink

Notes (Anmerkungen, D5) werden während des Imports der References pro Mikro in einer Python-Liste gesammelt. Am Ende der Mikro-Verarbeitung werden sie persistiert:

```cypher
MATCH (m:Mikro {id: $mid})
SET   m.notes = $notes
```

`$notes` ist eine Python-Liste von Strings; Neo4j unterstützt natürlich Array-Properties.

---

## 8. Schwierige Stellen

### 8.1 Heuristisches Reference-Splitting

Die Funktion `split_references()` ist die einzige Stelle im Import-Skript, an der eine **heuristische Entscheidung** getroffen wird. Sie illustriert das Designprinzip "konservativ bei Unsicherheit":

```python
def split_references(label: str) -> list[str]:
    if "," not in label:
        return [label]
    tokens = [t.strip() for t in label.split(",")]
    matches = sum(1 for t in tokens if REFERENCE_PREFIX.match(t))
    if matches >= max(2, int(len(tokens) * 0.7)):
        return tokens
    return [label]
```

Konkrete Verhalten:

| Eingabe | Ausgabe | Begründung |
| --- | --- | --- |
| `"RFC 1939, RFC 2449"` | `["RFC 1939", "RFC 2449"]` | 2/2 Tokens matchen → splitten |
| `"RFC 791, RFC 951, TCP RFC 793, UDP RFC 768"` | 4 Tokens | 4/4 matchen → splitten |
| `"ISO/IEC 9834"` | `["ISO/IEC 9834"]` | Kein Komma → ein Token |
| `"Some free-text description, with commas"` | `["Some free-text description, with commas"]` | 0/2 matchen → nicht splitten |

Diese Heuristik akzeptiert eine systematische Schwäche: gemischte Labels wie `"Sicheres Mailing (gemäss S/MIME), RFC 8551"` werden NICHT gesplittet, weil das erste Token nicht mit einem bekannten Präfix beginnt — der zweite Standard (RFC 8551) erscheint dann nicht als eigener `External_Standard`-Knoten. Diese Limitation ist in §10 der Thesis-Diskussion als bekannte Schwäche zu erwähnen.

### 8.2 Polymorphe Quell-Labels in Python-Strings

Die Funktionen `upsert_references()` und `upsert_assessments()` werden mit drei unterschiedlichen Quell-Labels aufgerufen: einmal mit `"Mikro"`, einmal mit `"Variant"`, einmal mit `"Alternative"`. Der Cypher-Code enthält dieses Label nicht als Parameter, sondern als Python-f-string:

```python
tx.run(
    f"""
    MATCH (s:{source_label} {{id:$sid}})
    ...
    """,
    sid=source_id, ...
)
```

**Hinweis:** Dies ist die einzige Stelle, wo eine Python-Variable in den Cypher-String interpoliert wird. Da `source_label` ausschliesslich aus einem festen, internen Set von Werten kommt (`"Mikro"`, `"Variant"`, `"Alternative"`), ist dies kein Injection-Risiko. Für externe Input-Werte würde diese Pattern nicht verwendet werden — dort sind Cypher-Parameter (`$xxx`) zwingend.

### 8.3 Anmerkungen werden zu `notes` am Mikro gesammelt

Das Skript führt während der gesamten Mikro-Verarbeitung eine lokale Python-Liste `notes` mit, die als Sammelbehälter dient:

```python
notes: list[str] = []
counts["references"] += session.execute_write(
    upsert_references, "Mikro", mi["id"], 
    mi.get("references", []), notes,  # ← Liste wird mitgegeben
)
```

Innerhalb von `upsert_references()` werden Anmerkungs-Einträge (D5) an diese Liste angehängt statt zu Knoten zu werden. Am Ende der Mikro-Verarbeitung wird die Liste an die `notes`-Property des Mikros persistiert.

Konsequenz: Wenn eine Variante eines Mikros eine Anmerkung trägt, landet diese Anmerkung trotzdem auf der Mikro-Ebene (nicht auf der Variant-Ebene). Dies ist eine bewusste Vereinfachung — siehe Trade-off-Hinweis in D5.

### 8.4 Empty-Scope-Broadcasting

```python
scope = ass.get("interface_scope") or []
if not scope:
    scope = ["S1", "S2", "S3"]
```

Drei Zeilen Code, aber semantisch zentral: SAGA.ch differenziert in den meisten Fällen explizit, für welche Schnittstellen eine Bewertung gilt. Wenn die Differenzierung fehlt, ist die Bewertung global gültig. Die Übersetzung in den Graphen als "drei separate Kanten zu S1, S2, S3" macht diese Globalität explizit abfragbar.

### 8.5 Status-Normalisierung

Im Excel-Erfassungsschema sind Status-Werte teilweise in unterschiedlicher Schreibweise vorhanden:

- `"dringend empfohlen"`
- `"Dringend empfohlen"`
- `"DRINGEND EMPFOHLEN"`
- `"unter Beobachtung"` vs. `"unter beobachtung"`

Im Skript werden alle Status-Werte mittels `.lower()` in eine einheitliche Kleinschreibung gebracht, bevor sie an Cypher übergeben werden. Da Cypher (und Neo4js Property-Vergleich) **case-sensitiv** ist, würde sonst eine Abfrage wie `WHERE a.normative_status = 'dringend empfohlen'` einige Treffer übersehen.

---

## 9. Validierung des Imports

### 9.1 `graph_summary()` als Smoke-Test

Am Ende jedes Imports gibt das Skript automatisch eine Übersicht der Knoten- und Beziehungs-Counts aus:

```
Node counts:
  Building_Block:Mikro                     186
  External_Standard                        ~330
  Building_Block:Meso                       32
  Variant                                  113
  Alternative                               14
  Building_Block:Macro                       4
  Interface                                  3
  Document                                   1

Relationship counts:
  APPLIES_TO                               ~640
  REFERENCES                               ~340
  CONTAINS                                 218
  HAS_VARIANT                              113
  HAS_ALTERNATIVE                           14
  DEFINES                                    4
```

Diese Zahlen werden gegen die Erwartungswerte aus §10 abgeglichen.

### 9.2 `baseline_queries.cypher` als Funktionstest

Über die Smoke-Counts hinaus enthält die Datei `baseline_queries.cypher` rund 17 Cypher-Abfragen, organisiert nach den vier Anwendungsfall-Klassen:

- **A — Traceability**: Vollständige Pfade vom Document zu spezifischen Mikros, Auflistung aller referenzierten Standards eines Mikros, normative Klassifikation
- **B — Dependency / Impact**: Rückwärts-Lookup ("welche BBs referenzieren RFC 7230?"), Standards mit hoher Dependency, Top-Organisationen
- **C — Normative**: Status-Verteilungen, alle dringend empfohlenen BBs für eine Schnittstelle
- **D — Coverage**: Knoten-Hygiene, fehlende Bewertungen

Diese Abfragen erfüllen drei Funktionen gleichzeitig:

1. **Verifikation des Imports** — wenn alle Smoke-Tests und Baseline-Queries plausible Resultate liefern, ist der Graph strukturell korrekt
2. **Referenzlösungen für Step 3** — diese Queries sind die Ground Truth, gegen die das NL→Cypher-Ergebnis verglichen wird
3. **Belege für die Ausdruckskraft des Modells** — sie demonstrieren, dass die vier Anwendungsfall-Klassen abgedeckt sind, was eine zentrale These der Arbeit ist

### 9.3 Was nicht validiert wird

Das Import-Skript prüft **keine** semantische Korrektheit der Daten. Wenn das JSON inhaltlich falsche Bewertungen enthält (z.B. ein Mikro fälschlich als "dringend empfohlen" markiert), wird der Graph diese fehlerhafte Information reproduzieren. Die semantische Validierung obliegt der vorgelagerten Step-1-Phase (Excel-Validierung) und dem qualitativen Walkthrough mit eCH-Experten in Step 3.

---

## 10. Quantitative Übersicht des V8.0-Graphen

| Knotentyp | Anzahl | Quelle im JSON |
| --- | ---: | --- |
| Document | 1 | `document` |
| Building_Block:Macro | 4 | `building_blocks` (oberste Ebene) |
| Building_Block:Meso | 32 | `meso_blocks` (gesamt) |
| Building_Block:Mikro | 186 | `mikro_blocks` (gesamt) |
| Variant | 113 | `variants` (gesamt) |
| Alternative | 14 | `alternatives` (gesamt) |
| External_Standard | ~330 | aus 211 Reference-Einträgen + Splitting |
| Interface | 3 | fix: S1, S2, S3 |
| **Knoten gesamt** | **~683** | |

| Beziehungstyp | Anzahl | Generierung |
| --- | ---: | --- |
| DEFINES | 4 | 1 Document × 4 Macros |
| CONTAINS | 218 | 4+32+182 Hierarchie-Kanten |
| HAS_VARIANT | 113 | 1 pro Variant |
| HAS_ALTERNATIVE | 14 | 1 pro Alternative |
| REFERENCES | ~340 | 211 Reference-Einträge × Splitting |
| APPLIES_TO | ~640 | 229 Assessments × 1–3 Interfaces (Broadcasting) |
| **Beziehungen gesamt** | **~1330** | |

Die exakten Zahlen für `External_Standard` und `REFERENCES` schwanken leicht, weil die Reference-Splitting-Heuristik datenabhängig ist. Die Smoke-Test-Ausgabe zeigt die echten Zahlen für den jeweiligen Import-Lauf.

---

## 11. Bezug zur Thesis-Disposition

Die Inhalte dieses Dokuments mappen wie folgt auf die Thesis-Kapitel:

| Disposition-Kapitel | Inhalt aus diesem Dokument |
| --- | --- |
| §3 Theoretischer Rahmen | §3 (Paradigmenwechsel relational → graph), §4.2 (Property-Graph-Modell, Vergleich zu RDF) |
| §4 Methodik | §6 (Algorithmus), §9 (Validierungsmethodik) |
| §6 Implementation | §4 (Schema), §5 (Sechs Designentscheidungen), §7 (Cypher-Pattern), §8 (Schwierige Stellen) |
| §7 Evaluation | §9.2 (Baseline-Queries als funktionaler Test) |
| §8 Diskussion / Limitationen | §5 (Trade-offs der D1–D6), §8.1 (Heuristisches Splitting), §9.3 (was nicht validiert wird) |
| Anhang | §10 (quantitative Übersicht), vollständige Schema-Definition aus §4 |

---

## Anhang: Vollständige Schema-Definition

### Knoten (Cypher-Constraints)

```cypher
CREATE CONSTRAINT doc_id   IF NOT EXISTS FOR (d:Document)          REQUIRE d.id  IS UNIQUE;
CREATE CONSTRAINT bb_id    IF NOT EXISTS FOR (b:Building_Block)    REQUIRE b.id  IS UNIQUE;
CREATE CONSTRAINT var_id   IF NOT EXISTS FOR (v:Variant)           REQUIRE v.id  IS UNIQUE;
CREATE CONSTRAINT alt_id   IF NOT EXISTS FOR (a:Alternative)       REQUIRE a.id  IS UNIQUE;
CREATE CONSTRAINT ext_key  IF NOT EXISTS FOR (e:External_Standard) REQUIRE e.key IS UNIQUE;
CREATE CONSTRAINT iface_id IF NOT EXISTS FOR (i:Interface)         REQUIRE i.id  IS UNIQUE;

CREATE INDEX bb_title      IF NOT EXISTS FOR (b:Building_Block)    ON (b.title);
CREATE INDEX var_title     IF NOT EXISTS FOR (v:Variant)           ON (v.title);
CREATE INDEX ext_org       IF NOT EXISTS FOR (e:External_Standard) ON (e.organization);
```

### Beziehungen (Cypher-Pattern)

```cypher
(:Document)-[:DEFINES]->(:Macro)
(:Macro)-[:CONTAINS]->(:Meso)
(:Meso)-[:CONTAINS]->(:Mikro)
(:Mikro)-[:HAS_VARIANT]->(:Variant)
(:Mikro)-[:HAS_ALTERNATIVE]->(:Alternative)
(:Variant|:Alternative|:Mikro)-[:REFERENCES {reference_type}]->(:External_Standard)
(:Variant|:Alternative|:Mikro)-[:APPLIES_TO {normative_status}]->(:Interface)
```

### Fixe Knoten (vom Skript immer angelegt)

```cypher
(:Document {id: 'eCH-0014', title: 'SAGA.ch', version: '8.0'})
(:Interface {id: 'S1', description: 'Schnittstelle S1: Endbenutzer <-> eGovernment-Anwendung'})
(:Interface {id: 'S2', description: 'Schnittstelle S2: eGovernment-Anwendung <-> eGovernment-Anwendung'})
(:Interface {id: 'S3', description: 'Schnittstelle S3: eGovernment-Anwendung <-> Backend / Drittsystem'})
```

---

## Verwandte Dokumente

| Dokument | Bezug zu diesem Step |
| --- | --- |
| *Kodierungsschema und Konvertierungsdokumentation* (Step 1) | Input für Step 2 — produziert `building_blocks.json` |
| `import_saga.py` | Implementation dieses Imports |
| `docker-compose.yml` | Infrastruktur (Neo4j 5 Community + APOC) |
| `baseline_queries.cypher` | Funktionstest und Ground-Truth für Step 3 |
| `nl_to_cypher.ipynb` | Step 3 — nutzt den von Step 2 erzeugten Graphen |
