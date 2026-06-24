[Repository Home](../README.md) > [Guidelines for Working Groups](README.md) > Current document

# Nomenclature

## Zweck dieses Dokuments

Dieses Dokument enthält Vorschläge für eine einheitliche Nomenklatur zur Beschreibung von eCH-Standards als **Building Blocks**.

Eine gemeinsame Nomenklatur soll helfen, Building Blocks konsistent zu benennen, eindeutig zu identifizieren, nachvollziehbar zu versionieren und über Standards hinweg miteinander in Beziehung zu setzen.

Die hier vorgeschlagenen Regeln sind bewusst pragmatisch gehalten. Sie sollen Fachgruppen Orientierung geben, ohne fachlich notwendige Abweichungen zu verhindern.

## Grundprinzipien

Die Nomenklatur folgt fünf Grundprinzipien:

1. **Eindeutigkeit**
   Jeder Building Block soll eindeutig identifizierbar sein.

2. **Nachvollziehbarkeit**
   Namen, IDs und Versionen sollen für Fachpersonen verständlich und erklärbar sein.

3. **Konsistenz**
   Ähnliche Elemente sollen ähnlich benannt und strukturiert werden.

4. **Maschinenlesbarkeit**
   IDs, Typen und Beziehungstypen sollen so formuliert sein, dass sie später in technischen Systemen weiterverarbeitet werden können.

5. **Pragmatismus**
   Die Nomenklatur soll die Fachgruppenarbeit unterstützen und nicht unnötig erschweren.

## Zentrale Begriffe

| Begriff                  | Bedeutung                                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `Standard`               | Ein eCH-Standard als fachlicher und organisatorischer Kontext, aus dem Building Blocks abgeleitet werden             |
| `Building Block`         | Fachlich sinnvoll abgrenzbarer Bestandteil eines Standards                                                           |
| `Building Block Version` | Version eines einzelnen Building Blocks                                                                              |
| `Building Block Type`    | Typisierung eines Building Blocks, z. B. Konzept, Datenobjekt, Prozess oder Regel                                    |
| `Relationship`           | Beziehung zwischen Building Blocks, Standards oder externen Artefakten                                               |
| `Relationship Type`      | Typisierung einer Beziehung, z. B. `depends_on`, `uses` oder `refines`                                               |
| `Metadata`               | Strukturierte Informationen zur Beschreibung eines Building Blocks                                                   |
| `Status`                 | Bearbeitungs- oder Freigabestatus eines Building Blocks                                                              |
| `Working Group`          | Fachgruppe, die für den Standard oder Building Block verantwortlich ist                                              |
| `Source Reference`       | Verweis auf die Stelle im ursprünglichen Standard, aus der ein Building Block abgeleitet wurde                       |
| `Knowledge Graph`        | Graphbasierte Darstellung von Standards, Building Blocks und Beziehungen                                             |
| `Interop Matrix`         | Matrix zur Darstellung von Beziehungen, Abhängigkeiten oder Kompatibilitäten zwischen Standards oder Building Blocks |

## Grundlogik der Versionierung

Die Versionierung erfolgt primär auf Ebene der **Building Blocks**.

Ein eCH-Standard wird in diesem Ansatz als fachlicher und organisatorischer Kontext verstanden. Die operative Nachverfolgung von Änderungen, Kompatibilitäten und Abhängigkeiten soll jedoch möglichst gezielt auf Ebene einzelner Building Blocks erfolgen.

Das bedeutet:

* Ein Standard kann mehrere Building Blocks enthalten.
* Jeder Building Block kann eigene Versionen haben.
* Änderungen an einem Standard müssen nicht zwingend alle Building Blocks betreffen.
* Beziehungen zwischen Building Blocks können versionsabhängig sein.
* Monitoring, Review und Pflege können dadurch gezielter auf einzelne Bestandteile ausgerichtet werden.

Schematisch:

```text
eCH-Standard
├── Building Block A
│   ├── Version 1.0.0
│   ├── Version 1.1.0
│   └── Version 2.0.0
├── Building Block B
│   ├── Version 1.0.0
│   └── Version 1.0.1
└── Building Block C
    └── Version 1.0.0
```

## Sprache und Schreibweise

Für Namen und Beschreibungen gilt:

* Fachliche Bezeichnungen können auf Deutsch geführt werden.
* Maschinenlesbare IDs und Typen sollen kleingeschrieben und ohne Sonderzeichen geführt werden.
* Für maschinenlesbare Werte wird `snake_case` empfohlen.
* Umlaute sollen in maschinenlesbaren IDs ausgeschrieben werden: `ä` → `ae`, `ö` → `oe`, `ü` → `ue`.
* Leerzeichen sollen in maschinenlesbaren IDs durch Bindestriche oder Unterstriche ersetzt werden.
* Für IDs wird Bindestrich `-` empfohlen.
* Für Typen und Beziehungstypen wird Unterstrich `_` empfohlen.

Beispiele:

| Zweck                  | Empfohlen                  |
| ---------------------- | -------------------------- |
| Fachlicher Name        | `Meldeadresse`             |
| Building-Block-ID      | `ech-0093-bb-meldeadresse` |
| Building-Block-Version | `1.0.0`                    |
| Typ                    | `data_object`              |
| Beziehungstyp          | `depends_on`               |
| Status                 | `to_review`                |

## Benennung von Building Blocks

Ein Building Block sollte so benannt werden, dass seine fachliche Bedeutung möglichst klar erkennbar ist.

### Gute Namen

Gute Namen sind:

* fachlich präzise;
* verständlich für Fachpersonen;
* nicht unnötig technisch;
* nicht nur dokumentstrukturell;
* konsistent mit bestehenden eCH-Begriffen;
* möglichst kurz, aber nicht zu allgemein.

Beispiele:

```text
Meldeadresse
Personendaten
Austauschformat Einwohnerdaten
Rolle der meldenden Behörde
Validierungsregel für Identifikatoren
Architekturprinzip Interoperabilität
```

### Weniger geeignete Namen

Weniger geeignet sind Namen, die zu allgemein oder rein dokumentbezogen sind.

Beispiele:

```text
Block 1
Abschnitt 3.2
Daten
Element
Beschreibung
Technischer Teil
Allgemeines
```

Solche Namen können intern vorläufig verwendet werden, sollten aber vor einer Weiterverwendung präzisiert werden.

## Empfohlenes ID-Schema für Building Blocks

Für Building Blocks wird folgendes ID-Schema empfohlen:

```text
ech-<standardnummer>-bb-<kurzname>
```

Beispiele:

```text
ech-0093-bb-meldeadresse
ech-0014-bb-architekturprinzipien
ech-0014-bb-sicherheitsanforderungen
```

### Bestandteile der ID

| Bestandteil        | Bedeutung                                                             | Beispiel       |
| ------------------ | --------------------------------------------------------------------- | -------------- |
| `ech`              | Kennzeichnung als eCH-Artefakt                                        | `ech`          |
| `<standardnummer>` | Nummer des eCH-Standards, aus dem der Building Block abgeleitet wurde | `0093`         |
| `bb`               | Kennzeichnung als Building Block                                      | `bb`           |
| `<kurzname>`       | kurzer maschinenlesbarer Name                                         | `meldeadresse` |

## Regeln für Building-Block-IDs

Building-Block-IDs sollen:

* eindeutig sein;
* stabil bleiben, auch wenn sich der fachliche Name leicht ändert;
* keine Leerzeichen enthalten;
* keine Umlaute enthalten;
* keine Sonderzeichen enthalten, ausser Bindestrich;
* klein geschrieben sein;
* möglichst kurz, aber verständlich sein;
* nicht nur aus einer laufenden Nummer bestehen.

### Empfohlen

```text
ech-0093-bb-meldeadresse
ech-0093-bb-wegzugsmeldung
ech-0014-bb-cloud-prinzipien
ech-0014-bb-referenzarchitektur
```

### Nicht empfohlen

```text
BB1
Block_1
ech0093meldeadresse
eCH-0093-BB-Meldeadresse
ech-0093-bb-äusserung
```

## Umgang mit gleichnamigen Building Blocks

Falls mehrere Standards ähnliche oder gleichnamige Building Blocks enthalten, verhindert die Standardnummer in der ID direkte Namenskonflikte.

Beispiele:

```text
ech-0093-bb-person
ech-0044-bb-person
```

Wenn fachlich geklärt wird, dass diese Building Blocks dasselbe Konzept beschreiben oder stark zusammenhängen, kann dies über Beziehungen modelliert werden.

Beispiel:

```yaml
relationships:
  - type: related_to
    target: ech-0044-bb-person
    target_version: latest
    description: "Beschreibt ein ähnliches fachliches Konzept."
```

## Versionierung von Building Blocks

Die Versionierung erfolgt auf Ebene einzelner Building Blocks.

Jeder Building Block sollte eine eigene Version erhalten, sobald er als eigenständiges Artefakt beschrieben wird. Für die Pilotierung kann mit vorläufigen Versionen gearbeitet werden.

Beispiel:

```yaml
standard: eCH-0093
building_block_version: "0.1.0"
```

Die Angabe `standard` beschreibt den fachlichen Kontext. Sie ist keine führende Versionierungseinheit.

## Empfohlenes Versionierungsschema

Für Building Blocks wird mittelfristig ein semantisch inspiriertes Versionierungsschema empfohlen:

```text
major.minor.patch
```

Beispiele:

```text
0.1.0
1.0.0
1.1.0
1.1.1
2.0.0
```

### Bedeutung

| Änderung | Bedeutung                                                  | Beispiel                                             |
| -------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| `major`  | fachlich oder technisch nicht rückwärtskompatible Änderung | grundlegende Neudefinition eines Building Blocks     |
| `minor`  | fachliche Erweiterung ohne Bruch bestehender Nutzung       | neues optionales Attribut oder zusätzliche Beziehung |
| `patch`  | redaktionelle oder kleinere Korrektur                      | Präzisierung der Beschreibung                        |

Für die Pilotierung wird empfohlen, mit `0.1.0` zu starten, solange der Building Block noch nicht fachlich bestätigt ist.

## Kompatibilität von Building-Block-Versionen

Bei jeder neuen Version sollte geprüft werden, ob sie mit früheren Versionen kompatibel ist.

Hilfreiche Leitfragen:

* Gibt es ältere Versionen dieses Building Blocks?
* Ist eine neue Version fachlich kompatibel mit der bisherigen Version?
* Welche Beziehungen gelten nur für bestimmte Versionen eines Building Blocks?
* Welche anderen Building Blocks sind von einer neuen Version betroffen?
* Muss eine Änderung als neue Hauptversion, Nebenversion oder Korrekturversion geführt werden?
* Soll eine ältere Version weiterhin gültig bleiben?
* Wird eine ältere Version ersetzt oder als veraltet markiert?

Für die Pilotierung genügt eine einfache Einschätzung. Später kann daraus ein formaler Kompatibilitätsmechanismus entstehen.

## Statuswerte

Für den Bearbeitungsstatus von Building Blocks werden folgende Werte empfohlen:

| Status       | Bedeutung                                  |
| ------------ | ------------------------------------------ |
| `draft`      | erster Entwurf                             |
| `in_review`  | in fachlicher Prüfung                      |
| `to_review`  | muss noch geprüft werden                   |
| `approved`   | fachlich bestätigt                         |
| `deprecated` | veraltet, soll nicht mehr verwendet werden |
| `replaced`   | durch anderen Building Block ersetzt       |
| `unclear`    | Status noch unklar                         |

Beispiel:

```yaml
status: draft
```

Für die Pilotierungsphase wird in vielen Fällen `draft` oder `to_review` passend sein.

## Typen von Building Blocks

Für `building_block_type` werden folgende Werte empfohlen:

| Typ              | Bedeutung                                           |
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

Wenn `other` verwendet wird, sollte kurz begründet werden, weshalb kein bestehender Typ passt.

## Beziehungstypen

Beziehungen zwischen Building Blocks, Standards oder weiteren Artefakten sollten nach Möglichkeit typisiert werden.

Empfohlene Beziehungstypen:

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

## Verwendung von Beziehungstypen

### `depends_on`

Verwenden, wenn ein Building Block fachlich oder technisch von einem anderen abhängig ist.

```yaml
relationships:
  - type: depends_on
    target: ech-0014-bb-architekturprinzipien
    target_version: "1.0.0"
    description: "Die Umsetzung orientiert sich an den Architekturprinzipien."
```

### `uses`

Verwenden, wenn ein Building Block einen anderen aktiv verwendet.

```yaml
relationships:
  - type: uses
    target: ech-0044-bb-personenidentifikation
    target_version: latest
    description: "Verwendet die Personenidentifikation gemäss eCH-0044."
```

### `refers_to`

Verwenden, wenn ein Building Block auf einen anderen Standard, Building Block oder ein externes Artefakt verweist.

```yaml
relationships:
  - type: refers_to
    target: eCH-0014
    description: "Verweist auf SAGA.ch als übergeordneten Architekturstandard."
```

### `refines`

Verwenden, wenn ein Building Block einen anderen Building Block präzisiert.

```yaml
relationships:
  - type: refines
    target: ech-0014-bb-cloud-prinzipien
    target_version: "1.0.0"
    description: "Präzisiert die Cloud-Prinzipien für einen spezifischen Nutzungskontext."
```

### `extends`

Verwenden, wenn ein Building Block einen anderen erweitert.

```yaml
relationships:
  - type: extends
    target: ech-0093-bb-meldeadresse
    target_version: "1.0.0"
    description: "Erweitert die Meldeadresse um zusätzliche optionale Angaben."
```

### `implements`

Verwenden, wenn ein Building Block eine Vorgabe umsetzt.

```yaml
relationships:
  - type: implements
    target: ech-0014-bb-sicherheitsanforderungen
    target_version: "1.0.0"
    description: "Setzt eine Sicherheitsanforderung aus eCH-0014 um."
```

### `replaces`

Verwenden, wenn eine neue Version oder ein neuer Building Block eine ältere Version oder einen älteren Building Block ersetzt.

```yaml
relationships:
  - type: replaces
    target: ech-0093-bb-meldeadresse
    target_version: "0.1.0"
    description: "Ersetzt die frühere Entwurfsversion der Meldeadresse."
```

### `related_to`

Verwenden, wenn eine fachliche Beziehung besteht, deren genauer Typ noch nicht festgelegt ist.

```yaml
relationships:
  - type: related_to
    target: ech-0093-bb-zuzugsmeldung
    target_version: latest
    description: "Steht fachlich im Zusammenhang mit der Zuzugsmeldung."
```

### `unclear_relation`

Verwenden, wenn eine Beziehung vermutet wird, aber noch nicht fachlich geklärt ist.

```yaml
relationships:
  - type: unclear_relation
    target: ech-xxxx-bb-unknown
    description: "Mögliche Beziehung, muss durch Fachgruppe geprüft werden."
```

## Versionierung von Beziehungen

Beziehungen können versionsabhängig sein.

Für die Pilotierung wird empfohlen:

* `target` ist erforderlich, wenn eine Beziehung dokumentiert wird;
* `target_version` ist optional;
* `target_version` sollte angegeben werden, wenn die Beziehung nur für eine bestimmte Version gilt;
* `target_version: latest` kann verwendet werden, wenn sich die Beziehung auf die jeweils aktuelle Version beziehen soll;
* unsichere Versionsbezüge sollen dokumentiert werden.

Beispiel:

```yaml
relationships:
  - type: depends_on
    target: ech-0014-bb-architekturprinzipien
    target_version: "1.0.0"
    description: "Diese Abhängigkeit gilt für die Version 1.0.0 der Architekturprinzipien."
```

## Namenskonventionen für Dateien

Für Dateien im Repository werden sprechende englische oder deutsche Namen empfohlen. Innerhalb dieses Repositorys werden überwiegend englische Dateinamen verwendet, um technische Lesbarkeit und Konsistenz zu erleichtern.

Empfohlen:

```text
building-block-guidelines.md
guiding-questions.md
nomenclature.md
metadata-template.md
modelling-principles.md
```

Für Building-Block-Dateien wird folgendes Schema empfohlen:

```text
<building-block-id>.yaml
```

Beispiel:

```text
ech-0093-bb-meldeadresse.yaml
ech-0014-bb-architekturprinzipien.yaml
```

Falls Markdown-Dateien verwendet werden:

```text
ech-0093-bb-meldeadresse.md
ech-0014-bb-architekturprinzipien.md
```

## Ordnerstruktur für Building Blocks

Für Beispiele oder konkrete Standards kann folgende Struktur verwendet werden:

```text
04_examples/
└── ech-0014-saga/
    ├── README.md
    ├── building-blocks/
    │   ├── ech-0014-bb-architekturprinzipien.yaml
    │   ├── ech-0014-bb-cloud-prinzipien.yaml
    │   └── ech-0014-bb-sicherheitsanforderungen.yaml
    ├── knowledge-graph/
    └── visualisations/
```

## IDs für Standards

Standards sollten in einer konsistenten Form referenziert werden:

```text
eCH-0014
eCH-0093
eCH-0044
```

Für maschinenlesbare Werte kann eine kleingeschriebene Variante verwendet werden:

```text
ech-0014
ech-0093
ech-0044
```

Empfehlung:

* In fachlichem Text: `eCH-0014`
* In IDs und Dateinamen: `ech-0014`

## Source References

Da die Versionierung auf Ebene der Building Blocks erfolgt, kann zusätzlich eine **Source Reference** verwendet werden, um nachvollziehbar zu machen, aus welcher Stelle eines Standards ein Building Block abgeleitet wurde.

Beispiel:

```yaml
source_reference:
  document: "eCH-0093"
  section: "3.2"
  title: "Meldeadresse"
  page: ""
```

Die Source Reference dient der Nachvollziehbarkeit. Sie ist nicht dasselbe wie eine Standardversion.

## IDs für Beziehungen

Beziehungen können in YAML oder JSON als Liste modelliert werden.

Beispiel:

```yaml
relationships:
  - type: depends_on
    target: ech-0014-bb-architekturprinzipien
    target_version: "1.0.0"
    description: "Abhängigkeit zu den Architekturprinzipien."
  - type: related_to
    target: ech-0093-bb-meldeadresse
    target_version: latest
    description: "Fachliche Beziehung zur Meldeadresse."
```

Falls Beziehungen eigene IDs benötigen, kann folgendes Schema verwendet werden:

```text
rel-<source-id>-<source-version>-<relationship-type>-<target-id>-<target-version>
```

Beispiel:

```text
rel-ech-0093-bb-meldeadresse-1-0-0-depends_on-ech-0014-bb-architekturprinzipien-1-0-0
```

Für die erste Pilotierung sind eigene Beziehungs-IDs nicht zwingend notwendig.

## Umgang mit Unsicherheit

Unsicherheit sollte explizit markiert werden, statt unklare Entscheide zu verstecken.

Empfohlene Markierungen:

| Wert                  | Bedeutung                                            |
| --------------------- | ---------------------------------------------------- |
| `unclear_granularity` | Granularität ist noch unklar                         |
| `unclear_relation`    | Beziehung ist noch unklar                            |
| `unclear_version`     | Versionsbezug ist noch unklar                        |
| `needs_decision`      | Entscheid durch Fachgruppe oder Expertengruppe nötig |
| `needs_review`        | fachliche Prüfung nötig                              |
| `candidate`           | möglicher Building Block, noch nicht bestätigt       |
| `out_of_scope`        | aktuell nicht Teil der Pilotierung                   |

Beispiel:

```yaml
modelling_notes:
  - type: unclear_granularity
    note: "Noch offen, ob dieser Building Block weiter unterteilt werden soll."
  - type: unclear_version
    note: "Noch offen, ob die Beziehung nur für eine bestimmte Version gilt."
```

## Pflichtfelder und optionale Felder

Für die erste Pilotierung wird zwischen Pflichtfeldern und optionalen Feldern unterschieden.

### Empfohlene Pflichtfelder

| Feld                        | Beschreibung                                |
| --------------------------- | ------------------------------------------- |
| `id`                        | eindeutige ID                               |
| `name`                      | fachlicher Name                             |
| `description`               | Kurzbeschreibung                            |
| `standard`                  | zugehöriger Standard als fachlicher Kontext |
| `building_block_version`    | Version des Building Blocks                 |
| `building_block_type`       | Typ des Building Blocks                     |
| `status`                    | Bearbeitungsstatus                          |
| `responsible_working_group` | zuständige Fachgruppe                       |

### Empfohlene optionale Felder

| Feld                  | Beschreibung                                                               |
| --------------------- | -------------------------------------------------------------------------- |
| `source_reference`    | Verweis auf Ursprungsdokument, Abschnitt oder Quelle im Standard           |
| `relationships`       | Beziehungen zu anderen Building Blocks, Standards oder externen Artefakten |
| `target_version`      | Version eines referenzierten Building Blocks innerhalb einer Beziehung     |
| `keywords`            | Schlagworte                                                                |
| `examples`            | Beispiele                                                                  |
| `modelling_notes`     | Modellierungsentscheide oder Unsicherheiten                                |
| `open_questions`      | offene Fragen                                                              |
| `change_history`      | Änderungshistorie                                                          |
| `compatibility_notes` | Hinweise zur Kompatibilität mit früheren Versionen                         |

## Beispiel eines Building Blocks

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
relationships:
  - type: refers_to
    target: ech-0044-bb-personenidentifikation
    target_version: latest
    description: "Verweist auf den Building Block zur Personenidentifikation."
  - type: related_to
    target: ech-0093-bb-zuzugsmeldung
    target_version: latest
    description: "Wird im Kontext der Zuzugsmeldung verwendet."
keywords:
  - Adresse
  - Meldewesen
  - Einwohnerkontrolle
modelling_notes:
  - type: unclear_granularity
    note: "Noch zu prüfen, ob Strasse, PLZ und Ort als eigene Building Blocks modelliert werden sollen."
compatibility_notes:
  - "Erste Entwurfsversion; Kompatibilität zu anderen Building Blocks noch nicht geprüft."
open_questions:
  - "Welche Beziehung besteht zu Adressstrukturen in anderen eCH-Standards?"
```

## Empfehlungen für die Pilotierung

Für die erste Anwendung in Fachgruppen gilt:

* lieber wenige, gut beschriebene Building Blocks als sehr viele unklare;
* IDs früh vergeben, aber bei Unsicherheit als `draft` markieren;
* Building-Block-Versionen pragmatisch verwenden;
* Beziehungstypen pragmatisch verwenden;
* Versionsbezüge nur dort erfassen, wo sie fachlich relevant sind;
* Unsicherheiten sichtbar dokumentieren;
* neue Typen oder Beziehungstypen vorschlagen, wenn bestehende nicht ausreichen;
* Nomenklatur nicht als starres Regelwerk, sondern als gemeinsame Grundlage verstehen.

## Prüffragen zur Nomenklatur

Vor Abschluss einer ersten Modellierung können folgende Fragen helfen:

* Hat jeder Building Block eine eindeutige ID?
* Hat jeder Building Block eine eigene Version?
* Ist der Name fachlich verständlich?
* Ist der Name nicht zu allgemein?
* Ist der Typ passend gewählt?
* Ist der Status angegeben?
* Ist der zugehörige Standard als fachlicher Kontext dokumentiert?
* Ist die Quelle im Standard nachvollziehbar dokumentiert?
* Sind Beziehungen konsistent typisiert?
* Sind versionsabhängige Beziehungen entsprechend markiert?
* Sind offene Unsicherheiten sichtbar markiert?
* Sind Dateinamen und IDs maschinenlesbar?
* Gibt es Begriffe, die mit anderen Standards abgestimmt werden sollten?

## Weiterentwicklung

Diese Nomenklatur soll im Rahmen der Fachgruppen-Pilotierung weiterentwickelt werden.

Besonders wichtig sind Rückmeldungen zu:

* fehlenden Building-Block-Typen;
* unklaren Beziehungstypen;
* fehlenden oder unklaren Versionsregeln;
* Anforderungen an Kompatibilitätsangaben zwischen Building-Block-Versionen;
* zu komplexen oder zu einfachen ID-Regeln;
* praktischen Problemen bei der Benennung;
* Konflikten mit bestehenden eCH-Begriffen;
* Anforderungen an maschinenlesbare Weiterverarbeitung;
* Anforderungen aus Wissensgraph, Interop-Matrix oder NormBrowser.

## Zusammenfassung

Eine gemeinsame Nomenklatur schafft die Grundlage dafür, Building Blocks über Standards hinweg verständlich, eindeutig und maschinenlesbar zu beschreiben.

Der wichtigste Grundsatz lautet:

**Namen sollen für Fachpersonen verständlich sein; IDs, Typen und Versionen sollen für technische Weiterverarbeitung stabil und eindeutig sein.**
