[Repository Home](../README.md) > [Guidelines for Working Groups](README.md) > Current document

# Modelling Principles

## Zweck dieses Dokuments

Dieses Dokument beschreibt grundlegende Modellierungsprinzipien für die Gliederung von eCH-Standards in **Building Blocks**.

Die Prinzipien sollen Fachgruppen, Expertengruppen und technische Umsetzungsverantwortliche dabei unterstützen, Building Blocks fachlich sinnvoll, nachvollziehbar, versionierbar und maschinenlesbar zu modellieren.

Das Dokument ergänzt insbesondere:

* `building-block-guidelines.md`
* `guiding-questions.md`
* `nomenclature.md`
* `metadata-template.md`

Während die Guidelines das allgemeine Vorgehen beschreiben, fokussiert dieses Dokument auf die Modellierungsentscheidungen selbst: Granularität, Abgrenzung, Beziehungen, Versionierung, Kompatibilität und Umgang mit unterschiedlichen Standardtypen.

## Grundverständnis

Ein eCH-Standard wird in diesem Ansatz nicht nur als monolithisches Dokument betrachtet, sondern als strukturierte Menge fachlich sinnvoller Building Blocks.

Ein Building Block ist ein Bestandteil eines Standards, der:

* eine erkennbare fachliche Funktion erfüllt;
* sinnvoll beschrieben und benannt werden kann;
* mit anderen Building Blocks oder Standards in Beziehung gesetzt werden kann;
* als eigenständiges Artefakt gepflegt und versioniert werden kann;
* für Monitoring, Wiederverwendung, Navigation oder Interoperabilitätsanalysen relevant sein kann.

Die Versionierung erfolgt auf Ebene der Building Blocks. Der Standard bleibt der fachliche und organisatorische Kontext, aus dem die Building Blocks abgeleitet werden.

## Leitprinzipien der Modellierung

## 1. Fachliche Bedeutung vor Dokumentstruktur

Building Blocks sollen aus fachlichen Überlegungen entstehen, nicht allein aus der bestehenden Kapitelstruktur eines Standards.

Ein Abschnitt eines Standards kann ein guter Hinweis auf einen möglichen Building Block sein. Er ist aber nicht automatisch ein Building Block.

### Gute Gründe für einen Building Block

Ein Bestandteil eignet sich als Building Block, wenn er:

* ein zentrales fachliches Konzept beschreibt;
* eine wiederverwendbare Datenstruktur enthält;
* eine Regel, Anforderung oder Schnittstelle definiert;
* von anderen Standards referenziert wird;
* selbst auf andere Standards verweist;
* separat gepflegt oder geändert werden könnte;
* für Umsetzung, Monitoring oder Review besonders relevant ist.

### Weniger gute Gründe

Ein Bestandteil sollte nicht nur deshalb als Building Block modelliert werden, weil:

* er ein eigenes Kapitel im Dokument ist;
* er auf einer eigenen Seite steht;
* er redaktionell abgetrennt wurde;
* er in einer Tabelle oder Abbildung vorkommt;
* er zufällig gut isolierbar erscheint.

## 2. So granular wie nötig, so grob wie möglich

Die Granularität ist eine der wichtigsten Modellierungsentscheidungen.

Ein Building Block sollte so geschnitten sein, dass er für Pflege, Versionierung, Wiederverwendung und Monitoring einen Mehrwert bietet. Gleichzeitig soll die Modellierung nicht unnötig kleinteilig werden.

### Zu grobe Modellierung

Ein Building Block ist tendenziell zu grob, wenn:

* mehrere fachlich unterschiedliche Inhalte vermischt werden;
* einzelne Teile unabhängig voneinander geändert werden müssten;
* einzelne Teile unterschiedliche Beziehungen zu anderen Standards haben;
* einzelne Teile unterschiedliche Verantwortlichkeiten oder Pflegezyklen haben;
* der Building Block schwer verständlich oder schwer versionierbar wird.

### Zu feine Modellierung

Ein Building Block ist tendenziell zu fein, wenn:

* er für sich allein kaum verständlich ist;
* er keine eigenständige fachliche Bedeutung hat;
* seine separate Pflege keinen Mehrwert bietet;
* sehr viele kleinteilige Elemente ohne klare Struktur entstehen;
* die Modellierung mehr Aufwand als Nutzen erzeugt.

### Passende Granularität

Eine passende Granularität liegt vor, wenn der Building Block:

* fachlich gut abgrenzbar ist;
* eine eigene Funktion erfüllt;
* sinnvoll benannt werden kann;
* eigenständig beschrieben werden kann;
* bei Bedarf eigenständig versioniert werden kann;
* sinnvolle Beziehungen zu anderen Building Blocks haben kann;
* für Fachpersonen nachvollziehbar ist.

## 3. Building Blocks sind fachliche Artefakte, keine reinen technischen Objekte

Ein Building Block muss nicht zwingend direkt implementierbar sein.

Auch fachliche Konzepte, Prinzipien, Rollen, Governance-Elemente oder beschreibende Bestandteile können Building Blocks sein, wenn sie eine eigenständige Funktion erfüllen und für Pflege, Wiederverwendung oder Navigation relevant sind.

### Beispiele technischer oder struktureller Building Blocks

* Datenobjekt
* Datentyp
* Attributgruppe
* Schnittstelle
* Meldungsstruktur
* Validierungsregel
* Architekturbaustein

### Beispiele fachlicher oder beschreibender Building Blocks

* fachliches Konzept
* Prinzip
* Leitlinie
* Rollenmodell
* Governance-Regel
* Kontextbeschreibung mit fachlicher Relevanz
* Referenz auf einen anderen Standard

## 4. Jeder Building Block benötigt eine nachvollziehbare Abgrenzung

Für jeden Building Block sollte nachvollziehbar sein, warum er eigenständig modelliert wurde.

Die Begründung muss nicht lang sein. Häufig genügt eine kurze Beschreibung oder Modellierungsnotiz.

### Hilfreiche Begründungen

Beispiele:

```yaml
modelling_notes:
  - type: design_decision
    note: "Als eigener Building Block modelliert, da diese Datenstruktur in mehreren Meldeprozessen verwendet wird."
```

```yaml
modelling_notes:
  - type: design_decision
    note: "Als eigener Building Block modelliert, da Änderungen an dieser Regel Auswirkungen auf mehrere Schnittstellen haben können."
```

```yaml
modelling_notes:
  - type: unclear_granularity
    note: "Noch offen, ob dieser Building Block weiter in einzelne Attributgruppen unterteilt werden soll."
```

## 5. Building Blocks sollen versionierbar sein

Die Versionierung erfolgt auf Ebene einzelner Building Blocks.

Ein Building Block sollte deshalb so modelliert werden, dass Änderungen an ihm nachvollzogen werden können.

### Eine neue Version kann notwendig sein, wenn:

* sich die fachliche Bedeutung ändert;
* neue Inhalte ergänzt werden;
* bestehende Inhalte entfernt werden;
* Beziehungen zu anderen Building Blocks geändert werden;
* Kompatibilitäten betroffen sind;
* der Building Block ersetzt oder erweitert wird;
* eine redaktionelle Präzisierung nachvollziehbar dokumentiert werden soll.

### Empfohlene Versionslogik

Für Building Blocks wird ein semantisch inspiriertes Schema empfohlen:

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

### Interpretation

| Änderung | Bedeutung                                                  |
| -------- | ---------------------------------------------------------- |
| `major`  | fachlich oder technisch nicht rückwärtskompatible Änderung |
| `minor`  | fachliche Erweiterung ohne Bruch bestehender Nutzung       |
| `patch`  | redaktionelle oder kleinere Korrektur                      |

Für die Pilotierung kann mit `0.1.0` gestartet werden.

## 6. Beziehungen sind zentraler Bestandteil der Modellierung

Der Nutzen der Building-Block-Logik entsteht nicht nur durch die Zerlegung von Standards, sondern vor allem durch die explizite Dokumentation von Beziehungen.

Beziehungen machen sichtbar:

* welche Building Blocks voneinander abhängig sind;
* welche Building Blocks andere verwenden;
* welche Building Blocks einander präzisieren oder erweitern;
* welche Building Blocks mit anderen Standards verbunden sind;
* welche Änderungen potenziell Auswirkungen auf andere Building Blocks haben;
* welche Elemente für Interoperabilität besonders relevant sind.

## 7. Beziehungstypen sollen fachlich begründet werden

Beziehungen sollen nach Möglichkeit typisiert werden.

Empfohlene Beziehungstypen sind unter anderem:

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

Wenn der passende Beziehungstyp unklar ist, soll nicht geraten werden. In diesem Fall kann vorläufig `related_to` oder `unclear_relation` verwendet werden.

## 8. Beziehungen können versionsabhängig sein

Da Building Blocks eigene Versionen haben, können Beziehungen zwischen Building Blocks versionsabhängig sein.

Beispiel:

```yaml
relationships:
  - type: depends_on
    target: ech-0014-bb-sicherheitsanforderungen
    target_version: "1.0.0"
    description: "Diese Abhängigkeit gilt für Version 1.0.0 der Sicherheitsanforderungen."
```

Für die Pilotierung gilt:

* `target` sollte angegeben werden, wenn eine Beziehung bekannt ist;
* `target_version` ist optional;
* `target_version` sollte angegeben werden, wenn die Beziehung nur für bestimmte Versionen gilt;
* `target_version: latest` kann verwendet werden, wenn sich die Beziehung auf die jeweils aktuelle Version bezieht;
* unsichere Versionsbezüge sollen als Modellierungsnotiz festgehalten werden.

## 9. Kompatibilität soll pragmatisch eingeschätzt werden

Nicht jede Kompatibilitätsfrage muss in der Pilotierung formal gelöst werden. Es sollte aber dokumentiert werden, wenn eine Änderung potenziell Auswirkungen auf andere Building Blocks hat.

### Relevante Fragen

* Ist eine neue Version fachlich kompatibel mit der bisherigen Version?
* Welche anderen Building Blocks sind von einer neuen Version betroffen?
* Welche Beziehungen gelten nur für bestimmte Versionen?
* Muss eine frühere Version weiterhin gültig bleiben?
* Wird eine frühere Version ersetzt oder als veraltet markiert?
* Welche Änderung erfordert eine Hauptversion, Nebenversion oder Korrekturversion?

### Beispiel

```yaml
compatibility_notes:
  - "Version 1.1.0 ergänzt optionale Angaben und ist fachlich kompatibel mit Version 1.0.0."
```

```yaml
compatibility_notes:
  - "Version 2.0.0 verändert die fachliche Struktur und ist nicht vollständig kompatibel mit Version 1.0.0."
```

## 10. Source References sichern Rückverfolgbarkeit

Da Building Blocks aus bestehenden Standards abgeleitet werden, sollte ihre Quelle dokumentiert werden.

Die `source_reference` zeigt, aus welchem Dokument, Abschnitt oder Quellbereich ein Building Block stammt.

Beispiel:

```yaml
source_reference:
  document: "eCH-0093"
  section: "3.2"
  title: "Meldeadresse"
  page: ""
```

Die Source Reference ist keine Standardversion. Sie dient der Nachvollziehbarkeit und erleichtert spätere Reviews.

## 11. Unterschiedliche Standardtypen benötigen unterschiedliche Modellierungslogiken

Nicht alle Standards sollen nach exakt demselben Muster modelliert werden.

Technische, strukturelle, organisatorische und beschreibende Standards können unterschiedliche Building-Block-Typen, Granularitäten und Beziehungen benötigen.

### Technische Standards

Bei technischen Standards können Building Blocks zum Beispiel sein:

* Datenobjekte;
* Datentypen;
* Attribute;
* Schnittstellen;
* Nachrichtenstrukturen;
* Validierungsregeln;
* technische Abhängigkeiten.

Hier ist häufig eine präzisere und stärker strukturierte Modellierung sinnvoll.

### Strukturelle Standards

Bei strukturellen Standards können Building Blocks zum Beispiel sein:

* Architekturbausteine;
* Referenzmodelle;
* Klassifikationen;
* Ebenenmodelle;
* Rollenmodelle;
* gemeinsame Begriffe;
* Abhängigkeitsstrukturen.

Hier stehen oft Beziehungen, Ebenen und Ordnungslogiken im Vordergrund.

### Organisatorische Standards

Bei organisatorischen Standards können Building Blocks zum Beispiel sein:

* Rollen;
* Verantwortlichkeiten;
* Prozessschritte;
* Entscheidregeln;
* Review-Prozesse;
* Zuständigkeiten;
* Governance-Strukturen.

Hier sind klare Verantwortlichkeiten und Prozessbeziehungen besonders relevant.

### Beschreibende Standards

Bei beschreibenden Standards können Building Blocks zum Beispiel sein:

* fachliche Konzepte;
* Prinzipien;
* Leitlinien;
* Kontextbeschreibungen;
* Best Practices;
* Governance-Hinweise;
* fachliche Beziehungen.

Hier ist besondere Vorsicht bei der Granularität nötig. Nicht jeder erläuternde Abschnitt sollte als eigener Building Block modelliert werden.

## 12. Modellierung soll Review und Monitoring unterstützen

Building Blocks sollen so modelliert werden, dass sie später für Review, Pflege und Monitoring nutzbar sind.

Dazu sollten insbesondere sichtbar werden:

* welche Building Blocks besonders zentral sind;
* welche Building Blocks viele Abhängigkeiten haben;
* welche Building Blocks häufig referenziert werden;
* welche Building Blocks fachlich oder technisch kritisch sind;
* welche Building Blocks bekannten Überarbeitungsbedarf haben;
* welche Building Blocks von Änderungen anderer Building Blocks betroffen sein könnten;
* welche Building Blocks noch unklare Modellierungsentscheidungen enthalten.

## 13. Unsicherheit soll sichtbar dokumentiert werden

Unsicherheit ist in der ersten Modellierungsphase normal.

Statt unklare Punkte zu verbergen, sollen sie explizit dokumentiert werden. Dadurch können sie später in Fachgruppen, Expertengruppen oder technischen Reviews bearbeitet werden.

### Empfohlene Markierungen

| Markierung            | Bedeutung                                            |
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

### Beispiel

```yaml
modelling_notes:
  - type: unclear_relation
    note: "Mögliche Beziehung zu eCH-0044 muss durch die Expertengruppe geprüft werden."
```

## 14. Abweichungen sind erlaubt, müssen aber begründet werden

Die Guidelines und Modellierungsprinzipien sollen Orientierung geben, aber nicht jede fachliche Besonderheit vorwegnehmen.

Fachgruppen können von vorgeschlagenen Prinzipien abweichen, wenn dies fachlich sinnvoll ist. Die Abweichung sollte jedoch kurz dokumentiert werden.

Beispiel:

```yaml
modelling_notes:
  - type: deviation
    note: "Dieser beschreibende Abschnitt wurde als eigener Building Block modelliert, da er in mehreren Standards als Referenzpunkt verwendet wird."
```

## 15. Maschinenlesbarkeit soll früh mitgedacht werden

Die erste Modellierung kann pragmatisch erfolgen. Trotzdem sollten Building Blocks so beschrieben werden, dass eine spätere maschinenlesbare Weiterverarbeitung möglich ist.

Dazu gehören:

* stabile IDs;
* einheitliche Typen;
* strukturierte Metadaten;
* kontrollierte Beziehungstypen;
* klare Versionsangaben;
* dokumentierte Source References;
* nachvollziehbare Statuswerte;
* explizite offene Fragen.

Maschinenlesbarkeit bedeutet nicht, dass Fachgruppen technische Detailarbeit übernehmen müssen. Es bedeutet, dass fachliche Informationen so strukturiert erfasst werden, dass sie später in technische Werkzeuge überführt werden können.

## 16. Modellierung soll nicht bürokratisieren

Die Building-Block-Logik soll die Arbeit mit Standards erleichtern, nicht unnötig verkomplizieren.

Für die Pilotierung gilt deshalb:

* lieber wenige gute Building Blocks als viele unklare;
* lieber wichtige Beziehungen dokumentieren als alle denkbaren;
* lieber Unsicherheiten sichtbar machen als Scheingenauigkeit erzeugen;
* lieber pragmatisch starten und iterativ verbessern;
* lieber fachlich nachvollziehbar modellieren als formal perfekt.

## 17. Mindestanforderungen an einen Building Block

Für die Pilotierung sollte jeder Building Block mindestens folgende Informationen enthalten:

| Feld                        | Bedeutung                                       |
| --------------------------- | ----------------------------------------------- |
| `id`                        | eindeutige ID                                   |
| `name`                      | fachlicher Name                                 |
| `description`               | Kurzbeschreibung                                |
| `standard`                  | zugehöriger eCH-Standard als fachlicher Kontext |
| `building_block_version`    | Version des Building Blocks                     |
| `building_block_type`       | Typ des Building Blocks                         |
| `status`                    | Bearbeitungsstatus                              |
| `responsible_working_group` | verantwortliche Fachgruppe                      |

Zusätzlich empfohlen:

| Feld                  | Bedeutung                                             |
| --------------------- | ----------------------------------------------------- |
| `source_reference`    | Verweis auf Ursprungsdokument oder Abschnitt          |
| `relationships`       | Beziehungen zu anderen Building Blocks oder Standards |
| `modelling_notes`     | Modellierungsentscheide oder Unsicherheiten           |
| `open_questions`      | offene Fragen                                         |
| `compatibility_notes` | Hinweise zur Kompatibilität                           |

## 18. Qualitätskriterien

Ein Building Block ist gut modelliert, wenn er möglichst viele der folgenden Kriterien erfüllt:

* Er hat eine klare fachliche Bedeutung.
* Er ist verständlich benannt.
* Er ist sinnvoll abgegrenzt.
* Er ist nicht unnötig kleinteilig.
* Er ist nicht zu grob.
* Er enthält minimale Metadaten.
* Er hat eine Building-Block-Version.
* Er ist mit einer Source Reference rückverfolgbar.
* Er hat dokumentierte Beziehungen zu relevanten anderen Building Blocks oder Standards.
* Versionsabhängige Beziehungen sind bei Bedarf markiert.
* Unsicherheiten sind sichtbar dokumentiert.
* Er kann für Pflege, Monitoring, Wiederverwendung oder Navigation genutzt werden.
* Er ist für andere Fachpersonen nachvollziehbar.

## 19. Typische Modellierungsfehler

### 19.1 Ganze Standards als einzelne Building Blocks modellieren

Ein ganzer Standard sollte in der Regel nicht als einzelner Building Block modelliert werden, wenn er mehrere fachlich unterschiedliche Bestandteile enthält.

### 19.2 Jeder Absatz wird ein Building Block

Eine zu kleinteilige Modellierung führt schnell zu unnötiger Komplexität.

### 19.3 Fehlende Beziehungen

Ohne Beziehungen bleibt der Nutzen der Building-Block-Logik begrenzt.

### 19.4 Fehlende Versionierung

Wenn Building Blocks keine Versionen erhalten, können Änderungen nicht gezielt nachvollzogen werden.

### 19.5 Unklare Bezeichnungen

Namen wie `Block 1`, `Abschnitt 4` oder `Daten` sind für fachliche Nutzung und technische Weiterverarbeitung wenig hilfreich.

### 19.6 Unsicherheiten werden nicht dokumentiert

Unklare Entscheide sollten sichtbar gemacht werden, damit sie später überprüft werden können.

### 19.7 Standardversion wird mit Building-Block-Version verwechselt

Die operative Versionierung findet auf Ebene des Building Blocks statt. Der Standard dient als Kontext und Quelle.

## 20. Empfohlenes Vorgehen bei Modellierungsentscheidungen

Wenn eine Fachgruppe unsicher ist, ob ein Bestandteil als Building Block modelliert werden soll, kann folgende Entscheidungslogik helfen:

```text
1. Hat der Bestandteil eine eigenständige fachliche Bedeutung?
   └── Nein: eher kein eigener Building Block
   └── Ja: weiter zu 2

2. Kann der Bestandteil sinnvoll beschrieben und benannt werden?
   └── Nein: mit anderem Bestandteil zusammenführen oder offen markieren
   └── Ja: weiter zu 3

3. Hat der Bestandteil Beziehungen zu anderen Building Blocks oder Standards?
   └── Ja: tendenziell eigener Building Block
   └── Nein: weiter zu 4

4. Würde eine separate Pflege, Versionierung oder Wiederverwendung Mehrwert bieten?
   └── Ja: tendenziell eigener Building Block
   └── Nein: eher kein eigener Building Block oder nur als Kontextinformation erfassen
```

## 21. Rolle der Expertengruppe

Die Expertengruppe unterstützt Fachgruppen insbesondere bei Modellierungsfragen, die über einzelne Standards hinausgehen.

Dazu gehören:

* standardübergreifende Beziehungstypen;
* gemeinsame Nomenklatur;
* Mindestmetadaten;
* Granularitätsfragen bei wiederkehrenden Konzepten;
* Kompatibilitätsfragen zwischen Building-Block-Versionen;
* Umgang mit widersprüchlichen Begriffen;
* Anforderungen an Interop-Matrix, Wissensgraph und NormBrowser;
* Konsolidierung von Rückmeldungen aus den Fachgruppen.

## 22. Rolle technischer Hilfsmittel

Technische Hilfsmittel sollen die Modellierung unterstützen, nicht ersetzen.

Mögliche Hilfsmittel:

* GitHub für Ablage, Versionierung, Issues und Reviews;
* YAML oder JSON für strukturierte Metadaten;
* Markdown für leicht lesbare Beschreibungen;
* Tabellen für erste Fachgruppenarbeiten;
* Mermaid oder andere Diagramme für einfache Visualisierungen;
* Wissensgraphen für komplexe Abhängigkeiten;
* Interop-Matrizen für Beziehungsmuster;
* Browser- oder NormBrowser-Funktionen für Navigation.

Die fachliche Verantwortung für die Modellierung bleibt bei den Fachgruppen und Expertinnen und Experten.

## 23. Zusammenfassung

Die Modellierungsprinzipien sollen helfen, eCH-Standards so in Building Blocks zu gliedern, dass ein echter Mehrwert für Pflege, Monitoring, Wiederverwendung, Interoperabilität und technische Weiterentwicklung entsteht.

Die wichtigsten Prinzipien lauten:

* Building Blocks werden fachlich, nicht rein dokumentstrukturell definiert.
* Building Blocks sind so granular wie nötig und so grob wie möglich.
* Building Blocks erhalten eigene Versionen.
* Beziehungen zwischen Building Blocks sind zentral.
* Beziehungen können versionsabhängig sein.
* Unsicherheit wird sichtbar dokumentiert.
* Unterschiedliche Standardtypen dürfen unterschiedlich modelliert werden.
* Maschinenlesbarkeit wird früh mitgedacht.
* Die Guidelines bleiben eine lebende Arbeitsgrundlage.

Der wichtigste Grundsatz lautet:

**Ein Building Block soll so modelliert werden, dass er fachlich verständlich, eigenständig versionierbar und für Beziehungen zu anderen Building Blocks anschlussfähig ist.**
