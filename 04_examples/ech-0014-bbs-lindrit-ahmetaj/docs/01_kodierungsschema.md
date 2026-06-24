# Kodierungsschema und Konvertierungsdokumentation: SAGA.ch Building Blocks

**Bachelor-Thesis ZHAW** · *Prototypische Modellierung dokumentenzentrierter Architekturstandards als Wissensgraph*  
Autor: Lindrit Ahmetaj · Betreuung: Maria Rothstein  
Dokumentversion: 1.0 · Stand: zu Beginn der Implementationsphase

---

## 1. Zweck und Geltungsbereich

Dieses Dokument beschreibt die methodische Vorgehensweise, mit der die im PDF-Standard *eCH-0014 SAGA.ch V8.0* enthaltenen technischen Building Blocks systematisch in eine strukturierte, maschinenlesbare Repräsentation überführt wurden. Die Überführung erfolgt in drei Stufen:

> **PDF (Quelldokument)** → **Excel (Erfassungsvorlage)** → **JSON (strukturierte Repräsentation)**

Das resultierende JSON-Artefakt (`building_blocks.json`) bildet die Eingabe für die nachgelagerte Verarbeitung in Neo4j (Step 2 der Thesis) und damit die Datengrundlage für die KI-gestützte Abfrage-Pipeline (Step 3, Hauptartefakt).

Dieses Dokument adressiert drei Adressatengruppen:

1. **Die Betreuung der Thesis** — als nachvollziehbare Methodik-Dokumentation für die Bewertung von Kapitel 4 (*Methodik*) und Kapitel 6 (*Implementation*).
2. **Die fachliche Begutachtung durch eCH-Experten** — als Grundlage für den qualitativen Walkthrough gemäss Disposition §4.3.2.
3. **Spätere Wartung oder Replikation** — falls die Modellierung auf nachfolgende Versionen des Standards (V9.0+) übertragen werden soll.

---

## 2. Quelldokument: eCH-0014 SAGA.ch V8.0

### 2.1 Bibliografische Eckdaten

| Merkmal | Wert |
| --- | --- |
| Standardnummer | eCH-0014 |
| Titel | SAGA.ch — Standards und Architekturen für eGovernment-Anwendungen |
| Version | V8.0 |
| Stand | 2017-09-13 |
| Status | Definitiv |
| Herausgeber | Verein eCH, Zürich |
| Umfang | 143 Seiten |

### 2.2 Strukturelle Eigenschaften

Das Dokument ist als hierarchisch nummerierter Fachtext aufgebaut und kombiniert drei Darstellungsformen:

1. **Kapitelhierarchie** mit dezimaler Gliederung (z.B. Kapitel 5 *Kommunikationsprotokolle* → 5.5 *Anwendungsprotokolle* → 5.5.2 *Hyper Text Transfer Protocol, HTTP*).
2. **Fliesstext** mit fachlicher Beschreibung und Begründung jedes Bausteins.
3. **Bewertungstabellen** mit drei Spalten (S1, S2, S3) für die Schnittstellen-Anwendbarkeit und einer Zusatzzeile für den normativen Status (*dringend empfohlen* | *empfohlen* | *unter beobachtung* | *nicht empfohlen*).

Nach jeder Bewertungstabelle folgen typischerweise zwei Felder:

- **`Standards:`** — Liste der referenzierten externen Spezifikationen (RFCs, ISO-Normen, OASIS-Spezifikationen).
- **`Anmerkung:`** — fachlicher Kommentar oder Cross-Reference auf andere Kapitel.

Diese drei Strukturelemente bilden die Grundlage für das nachfolgend beschriebene Kodierungsschema.

### 2.3 Beispielausschnitt (Kapitel 5.5.2, HTTP)

```
5.5.2  Hyper Text Transfer Protocol, HTTP

Für die Web-Kommunikation muss HTTP (mit Port 80 bzw. HTTPS mit Port 443)
eingesetzt werden. Beim Einsatz von HTTP Session Management und Cookies
soll der entsprechende Standard HTTP State Management Mechanism befolgt werden.

   S1   S2   S3   Hyper Text Transfer Protocol (HTTP V.1.1)   Dringend empfohlen
Standards: HTTP IETF RFC 1945 bzw. RFC 2965, RFC 5785, RFC 7230-40.
Anmerkung: Die Sicherung des HTTP-Protokolls über SSL oder TLS wird auch als
HTTPS bezeichnet. [...]

   S1   S2   S3   HTTP V2                                      Empfohlen
Standard: IETF RFC 7540.
```

Aus diesem Auszug werden, wie nachfolgend dargestellt, ein Mikro-Block (HTTP), zwei Variants (V1.1 und V2), je ein Assessment pro Variant und mehrere External Standards extrahiert.

---

## 3. Konzeptuelles Modell der Building Blocks

Das Modell trennt **strukturelle Hierarchie**, **differenzierende Konstrukte** und **anhängende Eigenschaften**. Diese Trennung ist die methodische Grundentscheidung dieser Arbeit und bildet die Basis sowohl für das Excel-Schema als auch für das spätere Neo4j-Schema.

### 3.1 Hierarchische Abstraktionsebenen

Drei Granularitätsstufen bilden die strukturelle Wirbelsäule des Modells:

| Ebene | Definition | Anzahl V8.0 | Beispiel |
| --- | --- | --- | --- |
| **MAKRO** | Übergeordneter fachlicher Bereich; entspricht einem Hauptkapitel des PDF | 4 | *Kommunikationsprotokolle* |
| **MESO** | Thematische Untergruppe innerhalb eines Macros | 32 | *Anwendungsprotokolle* |
| **MIKRO** | Einzelne konzeptionelle technische Einheit (Standard, Protokoll, Format) | 186 | *Hyper Text Transfer Protocol, HTTP* |

Die Hierarchie ist strikt: jedes Meso hat genau ein Macro als Parent, jedes Mikro genau ein Meso als Parent. Es existieren keine Mehrfach-Eltern-Beziehungen.

### 3.2 Differenzierende Konstrukte: Variants und Alternatives

Innerhalb eines Mikro-Blocks können zwei methodisch unterschiedliche Differenzierungen auftreten. Die Unterscheidung ist eine zentrale Kodierungsentscheidung dieser Arbeit:

| Konstrukt | Definition | Beispiel | Anzahl V8.0 |
| --- | --- | --- | --- |
| **Variant** | Verschiedene **Versionen oder Ausprägungen** desselben technischen Konzepts. Dieselbe funktionale Rolle, unterschiedlicher Reifegrad oder Spezifikation. | HTTP V1.1 vs. HTTP V2; CMIS V1.1 vs. CMIS V2.0 | 113 |
| **Alternative** | **Sich gegenseitig ausschliessende technische Optionen** mit derselben funktionalen Rolle. | Für Mail-Zugang: POP3 *oder* IMAP4 *oder* HTTP-für-E-Mail | 14 |

**Disambiguierungsregel:** Wenn die Optionen versionsmässig miteinander verwandt sind oder als Weiterentwicklungen einer gemeinsamen Spezifikation gelten, sind es Variants. Wenn sie technisch unabhängig entstanden sind und nur funktional substituierbar sind, sind es Alternatives.

Pro Mikro-Block tritt im V8.0-Datensatz **entweder Variants oder Alternatives** auf, nicht beides gleichzeitig. Diese Vereinfachung wurde als Designentscheidung getroffen (siehe §10).

### 3.3 Anhängende Konstrukte: References und Assessments

Zwei weitere Konstrukte werden an Mikros, Variants oder Alternatives angehängt — abhängig davon, auf welcher Ebene sich die Information im PDF befindet:

| Konstrukt | Definition | Anzahl V8.0 |
| --- | --- | --- |
| **Reference** | Verweis auf einen externen Standard (RFC, ISO-Norm, OASIS-Spezifikation, URL) | 211 |
| **Assessment** | Normative Bewertung im Format `(interface_scope, normative_status)` | 229 |

Eine Reference oder ein Assessment hängt **immer an genau einem Zielobjekt** (Mikro, Variant oder Alternative) — nie an mehreren. Diese Eindeutigkeitsregel ist im Konvertierungsskript validiert.

---

## 4. Methodische Vorgehensweise (Pipeline)

Die Überführung vom Quelldokument in die strukturierte Repräsentation folgt einer dreistufigen Pipeline:

```
   ┌──────────────┐    Manuelle      ┌──────────────────┐    Automatisch    ┌──────────────────┐
   │  SAGA.ch V8  │   Kodierung      │ BB_Standard_     │  (excel_to_bb.py) │ building_blocks  │
   │  PDF (143 S.)│ ───────────────► │ Import.xlsx      │ ────────────────► │ .json            │
   │              │  nach diesem     │ (7 Sheets)       │                   │ (strukturierte   │
   │              │  Schema          │                  │                   │  Hierarchie)     │
   └──────────────┘                  └──────────────────┘                   └──────────────────┘
        Quelle                          Erfassungsvorlage                       Zielartefakt
```

Die **manuelle Kodierungsphase** ist der methodisch entscheidende Schritt: hier wird interpretiert, welcher Textabschnitt welcher Modellklasse entspricht. Sie ist im Folgenden als formalisierte Kodierungstabelle dokumentiert.

Die **automatische Konvertierungsphase** ist deterministisch und prüfbar: dasselbe Excel-Eingabedokument erzeugt durch das Skript `excel_to_bb.py` immer dasselbe JSON-Artefakt. Diese Determinismus-Eigenschaft ist eine Voraussetzung für die Reproduzierbarkeitsanforderung (Disposition §4.3.1).

---

## 5. Kodierungstabelle: Vom PDF-Element zum Excel-Feld

Diese Tabelle dokumentiert die Kodierungsentscheidungen, die beim Lesen des PDFs und Befüllen der Excel-Vorlage angewendet wurden. Sie ist das zentrale Methoden-Artefakt zur Reproduzierbarkeit.

### 5.1 Hauptkodierungstabelle

| Element im PDF | Modellklasse | Excel-Sheet | Kodierungsregel |
| --- | --- | --- | --- |
| Hauptkapitel-Überschrift (z.B. *5 Kommunikationsprotokolle*) | Macro | `MAKRO` | Eine Zeile pro Hauptkapitel; ID-Schema `bb_ma_<thema>` |
| Unterkapitel 2. Ebene (z.B. *5.5 Anwendungsprotokolle*) | Meso | `MESO` | Eine Zeile pro Unterkapitel; `PARENT_ID` = Macro-ID |
| Unterkapitel 3. Ebene mit Bewertungstabelle (z.B. *5.5.2 HTTP*) | Mikro | `MIKRO` | Eine Zeile pro fachlich abgeschlossener Einheit; `PARENT_ID` = Meso-ID |
| Mehrere Versions-Zeilen unter einem Mikro (z.B. *HTTP V1.1*, *HTTP V2*) | Variant | `MIKRO_VARIANTS` | Eine Zeile pro Version; `MICRO_ID` = übergeordneter Mikro-Block; ID-Schema `var_<thema>_<version>` |
| Eine Tabellenzeile mit mehreren auflistenden Optionen (z.B. *POP3, IMAP4, HTTP für E-Mail*) | Alternatives | `MIKRO_ALTERNATIVES` | Eine Zeile pro Option; `MICRO_ID` = übergeordneter Mikro-Block; ID-Schema `alt_<thema>` |
| Zeile `Standards: ...` oder `Standard: ...` | References | `MIKRO_REFERENCES` | Eine Zeile pro Standard-Referenz; genau eine `TARGET_*_ID` befüllt |
| Zeile `Anmerkung: ...` | Reference (Sonderfall) | `MIKRO_REFERENCES` | Eine Zeile mit `REFERENCE_TYPE='anmerkung'`, `ORGANIZATION='-'` |
| Bewertungstabelle (S1 / S2 / S3 / Status) | Assessment | `MIKRO_ASSESSMENTS` | Eine Zeile pro Bewertung; `SCOPE_S1/S2/S3` als `Y`/`N` aus Tabelle; `NORMATIVE_STATUS` aus letzter Spalte (kleingeschrieben) |
| Fliesstext zwischen den Bewertungstabellen | semantic_summary | `MIKRO.SEMANTIC_SUMMARY` | 1–2 Sätze als fachliche Beschreibung der Einheit |

### 5.2 Disambiguierungsregeln

Drei wiederkehrende Kodierungsfragen wurden nach diesen Regeln entschieden:

**Regel 1 — Mikro vs. Meso bei einzelnem Standard im Unterkapitel:**  
Wenn ein Unterkapitel der Ebene 2 (Meso-Kandidat) nur einen einzelnen Standard enthält, wird trotzdem die Meso-Ebene angelegt und der Standard als eigener Mikro darunter geführt. Dies erhält die Hierarchie-Konsistenz und vermeidet Sonderfälle in der Abfrage-Pipeline.

**Regel 2 — Variant vs. Alternative:**  
Wenn die Optionen denselben Standard-Namen mit unterschiedlicher Versionsbezeichnung tragen (z.B. *HTTP V1.1*, *HTTP V2*), werden sie als Variants kodiert. Wenn sie unterschiedliche Standard-Namen tragen und im PDF in derselben Tabellenzeile als Auflistung erscheinen (z.B. *POP3, IMAP4, HTTP für E-Mail*), werden sie als Alternatives kodiert.

**Regel 3 — Bewertung auf Mikro- vs. Variant-/Alternative-Ebene:**  
Wenn ein Mikro mehrere Variants oder Alternatives hat und jede einzelne im PDF eine eigene Bewertungstabelle besitzt, wird das Assessment auf der jeweiligen Variant-/Alternative-Ebene erfasst. Wenn das PDF eine gemeinsame Bewertungstabelle für alle Optionen zeigt, wird das Assessment auf Mikro-Ebene erfasst.

### 5.3 Behandlung von Sonderfällen

| Sonderfall | Vorgehen |
| --- | --- |
| Mehrere RFCs in einer einzigen `Standards:`-Zeile (z.B. *RFC 2228, RFC 2428, RFC 2640*) | Ein einzelnes Reference-Objekt mit Original-Label; eine spätere Aufsplittung erfolgt im Neo4j-Importskript (konservativ) |
| `Anmerkung:`-Text als kommentierender Verweis | Eigene Reference-Zeile mit `REFERENCE_TYPE='anmerkung'`, `ORGANIZATION='-'`, `URL=''` |
| Externe URL ohne Standard-Nummer | Reference mit `REFERENCE_TYPE='specification_url'` und gefüllter `URL`-Spalte |
| Mikro ohne fachliche Beschreibung im PDF | `SEMANTIC_SUMMARY` wird auf `'-'` gesetzt; nicht leer, um Pflichtfeld-Validierung zu erfüllen |
| Mikro ohne Bewertungstabelle (z.B. nur Erläuterungstext) | Kein Assessment erfasst (leer); im Neo4j-Schema wird daraus ein Mikro ohne `APPLIES_TO`-Beziehung |

---

## 6. Excel-Eingabevorlage: Sheet-für-Sheet-Spezifikation

Die Datei `BB_Standard_Import.xlsx` enthält sieben Sheets in normalisierter Form. Listen wie References oder Assessments werden nicht in einer Zelle gesammelt, sondern in eigenen Sheets erfasst — analog zur Dritten Normalform in relationalen Datenbanken. Diese Normalisierung erlaubt eindeutige Validierung und deterministische Konvertierung.

### 6.1 Layout-Konvention

Jedes Sheet folgt derselben Layout-Konvention:

| Zeile | Inhalt | Bedeutung |
| --- | --- | --- |
| 1 | Sheet-Name als Überschrift | Dokumentation |
| 2 | Spaltenbeschreibung | Dokumentation |
| 3 | Datentyp pro Spalte | Dokumentation |
| 4 | Beispielzeile | Dokumentation |
| 5 | **Spaltenköpfe (technische Namen)** | Wird vom Skript als Header gelesen |
| 6+ | **Datenzeilen** | Werden vom Skript verarbeitet |

Pflichtfelder sind in der Excel-Datei mit `*` markiert; das Konvertierungsskript prüft sie in der Validierungsphase.

### 6.2 Sheet `MAKRO`

| Spalte | Pflicht | Datentyp | Bedeutung |
| --- | :---: | --- | --- |
| `ID` | ✓ | String, Schema `bb_ma_*` | Eindeutige Macro-ID |
| `PARENT_ID` |  | String / leer | Bei Macros immer leer |
| `LEVEL` | ✓ | Konstante `MAKRO` | Diskriminator |
| `TITLE` | ✓ | String | Menschenlesbarer Titel |
| `SEMANTIC_SUMMARY` | ✓ | String | Fachliche Beschreibung (1–2 Sätze) |

### 6.3 Sheet `MESO`

| Spalte | Pflicht | Datentyp | Bedeutung |
| --- | :---: | --- | --- |
| `ID` | ✓ | String, Schema `bb_me_*` | Eindeutige Meso-ID |
| `PARENT_ID` | ✓ | String, Referenz auf `MAKRO.ID` | Zugehörigkeit zum Macro |
| `LEVEL` | ✓ | Konstante `MESO` | Diskriminator |
| `TITLE` | ✓ | String | Menschenlesbarer Titel |
| `SEMANTIC_SUMMARY` | ✓ | String | Fachliche Beschreibung |

### 6.4 Sheet `MIKRO`

| Spalte | Pflicht | Datentyp | Bedeutung |
| --- | :---: | --- | --- |
| `ID` | ✓ | String, Schema `bb_mi_*` | Eindeutige Mikro-ID |
| `PARENT_ID` | ✓ | String, Referenz auf `MESO.ID` | Zugehörigkeit zum Meso |
| `LEVEL` | ✓ | Konstante `MIKRO` | Diskriminator |
| `TITLE` | ✓ | String | Menschenlesbarer Titel |
| `SEMANTIC_SUMMARY` | ✓ | String | Fachliche Beschreibung |
| `USES_VARIANTS` |  | `Y` / `N` | Steuerflag (Hinweis für Validierung) |
| `USES_ALTERNATIVES` |  | `Y` / `N` | Steuerflag (Hinweis für Validierung) |

Die beiden `USES_*`-Flags sind redundant — das Konvertierungsskript leitet die tatsächliche Existenz von Variants/Alternatives aus den Sheets `MIKRO_VARIANTS` und `MIKRO_ALTERNATIVES` ab. Die Flags dienen ausschliesslich der manuellen Plausibilitätsprüfung beim Befüllen der Vorlage.

### 6.5 Sheet `MIKRO_VARIANTS`

| Spalte | Pflicht | Datentyp | Bedeutung |
| --- | :---: | --- | --- |
| `VARIANT_ID` | ✓ | String, Schema `var_*` | Eindeutige Variant-ID |
| `MICRO_ID` | ✓ | String, Referenz auf `MIKRO.ID` | Zugehöriger Mikro |
| `TITLE` | ✓ | String | Menschenlesbarer Titel der Variant |

### 6.6 Sheet `MIKRO_ALTERNATIVES`

| Spalte | Pflicht | Datentyp | Bedeutung |
| --- | :---: | --- | --- |
| `ALTERNATIVE_ID` | ✓ | String, Schema `alt_*` | Eindeutige Alternative-ID |
| `MICRO_ID` | ✓ | String, Referenz auf `MIKRO.ID` | Zugehöriger Mikro |
| `TITLE` | ✓ | String | Menschenlesbarer Titel der Alternative |

### 6.7 Sheet `MIKRO_REFERENCES`

Eindeutigkeitsregel: **Genau eine** der drei `TARGET_*_ID`-Spalten muss befüllt sein.

| Spalte | Pflicht | Datentyp | Bedeutung |
| --- | :---: | --- | --- |
| `TARGET_MICRO_ID` | (1 von 3) | String, Referenz auf `MIKRO.ID` | Reference hängt am Mikro |
| `TARGET_VARIANT_ID` | (1 von 3) | String, Referenz auf `MIKRO_VARIANTS.VARIANT_ID` | Reference hängt an Variant |
| `TARGET_ALTERNATIVE_ID` | (1 von 3) | String, Referenz auf `MIKRO_ALTERNATIVES.ALTERNATIVE_ID` | Reference hängt an Alternative |
| `LABEL` | ✓ | String | Menschenlesbare Bezeichnung (z.B. `RFC 7540`, `IETF RFC 1945 bzw. RFC 2965`) |
| `ORGANIZATION` | ✓ | String | Herausgebende Organisation (`IETF`, `OASIS`, `ISO/IEC`, `W3C`, ...) |
| `REFERENCE_TYPE` | ✓ | Auswahlfeld | `standard` / `rfc` / `specification_url` / `anmerkung` / `informational` / `other` |
| `URL` |  | String / leer | Optionaler Weblink |

### 6.8 Sheet `MIKRO_ASSESSMENTS`

Eindeutigkeitsregel: **Genau eine** der drei `TARGET_*_ID`-Spalten muss befüllt sein.

| Spalte | Pflicht | Datentyp | Bedeutung |
| --- | :---: | --- | --- |
| `ASSESSMENT_ID` | ✓ | String, Schema `ass_*` | Eindeutige Assessment-ID |
| `TARGET_MICRO_ID` | (1 von 3) | Referenz | Assessment hängt am Mikro |
| `TARGET_VARIANT_ID` | (1 von 3) | Referenz | Assessment hängt an Variant |
| `TARGET_ALTERNATIVE_ID` | (1 von 3) | Referenz | Assessment hängt an Alternative |
| `SCOPE_S1` | ✓ | `Y` / `N` | Anwendbar auf Schnittstelle S1 |
| `SCOPE_S2` | ✓ | `Y` / `N` | Anwendbar auf Schnittstelle S2 |
| `SCOPE_S3` | ✓ | `Y` / `N` | Anwendbar auf Schnittstelle S3 |
| `NORMATIVE_STATUS` | ✓ | Auswahlfeld | `dringend empfohlen` / `empfohlen` / `unter beobachtung` / `nicht empfohlen` |

### 6.9 Beziehungen zwischen den Sheets

Das Excel-Schema bildet ein dreistufiges Foreign-Key-System:

```
                        ┌──────────┐
                        │  MAKRO   │
                        │  ─────   │
                        │  ID (PK) │
                        └─────▲────┘
                              │ PARENT_ID (FK)
                        ┌─────┴────┐
                        │   MESO   │
                        │  ─────   │
                        │  ID (PK) │
                        └─────▲────┘
                              │ PARENT_ID (FK)
                        ┌─────┴────┐
              ┌────────►│  MIKRO   │◄────────┐
              │         │  ─────   │         │
              │         │  ID (PK) │         │
              │         └─────▲────┘         │
              │ MICRO_ID      │ MICRO_ID     │ TARGET_MICRO_ID
              │ (FK)          │ (FK)         │ (FK, optional)
              │               │              │
   ┌──────────┴──────┐   ┌────┴─────────────┐│
   │ MIKRO_VARIANTS  │   │ MIKRO_ALTERNAT.  ││
   │  ─────          │   │  ─────           ││
   │  VARIANT_ID(PK) │   │ ALTERNATIVE_ID   ││
   └────────▲────────┘   └────────▲─────────┘│
            │ TARGET_VARIANT_ID   │ TARGET_ALT_ID
            │ (FK, optional)      │ (FK, optional)
            │                     │           │
           ┌┴─────────────────────┴───────────┴┐
           │     MIKRO_REFERENCES              │
           │     MIKRO_ASSESSMENTS             │
           │  (genau eine der TARGET_*_ID-     │
           │   Spalten pro Zeile gefüllt)      │
           └───────────────────────────────────┘
```

Diese Struktur erlaubt es, jedes Reference- und Assessment-Objekt eindeutig einer der drei Ebenen (Mikro / Variant / Alternative) zuzuordnen — eine Voraussetzung sowohl für die Validierung als auch für die spätere Graph-Modellierung.

---

## 7. Konvertierungsskript `excel_to_bb.py`

### 7.1 Architektur und Aufrufschnittstelle

Das Skript ist als Kommandozeilen-Programm implementiert und akzeptiert drei Aufrufmodi:

```bash
python excel_to_bb.py                              # Default: Standardpfade
python excel_to_bb.py --input <path.xlsx>          # Eigener Eingabepfad
python excel_to_bb.py --validate-only              # Nur Validieren, kein Output
python excel_to_bb.py --output <path.json>         # Eigener Ausgabepfad
```

Es gliedert sich in vier sequenzielle Phasen, die im Folgenden im Detail beschrieben werden.

### 7.2 Phase 1: Lesephase (Funktion `read_sheet`)

Jedes Sheet wird mit `openpyxl` geladen. Die Lesephase überspringt die ersten vier Dokumentationszeilen, liest die Spaltenköpfe aus Zeile 5 (in Grossbuchstaben normalisiert, Asterisk für Pflichtfelder entfernt) und iteriert ab Zeile 6 über die Datenzeilen. Vollständig leere Zeilen werden ignoriert; alle Zellwerte werden über die Hilfsfunktion `clean()` von Whitespace und eingebetteten Zeilenumbrüchen normalisiert.

### 7.3 Phase 2: Validierungsphase (Funktion `validate`)

Die Validierungsphase prüft drei Kategorien von Integritätsbedingungen:

**Pflichtfeldprüfung:** Für jedes Sheet wird geprüft, dass alle Pflichtspalten (siehe §6) in jeder Datenzeile befüllt sind. Fehlende Werte werden als Fehler protokolliert.

**Referenzielle Integrität:** Jeder `PARENT_ID`- und `MICRO_ID`-Wert wird gegen die Menge der bekannten IDs aus dem entsprechenden Parent-Sheet geprüft. Fehlende Referenzen werden als Fehler protokolliert.

**Eindeutigkeit der Target-Spalten:** In den Sheets `MIKRO_REFERENCES` und `MIKRO_ASSESSMENTS` wird geprüft, dass pro Zeile genau eine der drei Target-Spalten gefüllt ist. Sowohl null als auch mehrere gleichzeitig befüllte Target-Spalten werden als Fehler protokolliert.

Bei aktivem `--validate-only`-Flag terminiert das Skript nach dieser Phase. Andernfalls werden gefundene Fehler protokolliert; die Konvertierung wird trotzdem fortgesetzt, damit der Anwender die Fehler im Excel iterativ beheben kann.

### 7.4 Phase 3: Aggregationsphase (Funktion `assemble`)

In der Aggregationsphase werden die flach erfassten Sheets in die hierarchische JSON-Struktur überführt. Das Vorgehen nutzt dreistufiges Lookup-Index-Aufbau:

1. **References und Assessments werden nach ihrem Zielobjekt gruppiert** (drei Dictionaries: `refs_by_micro`, `refs_by_variant`, `refs_by_alt`; analog für Assessments). Die Zuordnung erfolgt anhand der gefüllten Target-Spalte.

2. **Variants und Alternatives werden nach ihrem Mikro gruppiert** und um die zugehörigen References und Assessments aus den Index-Dictionaries angereichert.

3. **Mikros werden nach ihrem Meso gruppiert**, Mesos nach ihrem Macro. Auf der Mikro-Ebene werden die zugeordneten Variants, Alternatives, References und Assessments eingebettet.

Das Resultat ist eine geschachtelte Hierarchie, die der späteren JSON-Struktur entspricht.

### 7.5 Phase 4: Serialisierung

Die geschachtelte Datenstruktur wird mit Standard-Bibliotheks-Serialisierung (`json.dump`) als UTF-8-Text mit zwei Leerzeichen Einrückung in die Ausgabedatei geschrieben. Eine abschliessende Übersicht zeigt die Anzahl produzierter Macro-, Meso- und Mikro-Blöcke.

### 7.6 Hilfsfunktionen

Drei Hilfsfunktionen bilden die kanonischen Transformationsregeln:

- `build_scope(s1, s2, s3)`: Wandelt drei `Y`/`N`-Strings in eine Liste der aktiven Schnittstellen um, z.B. `("Y","Y","Y")` → `["S1","S2","S3"]`.
- `build_reference(ref)`: Wandelt eine flache Reference-Zeile in ein verschachteltes JSON-Objekt mit `label`, `organization`, `reference_type`, optional `url`.
- `build_assessment(ass)`: Wandelt eine flache Assessment-Zeile in ein JSON-Objekt mit `interface_scope` (Liste) und `normative_status` (kleingeschrieben).

---

## 8. JSON-Zielstruktur

Das Konvertierungsskript erzeugt eine einzige Datei `building_blocks.json` mit dem folgenden Top-Level-Aufbau:

```json
{
  "document": {
    "standard_id": "eCH-0014",
    "standard_title": "SAGA.ch",
    "version": "8.0"
  },
  "building_blocks": [
    {
      "id": "bb_ma_kommunikationsprotokolle",
      "level": "MAKRO",
      "title": "Kommunikationsprotokolle",
      "semantic_summary": "...",
      "meso_blocks": [
        {
          "id": "bb_me_anwendungsprotokolle",
          "level": "MESO",
          "title": "Anwendungsprotokolle",
          "semantic_summary": "...",
          "mikro_blocks": [
            {
              "id": "bb_mi_http",
              "level": "MIKRO",
              "title": "Hyper Text Transfer Protocol, HTTP",
              "semantic_summary": "...",
              "variants": [ /* ... */ ],
              "alternatives": [],
              "references": [],
              "assessments": []
            }
          ]
        }
      ]
    }
  ]
}
```

Dieselbe Struktur wiederholt sich für Variants und Alternatives auf der untersten Ebene, wobei jede Variant und jede Alternative eigene Listen für `references` und `assessments` enthält.

---

## 9. Vollständiges Beispiel: Mikro-Block HTTP

Dieser Abschnitt zeigt den vollständigen Pfad eines einzelnen Mikro-Blocks von der Quelle bis zum JSON-Output. Er dient als Referenzbeispiel und ist gleichzeitig die wichtigste Validierung der Kodierungsregeln aus §5.

### 9.1 Quelle im PDF (Kapitel 5.5.2)

Der Originaltext im PDF (siehe §2.3) enthält:

- Kapitelüberschrift `5.5.2 Hyper Text Transfer Protocol, HTTP`
- Fliesstext-Beschreibung
- Zwei Bewertungstabellen (für HTTP V1.1 bzw. HTTP V2)
- Pro Bewertungstabelle: eine `Standards:`-Zeile und ggf. eine `Anmerkung:`-Zeile

### 9.2 Erfassung im Excel

Aus dieser Quelle entstehen die folgenden Excel-Zeilen über alle relevanten Sheets:

**Sheet `MIKRO`** (eine Zeile):

| ID | PARENT_ID | LEVEL | TITLE | SEMANTIC_SUMMARY | USES_VARIANTS | USES_ALTERNATIVES |
| --- | --- | --- | --- | --- | --- | --- |
| `bb_mi_http` | `bb_me_anwendungsprotokolle` | `MIKRO` | `Hyper Text Transfer Protocol, HTTP` | `Für die Web-Kommunikation muss HTTP...` | `Y` | `N` |

**Sheet `MIKRO_VARIANTS`** (zwei Zeilen):

| VARIANT_ID | MICRO_ID | TITLE |
| --- | --- | --- |
| `var_http_v1_1` | `bb_mi_http` | `HTTP V1.1` |
| `var_http_v2` | `bb_mi_http` | `HTTP V2` |

**Sheet `MIKRO_REFERENCES`** (drei Zeilen):

| TARGET_MICRO_ID | TARGET_VARIANT_ID | TARGET_ALT_ID | LABEL | ORGANIZATION | REFERENCE_TYPE |
| --- | --- | --- | --- | --- | --- |
| | `var_http_v1_1` | | `HTTP IETF RFC 1945 bzw. RFC 2965, RFC 5785, RFC 7230-40` | `IETF` | `standard` |
| | `var_http_v1_1` | | `Die Sicherung des HTTP-Protokolls über SSL...` | `-` | `anmerkung` |
| | `var_http_v2` | | `IETF RFC 7540` | `IETF` | `standard` |

**Sheet `MIKRO_ASSESSMENTS`** (zwei Zeilen):

| ASSESSMENT_ID | TARGET_VARIANT_ID | SCOPE_S1 | SCOPE_S2 | SCOPE_S3 | NORMATIVE_STATUS |
| --- | --- | --- | --- | --- | --- |
| `ass_http_v1_1` | `var_http_v1_1` | `Y` | `Y` | `Y` | `dringend empfohlen` |
| `ass_http_v2` | `var_http_v2` | `Y` | `Y` | `Y` | `empfohlen` |

### 9.3 Resultat im JSON

Nach der Konvertierung erscheint der Mikro-Block HTTP in `building_blocks.json` wie folgt (gekürzt):

```json
{
  "id": "bb_mi_http",
  "parent_id": "bb_me_anwendungsprotokolle",
  "level": "MIKRO",
  "title": "Hyper Text Transfer Protocol, HTTP",
  "semantic_summary": "Für die Web-Kommunikation muss HTTP...",
  "variants": [
    {
      "variant_id": "var_http_v1_1",
      "title": "HTTP V1.1",
      "references": [
        {
          "label": "HTTP IETF RFC 1945 bzw. RFC 2965, RFC 5785, RFC 7230-40",
          "organization": "IETF",
          "reference_type": "standard"
        },
        {
          "label": "Die Sicherung des HTTP-Protokolls über SSL...",
          "organization": "-",
          "reference_type": "anmerkung"
        }
      ],
      "assessments": [
        {
          "interface_scope": ["S1", "S2", "S3"],
          "normative_status": "dringend empfohlen"
        }
      ]
    },
    {
      "variant_id": "var_http_v2",
      "title": "HTTP V2",
      "references": [
        {
          "label": "IETF RFC 7540",
          "organization": "IETF",
          "reference_type": "standard"
        }
      ],
      "assessments": [
        {
          "interface_scope": ["S1", "S2", "S3"],
          "normative_status": "empfohlen"
        }
      ]
    }
  ],
  "alternatives": [],
  "references": [],
  "assessments": []
}
```

Dieses Beispiel illustriert alle wesentlichen Kodierungsregeln:

- Mikro-Ebene als zentraler Knoten (`bb_mi_http`)
- Differenzierung in zwei Variants (V1.1 und V2)
- References und Assessments **nicht** auf Mikro-Ebene, sondern auf Variant-Ebene — weil das PDF unterschiedliche Bewertungstabellen pro Version zeigt
- Anmerkungstext als eigener Reference-Eintrag mit `reference_type='anmerkung'`
- Leere `alternatives`-, `references`- und `assessments`-Listen auf Mikro-Ebene, da hier nichts direkt ankoppelt

---

## 10. Designentscheidungen

Die folgenden methodischen Entscheidungen wurden während der Modellierung getroffen und begründet. Sie sollten in Kapitel 6 (Implementation) der Thesis kurz erwähnt werden.

**E1 — Externe Standards bleiben auf Excel-Ebene als Reference-Strings, nicht als eigene Sheet-Tabelle.**  
Begründung: Die Promotion zu eigenen Knoten erfolgt erst im Neo4j-Importskript (Step 2). Im Excel-/JSON-Modell bleiben sie eingebettet in der Reference-Liste, weil das Excel als manuelle Erfassungsvorlage bedient werden soll und externe Standards beim Erfassen oft mehrfach in unterschiedlicher Schreibweise erscheinen.

**E2 — Pro Mikro entweder Variants oder Alternatives, nicht beides.**  
Begründung: Vereinfachung der Erfassung und der späteren Abfragelogik. Im V8.0-Datensatz tritt der gemischte Fall nicht auf. Falls in V9.0 mixed cases auftreten, müssten sie als getrennte Mikro-Blöcke modelliert werden.

**E3 — Anmerkungen als separate Reference-Einträge mit `reference_type='anmerkung'`.**  
Begründung: Anmerkungen tragen oft technische Querverweise oder Sicherheitshinweise. Sie als separate Referenz-Objekte zu führen erhält die Strukturinformation, ohne sie im freien Beschreibungsfeld zu verlieren.

**E4 — Idempotenz auf JSON-Ebene durch deterministische Konvertierung.**  
Begründung: Dasselbe Excel produziert deterministisch dasselbe JSON. Dies ist eine Voraussetzung für die Reproduzierbarkeit der späteren Neo4j-Import-Tests.

**E5 — Pflichtfeld-Validierung mit harten Fehlern, aber Konvertierung läuft trotzdem durch.**  
Begründung: Bei iterativer Erfassung ist es nützlich, die Konvertierung zur Inspektion durchlaufen zu lassen, auch wenn einzelne Zeilen Fehler enthalten. Die Fehlerliste am Anfang dient als Korrektur-Checkliste.

**E6 — IDs werden manuell vergeben, nicht automatisch generiert.**  
Begründung: Stabile, fachlich aussagekräftige IDs (z.B. `bb_mi_http` statt einer UUID) sind für die Lesbarkeit von Cypher-Abfragen entscheidend und vereinfachen Debugging und manuelle Korrekturen.

---

## 11. Quantitative Übersicht des V8.0-Datensatzes

Die folgenden Werte beschreiben den Umfang der konvertierten Daten in `building_blocks.json` und dienen als quantitative Validierung der Vollständigkeit:

| Modellklasse | Anzahl |
| --- | ---: |
| Macro-Blöcke | 4 |
| Meso-Blöcke | 32 |
| Mikro-Blöcke | 186 |
| Variants | 113 |
| Alternatives | 14 |
| References (auf Mikro-Ebene) | 90 |
| References (auf Variant-Ebene) | 114 |
| References (auf Alternative-Ebene) | 7 |
| **References gesamt** | **211** |
| Assessments (auf Mikro-Ebene) | 102 |
| Assessments (auf Variant-Ebene) | 113 |
| Assessments (auf Alternative-Ebene) | 14 |
| **Assessments gesamt** | **229** |

**Verteilung des normativen Status (über alle Assessments):**

| Status | Anzahl | Anteil |
| --- | ---: | ---: |
| `empfohlen` | 120 | 52.4 % |
| `dringend empfohlen` | 59 | 25.8 % |
| `unter beobachtung` | 26 | 11.4 % |
| `nicht empfohlen` | 24 | 10.5 % |
| **Total** | **229** | **100 %** |

Die deutliche Häufung in der Kategorie `empfohlen` entspricht dem regulatorischen Charakter von SAGA.ch: der Standard empfiehlt eine breite Palette zulässiger Technologien, schreibt aber nur in selektiven Fällen explizit vor (`dringend empfohlen`).

---

## 12. Validierung und Reproduzierbarkeit

Die Reproduzierbarkeit der Konvertierung ist auf drei Ebenen sichergestellt:

**Eingabedaten:** Die Quell-PDF (eCH-0014 V8.0 vom 13.09.2017) ist über den Verein eCH öffentlich zugänglich. Die `BB_Standard_Import.xlsx` wird dem Repository der Thesis beigelegt.

**Konvertierungsskript:** `excel_to_bb.py` ist eine reine Python-Datei ohne Aussenabhängigkeiten ausser `openpyxl`. Eine fixe Python-Version (3.10+) und `openpyxl>=3.0` reichen zur deterministischen Reproduktion.

**Validierungspfad:** Mit dem Aufruf `python excel_to_bb.py --validate-only` lässt sich die strukturelle Integrität des Excel-Inputs prüfen, ohne den JSON-Output zu erzeugen. Damit kann die Korrektheit der Erfassung jederzeit überprüft werden, auch nach manuellen Anpassungen.

**Verbleibende methodische Subjektivität:** Die manuelle Kodierungsphase (PDF → Excel) bleibt durch ihre Natur subjektiv. Die in §5 dokumentierten Kodierungsregeln und Disambiguierungs-Entscheidungen reduzieren diese Subjektivität auf ein Minimum, eliminieren sie jedoch nicht vollständig. Eine zweite, unabhängige Kodierung durch eine zweite Person (Inter-Coder-Reliabilität) wäre methodisch wünschenswert, war aber im Rahmen einer Bachelor-Thesis nicht durchführbar. Für die qualitative Validierung dient stattdessen der Walkthrough mit eCH-Experten gemäss Disposition §4.3.2.

---

## Anhang: Verwandte Dokumente

| Dokument | Zweck |
| --- | --- |
| `STAN_d_DEF_2017-09-13_eCH-0014_V8_0_SAGA_ch.pdf` | Quelldokument |
| `BB_Standard_Import.xlsx` | Manuelle Erfassungsvorlage |
| `excel_to_bb.py` | Konvertierungsskript |
| `building_blocks.json` | Resultat der Konvertierung |
| `anleitung_excel_building_blocks.md` | Bedienungsanleitung für die Erfassungsvorlage |
| `import_saga.py` | Folgeschritt: Konvertierung JSON → Neo4j (Step 2) |
