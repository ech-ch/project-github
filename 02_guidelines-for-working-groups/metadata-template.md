[Repository Home](../README.md) > [Guidelines for Working Groups](README.md) > Current document

# Metadata Template

## Zweck dieses Dokuments

Dieses Dokument enthält ein einfaches Metadaten-Template zur Beschreibung einzelner **Building Blocks**.

Das Template soll eCH-Fachgruppen dabei unterstützen, Building Blocks strukturiert, nachvollziehbar und möglichst maschinenlesbar zu dokumentieren. Es ist bewusst pragmatisch gehalten und soll in der Pilotierung getestet und weiterentwickelt werden.

Die Versionierung erfolgt in diesem Ansatz auf Ebene der **Building Blocks**. Ein eCH-Standard dient als fachlicher Kontext, während einzelne Building Blocks eigene Versionen, Statusinformationen, Beziehungen und offene Fragen erhalten können.

## Grundidee

Ein Building Block sollte so beschrieben werden, dass andere Fachpersonen verstehen können:

* was der Building Block beschreibt;
* aus welchem Standard oder Standardteil er abgeleitet wurde;
* welche fachliche Funktion er erfüllt;
* welche Version des Building Blocks vorliegt;
* welchen Status der Building Block hat;
* welche Beziehungen zu anderen Building Blocks oder Standards bestehen;
* welche offenen Fragen oder Unsicherheiten noch bestehen.

Das Template kann sowohl als Markdown-Dokument, als YAML-Datei oder als Grundlage für spätere strukturierte Eingabemasken verwendet werden.

## Minimales YAML-Template

Für eine erste Pilotierung wird folgendes minimales YAML-Template empfohlen:

```yaml
id: ""
name: ""
description: ""
standard: ""
building_block_version: "0.1.0"
building_block_type: ""
status: "draft"
responsible_working_group: ""

source_reference:
  document: ""
  section: ""
  title: ""
  page: ""

relationships:
  - type: ""
    target: ""
    target_version: ""
    description: ""

modelling_notes:
  - type: ""
    note: ""

open_questions:
  - ""
```

## Erläuterung der Felder

| Feld                        |   Pflicht | Beschreibung                                                       |
| --------------------------- | --------: | ------------------------------------------------------------------ |
| `id`                        |        ja | Eindeutige maschinenlesbare ID des Building Blocks                 |
| `name`                      |        ja | Fachlicher Name des Building Blocks                                |
| `description`               |        ja | Kurze Beschreibung des Inhalts und Zwecks                          |
| `standard`                  |        ja | eCH-Standard, aus dem der Building Block abgeleitet wurde          |
| `building_block_version`    |        ja | Version des Building Blocks                                        |
| `building_block_type`       |        ja | Typ des Building Blocks, z. B. `concept`, `data_object`, `process` |
| `status`                    |        ja | Bearbeitungsstatus, z. B. `draft`, `to_review`, `approved`         |
| `responsible_working_group` |        ja | Zuständige Fachgruppe                                              |
| `source_reference`          | empfohlen | Verweis auf Ursprungsdokument, Abschnitt oder Quelle im Standard   |
| `relationships`             | empfohlen | Beziehungen zu anderen Building Blocks, Standards oder Artefakten  |
| `modelling_notes`           |  optional | Modellierungsentscheide, Unsicherheiten oder Begründungen          |
| `open_questions`            |  optional | Offene Fragen zur fachlichen oder technischen Klärung              |

## Pflichtfelder

### `id`

Die ID identifiziert den Building Block eindeutig.

Empfohlenes Schema:

```text
ech-<standardnummer>-bb-<kurzname>
```

Beispiele:

```text
ech-0093-bb-meldeadresse
ech-0014-bb-architekturprinzipien
ech-0014-bb-cloud-prinzipien
```

Die ID soll stabil bleiben, auch wenn der fachliche Name später leicht angepasst wird.

### `name`

Der Name beschreibt den Building Block in fachlich verständlicher Form.

Beispiele:

```text
Meldeadresse
Personendaten
Architekturprinzipien
Rolle der meldenden Behörde
Validierungsregel für Identifikatoren
```

Der Name soll für Fachpersonen verständlich sein und nicht nur aus einer technischen oder dokumentbezogenen Bezeichnung bestehen.

### `description`

Die Beschreibung erklärt kurz, was der Building Block umfasst und welche Funktion er innerhalb des Standards erfüllt.

Eine gute Beschreibung beantwortet mindestens:

* Was beschreibt der Building Block?
* Weshalb ist dieser Bestandteil fachlich relevant?
* Welche Funktion erfüllt er im Standard?

Beispiel:

```yaml
description: >
  Beschreibt die Adresse, unter der eine Person im Kontext eines Meldeereignisses
  geführt wird.
```

### `standard`

Das Feld `standard` beschreibt den eCH-Standard, aus dem der Building Block abgeleitet wurde.

Beispiel:

```yaml
standard: eCH-0093
```

Wichtig: Dieses Feld dient als fachlicher Kontext. Die operative Versionierung erfolgt auf Ebene des Building Blocks, nicht auf Ebene des gesamten Standards.

### `building_block_version`

Dieses Feld beschreibt die Version des Building Blocks.

Empfohlenes Schema:

```text
major.minor.patch
```

Beispiele:

```yaml
building_block_version: "0.1.0"
building_block_version: "1.0.0"
building_block_version: "1.1.0"
```

Für die Pilotierung wird empfohlen, mit `0.1.0` zu starten, solange ein Building Block noch nicht fachlich bestätigt ist.

### `building_block_type`

Dieses Feld beschreibt den Typ des Building Blocks.

Empfohlene Werte:

| Wert             | Bedeutung                                           |
| ---------------- | --------------------------------------------------- |
| `concept`        | Fachliches Konzept oder Begriff                     |
| `data_object`    | Datenobjekt oder Entität                            |
| `data_structure` | Datenstruktur, Schema oder Attributgruppe           |
| `process`        | Prozess oder Prozessschritt                         |
| `rule`           | fachliche oder technische Regel                     |
| `requirement`    | Anforderung                                         |
| `interface`      | Schnittstelle oder Austauschstruktur                |
| `role`           | Rolle oder Verantwortlichkeit                       |
| `reference`      | Verweis auf anderen Standard oder externes Artefakt |
| `principle`      | Prinzip, Leitlinie oder Architekturvorgabe          |
| `classification` | Klassifikation, Taxonomie oder Ordnungssystem       |
| `descriptive`    | beschreibender oder orientierender Bestandteil      |
| `governance`     | Governance-, Pflege- oder Entscheidungsstruktur     |
| `other`          | anderer Typ, der noch nicht abgedeckt ist           |

Beispiel:

```yaml
building_block_type: data_object
```

### `status`

Dieses Feld beschreibt den Bearbeitungsstatus des Building Blocks.

Empfohlene Werte:

| Wert         | Bedeutung                                  |
| ------------ | ------------------------------------------ |
| `draft`      | erster Entwurf                             |
| `to_review`  | muss noch geprüft werden                   |
| `in_review`  | in fachlicher Prüfung                      |
| `approved`   | fachlich bestätigt                         |
| `deprecated` | veraltet, soll nicht mehr verwendet werden |
| `replaced`   | durch einen anderen Building Block ersetzt |
| `unclear`    | Status noch unklar                         |

Beispiel:

```yaml
status: draft
```

### `responsible_working_group`

Dieses Feld nennt die Fachgruppe, welche für den Building Block fachlich verantwortlich ist.

Beispiel:

```yaml
responsible_working_group: "Fachgruppe Einwohnerkontrolle"
```

Wenn die Verantwortung noch nicht geklärt ist, kann dies vorläufig festgehalten werden:

```yaml
responsible_working_group: "to_be_defined"
```

## Source Reference

Die `source_reference` dient dazu, nachvollziehbar zu machen, aus welcher Stelle eines Standards ein Building Block abgeleitet wurde.

Beispiel:

```yaml
source_reference:
  document: "eCH-0093"
  section: "3.2"
  title: "Meldeadresse"
  page: ""
```

### Felder der Source Reference

| Feld       | Beschreibung                            |
| ---------- | --------------------------------------- |
| `document` | Standard oder Quelldokument             |
| `section`  | Abschnitt im Standard                   |
| `title`    | Titel des Abschnitts oder Quellbereichs |
| `page`     | optionale Seitenangabe                  |

Die Source Reference ersetzt keine Building-Block-Version. Sie dient der Rückverfolgbarkeit zum ursprünglichen Standarddokument.

## Beziehungen

Das Feld `relationships` dokumentiert Beziehungen zu anderen Building Blocks, Standards oder externen Artefakten.

Beispiel:

```yaml
relationships:
  - type: depends_on
    target: ech-0014-bb-architekturprinzipien
    target_version: "1.0.0"
    description: "Die Umsetzung orientiert sich an den Architekturprinzipien."
```

### Felder einer Beziehung

| Feld             |   Pflicht | Beschreibung                                         |
| ---------------- | --------: | ---------------------------------------------------- |
| `type`           |        ja | Beziehungstyp, z. B. `depends_on`, `uses`, `refines` |
| `target`         |        ja | Ziel der Beziehung                                   |
| `target_version` |  optional | Version des referenzierten Building Blocks           |
| `description`    | empfohlen | Kurze fachliche Beschreibung der Beziehung           |

### Empfohlene Beziehungstypen

| Beziehungstyp            | Bedeutung                            |
| ------------------------ | ------------------------------------ |
| `depends_on`             | ist abhängig von                     |
| `uses`                   | verwendet                            |
| `refers_to`              | verweist auf                         |
| `refines`                | präzisiert                           |
| `extends`                | erweitert                            |
| `implements`             | setzt um                             |
| `replaces`               | ersetzt                              |
| `is_replaced_by`         | wird ersetzt durch                   |
| `is_part_of`             | ist Teil von                         |
| `has_part`               | enthält                              |
| `is_variant_of`          | ist Variante von                     |
| `is_compatible_with`     | ist kompatibel mit                   |
| `is_not_compatible_with` | ist nicht kompatibel mit             |
| `related_to`             | steht in fachlichem Zusammenhang mit |
| `unclear_relation`       | Beziehung ist noch unklar            |

### Versionsabhängige Beziehungen

Wenn eine Beziehung nur für eine bestimmte Version eines Building Blocks gilt, sollte `target_version` angegeben werden.

Beispiel:

```yaml
relationships:
  - type: depends_on
    target: ech-0014-bb-sicherheitsanforderungen
    target_version: "1.0.0"
    description: "Diese Abhängigkeit gilt für Version 1.0.0 der Sicherheitsanforderungen."
```

Wenn sich die Beziehung auf die jeweils aktuelle Version bezieht, kann vorläufig `latest` verwendet werden:

```yaml
relationships:
  - type: related_to
    target: ech-0093-bb-zuzugsmeldung
    target_version: latest
    description: "Steht fachlich im Zusammenhang mit der Zuzugsmeldung."
```

## Modellierungsnotizen

Das Feld `modelling_notes` dokumentiert Modellierungsentscheide, Unsicherheiten oder Begründungen.

Beispiel:

```yaml
modelling_notes:
  - type: unclear_granularity
    note: "Noch zu prüfen, ob Strasse, PLZ und Ort als eigene Building Blocks modelliert werden sollen."
```

Empfohlene Typen:

| Typ                   | Bedeutung                                            |
| --------------------- | ---------------------------------------------------- |
| `unclear_granularity` | Granularität ist noch unklar                         |
| `unclear_relation`    | Beziehung ist noch unklar                            |
| `unclear_version`     | Versionsbezug ist noch unklar                        |
| `needs_decision`      | Entscheid durch Fachgruppe oder Expertengruppe nötig |
| `needs_review`        | fachliche Prüfung nötig                              |
| `candidate`           | möglicher Building Block, noch nicht bestätigt       |
| `out_of_scope`        | aktuell nicht Teil der Pilotierung                   |
| `design_decision`     | bewusster Modellierungsentscheid                     |
| `deviation`           | bewusste Abweichung von einer Guideline              |

## Offene Fragen

Das Feld `open_questions` dokumentiert Fragen, die noch fachlich, organisatorisch oder technisch geklärt werden müssen.

Beispiel:

```yaml
open_questions:
  - "Soll dieser Building Block weiter in einzelne Attributgruppen unterteilt werden?"
  - "Welche Beziehung besteht zu Adressstrukturen in anderen eCH-Standards?"
```

Offene Fragen sollen möglichst konkret formuliert werden, damit sie später in Workshops, Reviews oder GitHub Issues weiterbearbeitet werden können.

## Erweiterte Vorlage

Für fortgeschrittenere Anwendungen kann das Template erweitert werden.

```yaml
id: ""
name: ""
description: ""
standard: ""
building_block_version: "0.1.0"
building_block_type: ""
status: "draft"
responsible_working_group: ""

source_reference:
  document: ""
  section: ""
  title: ""
  page: ""

keywords:
  - ""

relationships:
  - type: ""
    target: ""
    target_version: ""
    description: ""

compatibility_notes:
  - ""

change_history:
  - version: ""
    date: ""
    change_type: ""
    description: ""

examples:
  - title: ""
    description: ""

modelling_notes:
  - type: ""
    note: ""

open_questions:
  - ""
```

## Zusätzliche Felder der erweiterten Vorlage

### `keywords`

Schlagworte helfen bei Suche, Filterung und späterer Darstellung in Plattformen.

Beispiel:

```yaml
keywords:
  - Adresse
  - Meldewesen
  - Einwohnerkontrolle
```

### `compatibility_notes`

Dieses Feld dokumentiert Hinweise zur Kompatibilität mit früheren Versionen oder anderen Building Blocks.

Beispiel:

```yaml
compatibility_notes:
  - "Version 1.1.0 ist fachlich kompatibel mit Version 1.0.0."
  - "Die neue Version ergänzt optionale Angaben, verändert aber keine bestehende Struktur."
```

### `change_history`

Die Änderungshistorie dokumentiert Änderungen an einzelnen Building-Block-Versionen.

Beispiel:

```yaml
change_history:
  - version: "0.1.0"
    date: "2026-09-15"
    change_type: "initial_draft"
    description: "Erste Modellierung im Rahmen der Fachgruppen-Pilotierung."
  - version: "0.2.0"
    date: "2026-10-10"
    change_type: "minor_revision"
    description: "Beschreibung präzisiert und Beziehung zu eCH-0044 ergänzt."
```

Empfohlene `change_type`-Werte:

| Wert             | Bedeutung                                                |
| ---------------- | -------------------------------------------------------- |
| `initial_draft`  | erste Version                                            |
| `minor_revision` | kleinere fachliche Ergänzung                             |
| `major_revision` | grundlegende fachliche Änderung                          |
| `patch`          | redaktionelle oder kleine Korrektur                      |
| `deprecated`     | als veraltet markiert                                    |
| `replaced`       | durch andere Version oder anderen Building Block ersetzt |

### `examples`

Beispiele können helfen, die fachliche Bedeutung des Building Blocks zu verdeutlichen.

Beispiel:

```yaml
examples:
  - title: "Beispiel Meldeadresse"
    description: "Adresse einer Person im Kontext einer Zuzugsmeldung."
```

## Vollständiges Beispiel

```yaml
id: ech-0093-bb-meldeadresse
name: Meldeadresse
description: >
  Beschreibt die Adresse, unter der eine Person im Kontext eines Meldeereignisses
  geführt wird.
standard: eCH-0093
building_block_version: "0.1.0"
building_block_type: data_object
status: draft
responsible_working_group: "Fachgruppe Einwohnerkontrolle"

source_reference:
  document: "eCH-0093"
  section: "3.2"
  title: "Meldeadresse"
  page: ""

keywords:
  - Adresse
  - Meldewesen
  - Einwohnerkontrolle

relationships:
  - type: refers_to
    target: ech-0044-bb-personenidentifikation
    target_version: latest
    description: "Verweist auf den Building Block zur Personenidentifikation."
  - type: related_to
    target: ech-0093-bb-zuzugsmeldung
    target_version: latest
    description: "Wird im Kontext der Zuzugsmeldung verwendet."

compatibility_notes:
  - "Erste Entwurfsversion; Kompatibilität zu anderen Building Blocks noch nicht geprüft."

change_history:
  - version: "0.1.0"
    date: "2026-09-15"
    change_type: "initial_draft"
    description: "Erste Modellierung im Rahmen der Fachgruppen-Pilotierung."

examples:
  - title: "Meldeadresse im Kontext Zuzug"
    description: "Adresse einer Person, die im Rahmen eines Zuzugsereignisses erfasst wird."

modelling_notes:
  - type: unclear_granularity
    note: "Noch zu prüfen, ob Strasse, PLZ und Ort als eigene Building Blocks modelliert werden sollen."
  - type: unclear_version
    note: "Noch offen, ob Beziehungen zu Adressstrukturen anderer Standards versionsspezifisch modelliert werden müssen."

open_questions:
  - "Welche Beziehung besteht zu Adressstrukturen in anderen eCH-Standards?"
  - "Soll die Meldeadresse als eigenes Datenobjekt oder als Teil einer umfassenderen Adressstruktur modelliert werden?"
```

## Markdown-Alternative

Falls eine Fachgruppe zunächst lieber in Markdown arbeitet, kann folgende Struktur verwendet werden:

```markdown
# <Name des Building Blocks>

## Metadaten

| Feld | Wert |
|---|---|
| ID |  |
| Standard |  |
| Building-Block-Version |  |
| Typ |  |
| Status |  |
| Verantwortliche Fachgruppe |  |

## Beschreibung

Kurze Beschreibung des Building Blocks.

## Source Reference

| Feld | Wert |
|---|---|
| Dokument |  |
| Abschnitt |  |
| Titel |  |
| Seite |  |

## Beziehungen

| Typ | Ziel | Zielversion | Beschreibung |
|---|---|---|---|
|  |  |  |  |

## Modellierungsnotizen

- 

## Offene Fragen

- 
```

## Empfehlungen für die Pilotierung

Für die erste Pilotierung wird empfohlen:

* mit dem minimalen Template zu starten;
* pro Building Block eine kurze, verständliche Beschreibung zu erfassen;
* `building_block_version` konsequent zu führen;
* Beziehungen zuerst pragmatisch und nicht zu vollständig zu erfassen;
* `target_version` nur dann auszufüllen, wenn der Versionsbezug fachlich relevant ist;
* Unsicherheiten explizit als `modelling_notes` oder `open_questions` zu dokumentieren;
* nach der ersten Anwendung zu prüfen, welche Felder fehlen oder zu aufwendig sind.

## Prüffragen zum Template

Vor Abschluss einer ersten Beschreibung können folgende Fragen helfen:

* Ist die ID eindeutig?
* Ist der Name fachlich verständlich?
* Ist die Beschreibung ausreichend klar?
* Ist der zugehörige Standard als Kontext angegeben?
* Ist die Building-Block-Version angegeben?
* Ist der Typ passend gewählt?
* Ist der Status korrekt?
* Ist die verantwortliche Fachgruppe angegeben?
* Ist die Quelle im Standard nachvollziehbar dokumentiert?
* Sind relevante Beziehungen dokumentiert?
* Sind versionsabhängige Beziehungen bei Bedarf mit `target_version` versehen?
* Sind Unsicherheiten und offene Fragen sichtbar erfasst?
* Ist die Beschreibung für andere Fachpersonen nachvollziehbar?
* Könnte das Template später maschinenlesbar weiterverarbeitet werden?

## Weiterentwicklung

Dieses Template ist ein Arbeitsstand. Es soll im Rahmen der Fachgruppen-Pilotierung überprüft und weiterentwickelt werden.

Besonders wichtig sind Rückmeldungen zu:

* fehlenden Feldern;
* zu komplexen oder unnötigen Feldern;
* unklaren Beziehungstypen;
* Schwierigkeiten bei der Versionierung;
* Anforderungen an Kompatibilitätsinformationen;
* Anforderungen aus Wissensgraph, Interop-Matrix oder NormBrowser;
* Anforderungen an spätere technische Eingabemasken.

## Zusammenfassung

Das Metadaten-Template soll eine einfache, nachvollziehbare und maschinenlesbare Beschreibung von Building Blocks ermöglichen.

Der wichtigste Grundsatz lautet:

**So wenig Pflichtinformationen wie möglich, aber so viele strukturierte Informationen wie nötig, damit Building Blocks gepflegt, versioniert, verknüpft und weiterverwendet werden können.**
