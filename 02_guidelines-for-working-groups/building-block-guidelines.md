[Repository Home](../README.md) > [Guidelines for Working Groups](README.md) > Current document

# Building Block Guidelines

## Zweck dieses Dokuments

Dieses Dokument beschreibt grundlegende Guidelines zur Identifikation, Abgrenzung und Beschreibung von **Building Blocks** innerhalb von eCH-Standards.

Die Guidelines richten sich an eCH-Fachgruppen, die ihre Standards im Rahmen einer Pilotierung oder Weiterentwicklung modularer strukturieren möchten. Sie sollen Orientierung geben, ohne die fachliche Arbeit der Fachgruppen unnötig einzuschränken.

Die Guidelines sind bewusst als **Arbeitsgrundlage** formuliert. Sie sollen in der praktischen Anwendung überprüft, ergänzt und verbessert werden.

## Grundidee

eCH-Standards liegen heute primär als Dokumente vor. Diese Dokumente enthalten fachliche Konzepte, Datenstrukturen, Prozesse, Anforderungen, Rollen, Schnittstellen, Referenzen und weitere Bestandteile. Viele dieser Bestandteile haben eigene Beziehungen zu anderen Standards oder werden in unterschiedlichen Kontexten wiederverwendet.

Die Building-Block-Logik verfolgt das Ziel, solche Bestandteile expliziter sichtbar zu machen.

Ein Standard wird dabei nicht als monolithisches Dokument betrachtet, sondern als strukturierte Menge fachlich sinnvoller Bausteine. Diese Bausteine können beschrieben, versioniert, referenziert, miteinander verknüpft und für Monitoring- oder Navigationsfunktionen genutzt werden.

## Was ist ein Building Block?

Ein **Building Block** ist ein fachlich sinnvoll abgrenzbarer Bestandteil eines Standards.

Ein Building Block kann zum Beispiel sein:

* ein fachliches Konzept;
* ein Datenobjekt;
* eine Datenstruktur;
* ein Attribut- oder Merkmalsset;
* eine Schnittstellenbeschreibung;
* ein Prozessschritt;
* eine fachliche Regel;
* eine Anforderung;
* ein Rollen- oder Verantwortlichkeitsmodell;
* ein Klassifikationsschema;
* ein wiederverwendbarer Abschnitt;
* eine Referenz auf einen anderen Standard;
* eine technische Spezifikation;
* eine organisatorische Vorgabe.

Ein Building Block muss nicht zwingend direkt technisch implementierbar sein. Entscheidend ist, dass er innerhalb des Standards eine erkennbare Funktion erfüllt und sinnvoll beschrieben, referenziert und mit anderen Building Blocks in Beziehung gesetzt werden kann.

## Was ist kein Building Block?

Nicht jeder Textabschnitt eines Standards ist automatisch ein Building Block.

In der Regel kein eigenständiger Building Block sind:

* rein redaktionelle Einleitungen;
* allgemeine Vorworte;
* formale Inhaltsverzeichnisse;
* einzelne Sätze ohne eigenständige fachliche Bedeutung;
* Beispiele ohne eigene normative oder fachliche Funktion;
* Abschnitte, die nur aufgrund der Dokumentstruktur, aber nicht aus fachlichen Gründen getrennt sind.

Solche Inhalte können dennoch wichtig sein. Sie müssen aber nicht zwingend als eigene Building Blocks modelliert werden.

## Ziel der Modularisierung

Die Modularisierung eines Standards in Building Blocks soll helfen, folgende Fragen besser zu beantworten:

* Welche fachlichen Bestandteile enthält ein Standard?
* Welche Bestandteile sind besonders zentral?
* Welche Bestandteile werden in anderen Standards verwendet oder referenziert?
* Welche Bestandteile hängen von anderen Standards oder Building Blocks ab?
* Welche Bestandteile ändern sich häufiger als andere?
* Welche Bestandteile sind für technische Implementierungen besonders relevant?
* Welche Bestandteile sind eher beschreibend oder orientierend?
* Welche Bestandteile benötigen fachliche Überarbeitung?
* Welche Bestandteile eignen sich für maschinenlesbare Beschreibung?
* Welche Bestandteile können in digitalen Werkzeugen sichtbar gemacht werden?

## Grundprinzipien

### 1. Fachliche Sinnhaftigkeit vor formaler Vollständigkeit

Die Zerlegung in Building Blocks soll fachlich sinnvoll sein. Es ist nicht das Ziel, jeden Abschnitt eines Standards mechanisch in einen Building Block zu übersetzen.

Ein Building Block sollte eine erkennbare fachliche Funktion haben.

### 2. So granular wie nötig, so grob wie möglich

Building Blocks sollten weder zu gross noch zu klein sein.

Ein Building Block ist zu gross, wenn er mehrere fachlich unterschiedliche Themen vermischt, die unterschiedlich gepflegt, versioniert oder referenziert werden müssten.

Ein Building Block ist zu klein, wenn er für sich allein kaum verständlich ist oder keinen eigenständigen Nutzen für Pflege, Referenzierung oder Wiederverwendung hat.

### 3. Wiederverwendbarkeit sichtbar machen

Besonders wichtig sind Bestandteile, die in mehreren Standards vorkommen, von anderen Standards referenziert werden oder in unterschiedlichen Umsetzungskontexten wiederverwendet werden können.

Solche Bestandteile eignen sich besonders gut als Building Blocks.

### 4. Abhängigkeiten explizit dokumentieren

Building Blocks sollen nicht isoliert betrachtet werden. Relevante Beziehungen zu anderen Building Blocks, Standards oder externen Artefakten sollen dokumentiert werden.

Dadurch wird sichtbar, welche Änderungen potenziell Auswirkungen auf andere Standards oder Nutzungskontexte haben.

### 5. Versionierung ermöglichen

Ein Building Block sollte so beschrieben werden, dass Änderungen nachvollzogen werden können.

Nicht alle Building Blocks müssen sofort separat versioniert werden. Die Modellierung sollte aber so angelegt sein, dass eine spätere Versionierung möglich ist.

### 6. Unterschiedliche Standardtypen respektieren

Technische, strukturelle, organisatorische und beschreibende Standards können unterschiedliche Building-Block-Logiken benötigen.

Die Guidelines sollen deshalb nicht erzwingen, dass alle Standards nach exakt demselben Muster zerlegt werden. Abweichungen sind möglich, wenn sie fachlich begründet sind.

### 7. Praxistauglichkeit vor Perfektion

Die erste Modellierung muss nicht perfekt sein. Wichtiger ist, dass ein konsistenter Startpunkt entsteht, der diskutiert, überprüft und verbessert werden kann.

Offene Fragen sollen dokumentiert werden, anstatt die Arbeit zu blockieren.

## Empfohlenes Vorgehen

### Schritt 1: Standard oder Standardteil auswählen

Wählen Sie einen Standard oder einen klar abgegrenzten Teil eines Standards aus.

Für eine erste Pilotierung empfiehlt es sich, mit einem überschaubaren, gut verstandenen Standard oder Standardteil zu beginnen. Besonders geeignet sind Standards, bei denen bereits Bezüge zu anderen Standards bekannt sind oder bei denen Überarbeitungsbedarf besteht.

### Schritt 2: Grobstruktur analysieren

Analysieren Sie zunächst die bestehende Struktur des Standards.

Hilfreiche Fragen:

* Welche Hauptabschnitte enthält der Standard?
* Welche fachlichen Konzepte werden beschrieben?
* Welche Datenobjekte, Prozesse, Rollen oder Regeln kommen vor?
* Welche Abschnitte sind normativ, welche eher beschreibend?
* Welche Bestandteile werden in anderen Standards erwähnt oder referenziert?
* Welche Bestandteile werden in der Praxis häufig verwendet oder diskutiert?

### Schritt 3: Kandidaten für Building Blocks identifizieren

Markieren Sie mögliche Building Blocks.

Ein Bestandteil eignet sich besonders als Building Block, wenn mindestens eine der folgenden Aussagen zutrifft:

* Er hat eine klare fachliche Bedeutung.
* Er wird innerhalb des Standards mehrfach verwendet.
* Er wird von anderen Standards referenziert.
* Er referenziert selbst andere Standards.
* Er könnte separat geändert oder gepflegt werden.
* Er könnte in einer Plattform separat angezeigt oder gesucht werden.
* Er ist für Implementierungen besonders relevant.
* Er beschreibt eine wiederverwendbare fachliche Struktur.
* Er ist für die Interoperabilität zentral.

### Schritt 4: Building Blocks abgrenzen

Entscheiden Sie für jeden Kandidaten, ob er als eigener Building Block modelliert werden soll.

Dabei helfen folgende Fragen:

* Ist der Building Block für sich verständlich beschreibbar?
* Hat er eine eigene fachliche Funktion?
* Kann er sinnvoll mit anderen Building Blocks in Beziehung gesetzt werden?
* Würde eine Änderung dieses Building Blocks potenziell Auswirkungen auf andere Teile haben?
* Ist die Abgrenzung für Fachpersonen nachvollziehbar?
* Ist die Granularität für Pflege und Weiterentwicklung hilfreich?

Wenn die Antwort auf mehrere dieser Fragen ja lautet, ist der Kandidat wahrscheinlich ein sinnvoller Building Block.

### Schritt 5: Building Blocks beschreiben

Jeder Building Block sollte mindestens kurz beschrieben werden.

Empfohlen sind folgende minimale Angaben:

* eindeutige ID;
* Name;
* kurze Beschreibung;
* zugehöriger Standard;
* Building-Block-Version;
* Typ des Building Blocks;
* Status;
* verantwortliche Fachgruppe;
* relevante Beziehungen zu anderen Building Blocks oder Standards;
* offene Fragen oder Modellierungsentscheide.

Eine detaillierte Vorlage befindet sich in `metadata-template.md`.

### Schritt 6: Beziehungen dokumentieren

Dokumentieren Sie relevante Beziehungen zwischen Building Blocks.

Mögliche Beziehungstypen sind zum Beispiel:

| Beziehungstyp | Bedeutung                                                                   |
| ------------- | --------------------------------------------------------------------------- |
| `depends_on`  | Ein Building Block ist von einem anderen abhängig                           |
| `uses`        | Ein Building Block verwendet einen anderen                                  |
| `refers_to`   | Ein Building Block verweist auf einen anderen Standard oder Building Block  |
| `refines`     | Ein Building Block präzisiert einen anderen                                 |
| `extends`     | Ein Building Block erweitert einen anderen                                  |
| `implements`  | Ein Building Block setzt eine fachliche oder technische Vorgabe um          |
| `replaces`    | Ein Building Block ersetzt einen älteren Building Block                     |
| `related_to`  | Ein Building Block steht in einem fachlichen Zusammenhang mit einem anderen |

Diese Liste ist ein Vorschlag und soll im Rahmen der Pilotierung verfeinert werden.

### Schritt 7: Offene Fragen festhalten

Nicht alle Modellierungsentscheide müssen sofort abschliessend gelöst werden.

Offene Fragen können dokumentiert werden, zum Beispiel:

* Ist dieser Bestandteil zu gross oder zu klein?
* Soll dieser Bestandteil ein eigener Building Block sein?
* Welche Beziehung besteht zu einem anderen Standard?
* Ist der Beziehungstyp passend?
* Muss ein zusätzlicher Beziehungstyp eingeführt werden?
* Ist die Benennung verständlich?
* Welche Metadaten fehlen?

Solche Fragen können direkt im Dokument, in Tabellen oder als GitHub Issues festgehalten werden.

### Schritt 8: Rückmeldung zu den Guidelines geben

Die Fachgruppen sollen nicht nur Standards modellieren, sondern auch die Guidelines weiterentwickeln.

Bitte dokumentieren Sie insbesondere:

* welche Guidelines hilfreich waren;
* welche Guidelines unklar waren;
* wo die Guidelines zu streng oder zu offen formuliert sind;
* welche Standardtypen zusätzliche Regeln benötigen;
* welche Templates fehlen;
* welche technischen Hilfsmittel nützlich wären.

## Empfohlene Mindeststruktur eines Building Blocks

Ein Building Block sollte mindestens folgende Informationen enthalten:

```yaml
id: ""
name: ""
description: ""
standard: ""
building_block_version: ""
building_block_type: ""
status: ""
responsible_working_group: ""
relationships:
  - type: ""
    target: ""
    target_version: ""
    description: ""
source_reference:
  - document: ""
    section: ""
    page: ""
open_questions:
  - ""
```

Diese Struktur ist bewusst einfach gehalten. Sie soll als Startpunkt dienen und kann je nach Standardtyp erweitert werden.

## Building-Block-Typen

Für die erste Pilotierung können Building Blocks grob in folgende Typen unterschieden werden:

| Typ              | Beschreibung                                   | Beispiele                                   |
| ---------------- | ---------------------------------------------- | ------------------------------------------- |
| `concept`        | Fachliches Konzept oder Begriff                | Person, Organisation, Meldeereignis         |
| `data_object`    | Datenobjekt oder Entität                       | Adresse, Gemeinde, Personendaten            |
| `data_structure` | Struktur oder Schema                           | Attributgruppe, XML-Struktur, JSON-Struktur |
| `process`        | Prozess oder Prozessschritt                    | Anmeldung, Wegzug, Prüfung                  |
| `rule`           | Fachliche oder technische Regel                | Validierungsregel, Muss-Anforderung         |
| `interface`      | Schnittstelle oder Austauschstruktur           | API, Meldung, Datenlieferung                |
| `role`           | Rolle oder Verantwortlichkeit                  | Fachstelle, Register, Behörde               |
| `reference`      | Verweis auf anderen Standard oder Artefakt     | Bezug zu eCH-x, Gesetz, Architekturvorgabe  |
| `descriptive`    | Beschreibender oder orientierender Bestandteil | Kontextbeschreibung, Governance-Hinweis     |

Diese Typologie ist nicht abschliessend. Fachgruppen können zusätzliche Typen vorschlagen, wenn diese für ihre Standards notwendig sind.

## Umgang mit unterschiedlichen Standardtypen

### Technische Standards

Bei technischen Standards stehen häufig Datenmodelle, Schnittstellen, Formate, Attribute, Validierungsregeln oder Austauschstrukturen im Vordergrund.

Mögliche Building Blocks:

* Datenobjekte;
* Datentypen;
* Attribute;
* Schnittstellen;
* Nachrichtenstrukturen;
* Validierungsregeln;
* technische Abhängigkeiten.

### Strukturelle Standards

Bei strukturellen Standards stehen häufig Ordnungssysteme, Architekturen, Referenzmodelle oder übergreifende Strukturen im Vordergrund.

Mögliche Building Blocks:

* Architekturbausteine;
* Referenzmodelle;
* Klassifikationen;
* Ebenenmodelle;
* Rollenmodelle;
* Abhängigkeitsstrukturen;
* gemeinsame Begriffe.

### Organisatorische Standards

Bei organisatorischen Standards stehen häufig Rollen, Prozesse, Verantwortlichkeiten oder Governance-Regeln im Vordergrund.

Mögliche Building Blocks:

* Rollen;
* Verantwortlichkeiten;
* Prozessschritte;
* Entscheidregeln;
* Review-Prozesse;
* Eskalationsmechanismen;
* Zuständigkeiten.

### Beschreibende Standards

Bei beschreibenden Standards stehen häufig Orientierung, Kontext, Begriffe, Best Practices oder fachliche Einordnung im Vordergrund.

Mögliche Building Blocks:

* fachliche Konzepte;
* Prinzipien;
* Leitlinien;
* Kontextbeschreibungen;
* Best Practices;
* fachliche Beziehungen;
* Governance-Hinweise.

Bei beschreibenden Standards ist besondere Vorsicht bei der Granularität nötig. Nicht jeder beschreibende Abschnitt sollte automatisch als Building Block modelliert werden.

## Qualitätskriterien für Building Blocks

Ein Building Block ist gut modelliert, wenn er möglichst viele der folgenden Kriterien erfüllt:

* Er hat eine klare fachliche Bedeutung.
* Er ist verständlich benannt.
* Er ist kurz, aber ausreichend beschrieben.
* Er ist sinnvoll abgegrenzt.
* Er ist nicht unnötig kleinteilig.
* Er enthält minimale Metadaten.
* Er hat dokumentierte Beziehungen zu relevanten anderen Building Blocks oder Standards.
* Er kann als Building Block eigenständig versioniert oder aktualisiert werden.
* Er unterstützt Pflege, Monitoring oder Wiederverwendung.
* Er ist für Fachpersonen nachvollziehbar.

## Typische Modellierungsfehler

### Zu grobe Building Blocks

Ein Building Block ist zu grob, wenn er mehrere fachlich unterschiedliche Elemente enthält, die separat gepflegt, referenziert oder verändert werden müssten.

Beispiel:

* Ein ganzer Standard wird als ein einziger Building Block modelliert, obwohl er mehrere Datenobjekte, Prozesse und Regeln enthält.

### Zu feine Building Blocks

Ein Building Block ist zu fein, wenn er für sich allein kaum Bedeutung hat.

Beispiel:

* Jeder einzelne Satz oder jedes einzelne Attribut wird automatisch als eigener Building Block modelliert, ohne dass dies für Pflege oder Wiederverwendung einen Mehrwert bietet.

### Unklare Benennung

Ein Building Block sollte so benannt sein, dass seine fachliche Bedeutung erkennbar ist.

Wenig hilfreich:

* `Block 1`
* `Abschnitt 3.2`
* `Daten`

Besser:

* `Personendaten`
* `Meldeadresse`
* `Austauschformat Einwohnerdaten`
* `Rolle der meldenden Behörde`

### Fehlende Beziehungen

Wenn keine Beziehungen dokumentiert werden, bleibt der Nutzen der Building-Block-Logik begrenzt.

Gerade Abhängigkeiten und Verweise sind wichtig, um spätere Auswirkungen von Änderungen sichtbar zu machen.

### Unklare Abgrenzung

Wenn nicht klar ist, warum ein Building Block eigenständig ist, sollte die Abgrenzung überprüft oder kurz begründet werden.

## Dokumentation von Modellierungsentscheiden

Wichtige Modellierungsentscheide sollten nachvollziehbar dokumentiert werden.

Beispiele:

* Warum wurde ein bestimmter Abschnitt als eigener Building Block definiert?
* Warum wurden mehrere Konzepte zusammengefasst?
* Warum wurde ein bestimmter Beziehungstyp verwendet?
* Warum wurde ein Building Block als beschreibend und nicht als technische Struktur klassifiziert?
* Welche offenen Fragen bestehen noch?

Diese Dokumentation ist besonders wichtig, wenn die Ergebnisse später von anderen Fachgruppen, eCH-Gremien oder technischen Teams weiterverwendet werden.

## Umgang mit Unsicherheit

Unsicherheit ist in der ersten Modellierungsphase normal.

Wenn eine Fachgruppe unsicher ist, sollte sie die Unsicherheit explizit dokumentieren, anstatt die Modellierung zu vermeiden.

Empfohlene Markierungen:

| Markierung            | Bedeutung                                            |
| --------------------- | ---------------------------------------------------- |
| `draft`               | Vorläufiger Vorschlag                                |
| `to_review`           | Muss fachlich geprüft werden                         |
| `unclear_granularity` | Granularität ist noch unklar                         |
| `unclear_relation`    | Beziehung zu anderem Element ist noch unklar         |
| `needs_decision`      | Entscheid durch Fachgruppe oder Expertengruppe nötig |

## Minimale Ergebnisse einer Fachgruppen-Pilotierung

Am Ende einer Pilotierung sollte eine Fachgruppe idealerweise folgende Ergebnisse liefern:

1. Liste der betrachteten Standards oder Standardteile;
2. Liste der identifizierten Building Blocks;
3. Kurzbeschreibung jedes Building Blocks;
4. minimale Metadaten je Building Block, inklusive Building-Block-Version und Status;
5. dokumentierte Beziehungen zu anderen Building Blocks oder Standards;
6. offene Modellierungsfragen;
7. Rückmeldungen zu den Guidelines;
8. Vorschläge zur Verbesserung von Templates, Nomenklatur oder Beziehungstypen.

## Rolle der Expertengruppe

Die Expertengruppe unterstützt die Fachgruppen insbesondere bei standardübergreifenden Fragen.

Dazu gehören:

* Definition gemeinsamer Beziehungstypen;
* Abstimmung der minimalen Metadaten;
* Klärung von Nomenklaturfragen;
* Prüfung standardübergreifender Abhängigkeiten;
* Unterstützung bei schwierigen Granularitätsentscheidungen;
* Konsolidierung von Rückmeldungen aus den Fachgruppen;
* Weiterentwicklung der Guidelines.

## Verhältnis zu technischen Hilfsmitteln

Die Building-Block-Modellierung soll langfristig durch technische Hilfsmittel unterstützt werden.

Mögliche Hilfsmittel sind:

* GitHub für strukturierte Ablage, Versionierung, Issues und Reviews;
* YAML- oder JSON-Dateien für maschinenlesbare Metadaten;
* Tabellen für erste Fachgruppenarbeiten;
* Diagramme für Beziehungen und Abhängigkeiten;
* Wissensgraphen für komplexere Verknüpfungen;
* Interoperabilitätsmatrizen zur Darstellung von Beziehungen zwischen Standards;
* Browser- oder Normbrowser-Funktionen zur Navigation.

Die Fachgruppen müssen nicht alle technischen Hilfsmittel selbst beherrschen. Wichtig ist, dass die fachlichen Informationen so erfasst werden, dass sie später technisch weiterverarbeitet werden können.

## Empfehlungen für den Start

Für den Einstieg empfiehlt sich folgendes pragmatisches Vorgehen:

1. Nicht mit dem komplexesten Standard beginnen.
2. Zuerst nur 5–15 Building Blocks identifizieren.
3. Pro Building Block eine kurze Beschreibung erfassen.
4. Nur die wichtigsten Beziehungen dokumentieren.
5. Offene Fragen sichtbar machen.
6. Erfahrungen direkt an den Guidelines spiegeln.
7. Nach der ersten Runde gemeinsam prüfen, ob die Granularität passt.

## Zusammenfassung

Die Building-Block-Guidelines sollen Fachgruppen helfen, eCH-Standards modularer, nachvollziehbarer und maschinenlesbarer zu beschreiben.

Der wichtigste Grundsatz lautet:

**Building Blocks sollen so geschnitten werden, dass sie für Pflege, Wiederverwendung, Monitoring und Weiterentwicklung einen fachlichen Mehrwert bieten.**

Die Guidelines sind nicht abschliessend. Sie sollen gemeinsam mit den Fachgruppen anhand konkreter Standards weiterentwickelt werden.
