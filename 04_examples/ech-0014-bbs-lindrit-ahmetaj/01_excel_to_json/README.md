# Phase 1 — Excel → JSON

Diese Phase konvertiert die manuell befüllte Excel-Erfassungsvorlage `BB_Standard_Import.xlsx` in das strukturierte JSON-Format `building_blocks.json`, das als Eingabe für Phase 2 (Neo4j-Import) dient.

> **Methodische Grundlagen** dieser Phase — die Kodierungsregeln, Disambiguierung von Variants und Alternatives, Sonderfälle, Designentscheidungen — sind im Dokument [`../docs/01_kodierungsschema.md`](../docs/01_kodierungsschema.md) beschrieben. Dieses README beschränkt sich auf die **operativen Aspekte**.

---

## Was diese Phase macht

```
BB_Standard_Import.xlsx          excel_to_bb.py            building_blocks.json
(7 Sheets, manuell befüllt) ───────────────────────────────►  (verschachteltes JSON)
                                    │
                                    ├─ Lesen aller 7 Sheets
                                    ├─ Validierung (FKs, Pflichtfelder, Polymorphie)
                                    └─ Bottom-up Assembly
                                       Macro → Meso → Mikro → Variants/Alternatives
                                       mit References und Assessments
```

| Aspekt | Wert |
| --- | --- |
| Eingabe | `BB_Standard_Import.xlsx` (7 Sheets nach Kodierungsschema) |
| Ausgabe | `building_blocks.json` (hierarchisch verschachtelt, UTF-8) |
| Hauptskript | `excel_to_bb.py` (~340 Zeilen, pure Python + openpyxl) |
| Determinismus | ✓ deterministisch — gleiche Excel produziert gleiche JSON |
| Laufzeit | ~1 Sekunde für den V8.0-Datensatz |

---

## Voraussetzungen

- **Python ≥ 3.10**
- **openpyxl** (in `../requirements.txt`)
- Eine **gültig befüllte Excel-Datei** (Kodierung gemäss [`anleitung_excel_building_blocks.md`](anleitung_excel_building_blocks.md))

Falls die virtuelle Umgebung noch nicht aktiviert ist:

```bash
cd ..                            # zum Repo-Root
source .venv/bin/activate        # Windows: .venv\Scripts\activate
cd 01_excel_to_json
```

---

## Verwendung

### Standard-Konvertierung

Aus dem Repo-Root:

```bash
python 01_excel_to_json/excel_to_bb.py \
    --input  data/input/BB_Standard_Import.xlsx \
    --output data/intermediate/building_blocks.json
```

Oder lokal aus dem Phase-Verzeichnis:

```bash
cd 01_excel_to_json
python excel_to_bb.py \
    --input  ../data/input/BB_Standard_Import.xlsx \
    --output ../data/intermediate/building_blocks.json
```

### Nur Validierung (ohne Schreiben)

Nützlich, um die Excel-Erfassung zu prüfen, bevor man die JSON-Pipeline anstösst:

```bash
python excel_to_bb.py \
    --input ../data/input/BB_Standard_Import.xlsx \
    --validate-only
```

### Defaults (für schnelles lokales Testen)

Ohne Argumente werden Defaults verwendet — `BB_Standard_Import.xlsx` im aktuellen Verzeichnis lesen, `building_blocks.json` ins aktuelle Verzeichnis schreiben:

```bash
cd 01_excel_to_json
python excel_to_bb.py
```

### Verfügbare Argumente

| Argument | Default | Bedeutung |
| --- | --- | --- |
| `--input` | `BB_Standard_Import.xlsx` | Pfad zur Excel-Eingabedatei |
| `--output` | `building_blocks.json` | Pfad für die JSON-Ausgabedatei |
| `--validate-only` | aus | Nur validieren, kein JSON schreiben |

---

## Erwartete Ausgabe

Bei erfolgreichem Lauf auf dem V8.0-Datensatz:

```
=======================================================
  SAGA.ch Building Blocks – Excel → JSON
=======================================================

  → Lese: ../data/input/BB_Standard_Import.xlsx

Gelesene Zeilen:
  MAKRO:              4
  MESO:               32
  MIKRO:              186
  MIKRO_VARIANTS:     113
  MIKRO_ALTERNATIVES: 14
  MIKRO_REFERENCES:   211
  MIKRO_ASSESSMENTS:  229

Validierung:
  ✓ Keine Fehler – alle Referenzen valide.

Output:
  ✓ /absoluter/pfad/zu/data/intermediate/building_blocks.json

JSON-Struktur:
  Makro-Blöcke:  4
  Meso-Blöcke:   32
  Mikro-Blöcke:  186
```

Die Zahlen können sich bei späteren Versionen des Datensatzes ändern — wichtig ist, dass die Validierung **fehlerfrei** durchläuft (`✓ Keine Fehler`).

---

## Wenn Validierungsfehler auftreten

Das Skript meldet vier Klassen von Fehlern, jeweils mit der konkreten Excel-Zeilennummer:

| Fehler-Typ | Beispiel-Meldung | Was tun |
| --- | --- | --- |
| **Pflichtfeld fehlt** | `MAKRO 'bb_ma_xy': Pflichtfeld 'TITLE' fehlt` | Im Excel die markierte Zelle befüllen |
| **Foreign Key ungültig** | `MESO 'bb_me_xy': PARENT_ID 'bb_ma_nope' ist keine gültige Makro-ID` | Im Excel-Sheet `MESO` die `PARENT_ID` korrigieren |
| **Polymorphie verletzt (keine Target)** | `MIKRO_REFERENCES Zeile 47: Keine Target-Spalte gesetzt` | Eine der Spalten `TARGET_MICRO_ID`, `TARGET_VARIANT_ID`, `TARGET_ALTERNATIVE_ID` befüllen |
| **Polymorphie verletzt (mehrere Targets)** | `MIKRO_REFERENCES Zeile 53: Mehrere Target-Spalten gesetzt` | Nur EINE der drei Target-Spalten füllen — die anderen leeren |

Bei jedem Fehler bricht das Skript ab (sofern `--validate-only`) bzw. überspringt das Schreiben der JSON (sofern Standard-Modus).

---

## Reproduzierbarkeit

Die Konvertierung ist **deterministisch**: identische Excel-Eingabe ergibt bit-identische JSON-Ausgabe. Garantiert durch:

- regelbasierte Konvertierung ohne Heuristiken
- explizite Sortierung beim Assembly (Reihenfolge der Excel-Zeilen wird beibehalten)
- UTF-8-Encoding ohne BOM, einheitliches Indent (2 Spaces) in `json.dump()`

Dies ist die Voraussetzung für die Reproduzierbarkeit der gesamten Pipeline. Eine Änderung am Excel führt zu einer nachvollziehbaren Änderung im JSON; identische Excel-Datei führt zu identischem JSON-Output.

---

## Wenn die Excel-Vorlage angepasst werden muss

Erfasser-orientierte Anweisungen für das Befüllen der sieben Sheets stehen in [`anleitung_excel_building_blocks.md`](anleitung_excel_building_blocks.md). Dieses Dokument richtet sich an Personen, die SAGA.ch-Inhalte zum ersten Mal kodieren — es erklärt, was in welche Zelle gehört und welche Konventionen einzuhalten sind.

Strukturelle Änderungen am Excel-Schema (neue Spalten, neue Sheets) würden eine Anpassung des Konvertierungsskripts erfordern — die Stelle dafür ist die `assemble()`-Funktion in `excel_to_bb.py`.

---

## Dateien in diesem Verzeichnis

| Datei | Zweck |
| --- | --- |
| `excel_to_bb.py` | Konvertierungs-Skript (siehe Modul-Docstring für Details) |
| `BB_Standard_Import.xlsx` | Vollständig befüllte Excel-Erfassungsvorlage für V8.0 |
| `anleitung_excel_building_blocks.md` | Erfasser-Handbuch für die Excel-Vorlage |
| `README.md` | Dieses Dokument |

---

## Weiterführend

| Bezug | Pfad |
| --- | --- |
| Methodische Grundlagen | [`../docs/01_kodierungsschema.md`](../docs/01_kodierungsschema.md) |
| Nächste Phase (Phase 2) | [`../02_neo4j_import/README.md`](../02_neo4j_import/README.md) |
| Quelldokument | [`../source_docs/STAN_d_DEF_2017-09-13_eCH-0014_V8.0_SAGA.ch.pdf`](../source_docs/) |
