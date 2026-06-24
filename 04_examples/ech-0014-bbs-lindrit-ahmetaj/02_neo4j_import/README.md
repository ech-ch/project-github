# Phase 2 — JSON → Neo4j

Diese Phase importiert die strukturierte Building-Block-JSON in einen Neo4j-5-Wissensgraphen. Sie erzeugt für den V8.0-Datensatz rund **700 Knoten** und **1'300 Beziehungen**, gegen die später (Phase 3) natürlichsprachliche Fragen ausgeführt werden.

> **Methodische Grundlagen** dieser Phase — Schema-Design, sechs Designentscheidungen (Idempotenz, Empty-Scope-Broadcasting, konservatives Reference-Splitting, ...), Cypher-Pattern und Algorithmus — sind im Dokument [`../docs/02_neo4j_import.md`](../docs/02_neo4j_import.md) beschrieben. Dieses README beschränkt sich auf die **operativen Aspekte**.

---

## Was diese Phase macht

```
building_blocks.json            import_saga.py                 Neo4j-Graph
(hierarchisch verschachtelt) ────────────────────────────────►  (700 Knoten,
                                  │                              1300 Kanten)
                                  ├─ Schema-Setup (Constraints, Indexes)
                                  ├─ Interfaces (S1, S2, S3)
                                  ├─ Document, Macros, Mesos, Mikros
                                  ├─ Variants und Alternatives
                                  ├─ References (mit Splitting)
                                  ├─ Assessments (mit Broadcasting)
                                  └─ Smoke-Test (Knoten/Kanten zählen)
```

| Aspekt | Wert |
| --- | --- |
| Eingabe | `building_blocks.json` (aus Phase 1) |
| Ausgabe | Neo4j-Datenbank (Bolt auf Port 7687, Browser auf 7474) |
| Hauptskript | `import_saga.py` (~475 Zeilen, neo4j-Python-Driver) |
| Idempotenz | ✓ via `MERGE` — mehrfache Importe ergeben gleichen Graphen |
| Laufzeit | ~10 Sekunden für den V8.0-Datensatz |

---

## Voraussetzungen

- **Docker Desktop** (oder Docker Engine + Compose) — getestet mit Docker 24+
- **Python ≥ 3.10** mit aktivierter venv und installierten Dependencies (`pip install -r ../requirements.txt`)
- Die **JSON-Datei aus Phase 1** unter `../data/intermediate/building_blocks.json` (oder einem anderen bekannten Pfad)
- Die `.env`-Datei im Repo-Root mit gesetztem `NEO4J_PASSWORD` (siehe `.env.example`)

---

## Setup

### 1. Neo4j-Container starten

`docker-compose.yml` startet eine **Neo4j-5-Community-Instanz** mit APOC-Plugin und Memory-Settings für einen kleinen Graphen:

```bash
cd 02_neo4j_import
docker compose up -d
```

Der Container liest das Passwort aus der `.env` im Repo-Root automatisch. Nach ~15 Sekunden ist die Datenbank erreichbar.

**Verifikation:**

```bash
docker compose ps
# Erwartung: STATE = "running (healthy)"

# Logs anschauen falls Probleme:
docker compose logs --tail=20
```

Im Browser dann <http://localhost:7474> öffnen — Login mit User `neo4j` und dem Passwort aus deiner `.env`.

### 2. Environment-Variablen in die Shell laden

Das Import-Skript liest `NEO4J_URI`, `NEO4J_USER` und `NEO4J_PASSWORD` aus der Shell-Umgebung:

```bash
cd ..                          # zurück zum Repo-Root
set -a
source .env
set +a
```

Hinweis: das Pattern `set -a; source .env; set +a` funktioniert sowohl in `bash` als auch in `zsh` (macOS-default) zuverlässig. Vermeide `export $(cat .env | xargs)` — das zerbricht bei Kommentaren oder Leerzeichen in der `.env`.

---

## Verwendung

### Standard-Import

Aus dem Repo-Root:

```bash
python 02_neo4j_import/import_saga.py data/intermediate/building_blocks.json
```

Oder lokal aus dem Phase-Verzeichnis:

```bash
cd 02_neo4j_import
python import_saga.py ../data/intermediate/building_blocks.json
```

### Re-Import (idempotent)

Wenn der Container schon läuft und du erneut importierst, ist das **kein Problem** — der Import nutzt durchgehend `MERGE`. Knoten und Kanten werden nicht dupliziert; Properties werden auf die aktuellen JSON-Werte aktualisiert.

```bash
# Beispiel: nach Änderungen am JSON erneut importieren
python 02_neo4j_import/import_saga.py data/intermediate/building_blocks.json
```

### Komplett neu anfangen (Reset)

Falls du den Graphen löschen und neu aufbauen willst:

```bash
# Option A: nur Daten löschen, Schema behalten
docker exec -it saga-neo4j cypher-shell -u neo4j -p $NEO4J_PASSWORD \
  "MATCH (n) DETACH DELETE n;"
python 02_neo4j_import/import_saga.py data/intermediate/building_blocks.json

# Option B: kompletter Reset inkl. Schema
docker compose down
sudo rm -rf neo4j_data neo4j_logs       # oder einfach: rm -rf wenn ohne sudo möglich
docker compose up -d
# kurz warten, dann erneut importieren
```

---

## Erwartete Ausgabe

Bei erfolgreichem Lauf auf dem V8.0-Datensatz:

```
Connecting to bolt://localhost:7687 as neo4j ...
Importing building_blocks.json (Document eCH-0014 V8.0) ...

Import complete:
  macro          4
  meso           32
  mikro          186
  variant        113
  alternative    14
  references     ~340
  assessments    ~640

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

Die `~`-Werte schwanken leicht, weil das Reference-Splitting datenabhängig ist (siehe Methodik-Doku §10).

---

## Verifikation: Baseline-Abfragen

Die Datei `baseline_queries.cypher` enthält rund 17 Cypher-Abfragen, organisiert nach den vier Anwendungsfall-Klassen, die als **Ground Truth** für Phase 3 dienen und gleichzeitig als manueller Funktionstest des Imports.

```cypher
// A1 — Vollständiger Pfad für HTTP
MATCH path = (d:Document)-[:DEFINES]->(:Macro)-[:CONTAINS]->(:Meso)
             -[:CONTAINS]->(m:Mikro {id:'bb_mi_http'})
RETURN path;

// B2 — Standards, die von mehr als einem Mikro referenziert werden
MATCH (e:External_Standard)<-[:REFERENCES]-(s)
OPTIONAL MATCH (s)<-[:HAS_VARIANT|HAS_ALTERNATIVE]-(m:Mikro)
WITH e, collect(DISTINCT coalesce(m.id, s.id)) AS users
WHERE size(users) > 1
RETURN e.key, size(users) AS user_count
ORDER BY user_count DESC LIMIT 25;
```

Im Neo4j-Browser (<http://localhost:7474>) Statements einzeln einfügen und ausführen.

Die vollständige Liste:

| Klasse | Anzahl Queries | Was sie testen |
| --- | ---: | --- |
| **Smoke** | 3 | Knoten/Kanten-Counts, Statuswerte |
| **A — Traceability** | 4 | Pfad-Lokalisierung, Standardverweise |
| **B — Dependency / Impact** | 4 | Rückwärts-Lookups, Cross-Referencing |
| **C — Normative Status** | 3 | Bewertungs-Aggregationen |
| **D — Coverage** | 3 | Daten-Hygiene, fehlende Bewertungen |

---

## Wenn etwas schiefgeht

### "Connection refused" beim Import

Der Container ist noch nicht bereit. Neo4j braucht ca. 15 Sekunden zum Start. Logs prüfen:

```bash
docker compose logs --tail=20
```

Wenn die Zeile `Remote interface available at http://localhost:7474/` erscheint, ist die DB bereit.

### "Unauthorized" beim Import

Das `NEO4J_PASSWORD` in deiner Shell stimmt nicht mit dem überein, mit dem der Container gestartet wurde. Zwei mögliche Ursachen:

1. **`.env` nicht geladen** — `set -a; source .env; set +a` ausführen
2. **Passwort wurde geändert** — `docker compose down`, `sudo rm -rf neo4j_data`, dann `docker compose up -d`

### Port 7474 oder 7687 schon belegt

Andere Neo4j-Instanz läuft schon. Entweder die andere stoppen, oder im `docker-compose.yml` die Ports umbiegen (z.B. `7475:7474`).

### Validation-Fehler durch das Skript

Das Import-Skript validiert die JSON-Struktur nicht — es vertraut darauf, dass Phase 1 valide JSON produziert hat. Falls Phase-1-Validierung Fehler gemeldet hat, müssen die zuerst behoben werden, bevor Phase 2 sinnvoll ausgeführt werden kann.

### APOC-Funktionen nicht verfügbar

Sollte nicht passieren (im `docker-compose.yml` ist `NEO4J_PLUGINS=["apoc"]` gesetzt), aber zur Diagnose:

```cypher
RETURN apoc.version() AS apoc_version;
```

Wenn das `Unknown function 'apoc.version'` zurückgibt, ist der Plugin-Mechanismus beim Container-Start fehlgeschlagen. `docker compose down`, dann wieder `up -d` löst das meist.

---

## Neo4j stoppen

Wenn du fertig bist:

```bash
# Container stoppen (Daten bleiben erhalten)
docker compose down

# Container stoppen UND alle Daten löschen
docker compose down -v
sudo rm -rf neo4j_data neo4j_logs       # falls Volumes-Mount verwendet
```

---

## Dateien in diesem Verzeichnis

| Datei | Zweck |
| --- | --- |
| `import_saga.py` | Import-Skript (siehe Modul-Docstring für Schema und Designentscheidungen) |
| `baseline_queries.cypher` | 17 Cypher-Referenz-Queries, organisiert nach Anwendungsfall-Klassen |
| `docker-compose.yml` | Neo4j-5-Community + APOC, Memory-Settings für kleine Graphen |
| `README.md` | Dieses Dokument |

---

## Weiterführend

| Bezug | Pfad |
| --- | --- |
| Methodische Grundlagen | [`../docs/02_neo4j_import.md`](../docs/02_neo4j_import.md) |
| Vorige Phase (Phase 1) | [`../01_excel_to_json/README.md`](../01_excel_to_json/README.md) |
| Nächste Phase (Phase 3) | [`../03_nl_to_cypher/README.md`](../03_nl_to_cypher/README.md) |
| Neo4j-Dokumentation | <https://neo4j.com/docs/cypher-manual/5/> |
