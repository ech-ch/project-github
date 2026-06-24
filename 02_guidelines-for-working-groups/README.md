# Guidelines for Working Groups

## Zweck dieses Bereichs

Dieser Bereich enthält Guidelines, Leitfragen, Templates und Modellierungsprinzipien für eCH-Fachgruppen, die ihre Standards in **Building Blocks** gliedern möchten.

Die Guidelines sollen Fachgruppen dabei unterstützen, bestehende Standards schrittweise modularer, nachvollziehbarer und maschinenlesbarer zu beschreiben. Ziel ist nicht, ein starres Regelwerk vorzugeben. Vielmehr sollen die Fachgruppen eine gemeinsame Arbeitsgrundlage erhalten, die genügend Orientierung bietet und gleichzeitig Raum für unterschiedliche Standardtypen, fachliche Bedürfnisse und Weiterentwicklungen lässt.

## Hintergrund

eCH-Standards sind häufig umfangreiche Dokumente mit fachlichen, technischen, organisatorischen und beschreibenden Inhalten. In der Praxis können einzelne Bestandteile eines Standards unterschiedliche Rollen erfüllen:

* einige Bestandteile werden in mehreren Standards wiederverwendet;
* einige Bestandteile ändern sich häufiger als andere und sollten deshalb als eigene Building Blocks versionierbar sein;
* einige Bestandteile haben starke Abhängigkeiten zu anderen Standards;
* einige Bestandteile sind für technische Implementierungen besonders relevant;
* andere Bestandteile dienen eher der fachlichen Beschreibung, Einordnung oder Governance.

Die Building-Block-Logik soll helfen, diese Bestandteile expliziter sichtbar zu machen. Dadurch können Standards auf Ebene ihrer Building Blocks besser gepflegt, versioniert, analysiert und in digitalen Werkzeugen dargestellt werden.

## Ziel der Guidelines

Die Guidelines unterstützen Fachgruppen insbesondere bei folgenden Aufgaben:

* geeignete Standards oder Standardteile für eine Pilotierung auswählen;
* Standards in fachlich sinnvolle Building Blocks gliedern;
* Building Blocks einheitlich beschreiben;
* relevante Metadaten erfassen;
* Abhängigkeiten und Verknüpfungen zwischen Building Blocks dokumentieren;
* Rückmeldungen zur Praxistauglichkeit der Guidelines geben;
* Hinweise zur Weiterentwicklung der Building-Block-Logik liefern.

## Inhalt dieses Ordners

Dieser Ordner enthält mehrere Arbeitsdokumente, die gemeinsam die Grundlage für die Fachgruppenarbeit bilden.

| Datei                                                          | Zweck                                                                                                                |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [`building-block-guidelines.md`](building-block-guidelines.md) | Grundlegende Guidelines zur Identifikation, Abgrenzung und Beschreibung von Building Blocks                          |
| [`guiding-questions.md`](guiding-questions.md)                 | Leitfragen für Fachgruppen zur praktischen Analyse konkreter Standards und zur Reflexion der Modellierungsentscheide |
| [`nomenclature.md`](nomenclature.md)                           | Vorschläge für Benennung, IDs, Building-Block-Versionierung, Statuswerte und Beziehungstypen                         |
| [`metadata-template.md`](metadata-template.md)                 | Einfaches Template zur strukturierten und möglichst maschinenlesbaren Beschreibung einzelner Building Blocks         |
| [`modelling-principles.md`](modelling-principles.md)           | Modellierungsprinzipien für Granularität, Abgrenzung, Beziehungen, Versionierung und Kompatibilität                  |

## Empfohlene Lesereihenfolge

Für den Einstieg empfehlen wir folgende Reihenfolge:

1. [`building-block-guidelines.md`](building-block-guidelines.md)
   Grundverständnis: Was ist ein Building Block und wie wird ein Standard modularisiert?

2. [`guiding-questions.md`](guiding-questions.md)
   Praktische Leitfragen für Workshops und Fachgruppenarbeit.

3. [`metadata-template.md`](metadata-template.md)
   Konkrete Vorlage zur Beschreibung einzelner Building Blocks.

4. [`nomenclature.md`](nomenclature.md)
   Regeln und Vorschläge für IDs, Namen, Typen, Statuswerte, Beziehungstypen und Building-Block-Versionen.

5. [`modelling-principles.md`](modelling-principles.md)
   Vertiefende Prinzipien für Granularität, Abgrenzung, Versionierung, Kompatibilität und maschinenlesbare Weiterverarbeitung.

## Arbeitsverständnis

Die Guidelines sind bewusst als **lebende Arbeitsgrundlage** formuliert. Sie sollen im Rahmen der Pilotierung durch Fachgruppen geprüft und verbessert werden.

Das bedeutet:

* Fachgruppen dürfen und sollen Rückmeldungen geben.
* Abweichungen sind möglich, sofern sie fachlich begründet werden.
* Unterschiedliche Standardtypen können unterschiedliche Modellierungslogiken benötigen.
* Die Guidelines sollen aus der praktischen Anwendung heraus weiterentwickelt werden.
* Ziel ist ein gemeinsames Verständnis, keine bürokratische Zusatzbelastung.

## Was ist ein Building Block?

Ein **Building Block** ist ein fachlich sinnvoll abgrenzbarer Bestandteil eines Standards.

Ein Building Block kann zum Beispiel sein:

* ein Datenobjekt;
* eine Datenstruktur;
* ein Prozessschritt;
* eine Schnittstellenbeschreibung;
* ein fachliches Konzept;
* ein Rollen- oder Verantwortlichkeitsmodell;
* eine Anforderung;
* ein Klassifikationsschema;
* ein wiederverwendbarer Abschnitt eines Standards;
* eine fachliche Regel oder Spezifikation.

Ein Building Block muss nicht zwingend technisch implementierbar sein. Wichtig ist, dass er innerhalb des Standards eine erkennbare Funktion erfüllt und sinnvoll beschrieben, referenziert und mit anderen Building Blocks in Beziehung gesetzt werden kann.

## Grundidee der Modularisierung

Die Modularisierung eines Standards in Building Blocks soll helfen, folgende Fragen besser zu beantworten:

* Welche Bestandteile enthält ein Standard?
* Welche Bestandteile sind besonders zentral?
* Welche Bestandteile werden in anderen Standards verwendet oder referenziert?
* Welche Bestandteile hängen von anderen Standards oder Building Blocks ab?
* Welche Bestandteile ändern sich häufig?
* Welche Bestandteile sind für Implementierungen besonders relevant?
* Welche Bestandteile benötigen fachliche Überarbeitung?
* Welche Bestandteile können in digitalen Werkzeugen sichtbar gemacht werden?

## Erwartung an Fachgruppen

Von Fachgruppen wird im Rahmen der Pilotierung insbesondere erwartet, dass sie:

1. **1–2 geeignete Standards auswählen**
   Die Fachgruppe wählt Standards aus, die sich für eine erste Anwendung der Building-Block-Logik eignen.

2. **Standards in erste Building Blocks gliedern**
   Die Fachgruppe identifiziert fachlich sinnvolle Bestandteile des Standards und beschreibt diese als Building Blocks.

3. **Metadaten erfassen**
   Für jeden Building Block werden minimale Informationen dokumentiert, z. B. Name, Beschreibung, Standardzugehörigkeit, Status und Building-Block-Version.

4. **Verknüpfungen dokumentieren**
   Relevante Beziehungen zu anderen Building Blocks, Standards oder externen Artefakten werden festgehalten.

5. **Guidelines kritisch reflektieren**
   Die Fachgruppe dokumentiert, wo die Guidelines hilfreich sind, wo sie zu unklar sind und wo Anpassungen nötig wären.

6. **Weiterentwicklung unterstützen**
   Die Erfahrungen aus der Fachgruppenarbeit fliessen in die Verbesserung der Guidelines, Templates und Modellierungsprinzipien ein.

## Empfohlenes Vorgehen für Fachgruppen

### Schritt 1: Standard auswählen

Wählen Sie einen Standard oder einen klar abgegrenzten Teil eines Standards aus. Für die Pilotierung ist es sinnvoll, nicht mit dem komplexesten Standard zu beginnen.

### Schritt 2: Standard grob strukturieren

Identifizieren Sie die wichtigsten Bestandteile des Standards. Markieren Sie Abschnitte, Konzepte, Datenobjekte, Prozesse oder Anforderungen, die als mögliche Building Blocks betrachtet werden könnten.

### Schritt 3: Erste Building Blocks definieren

Legen Sie für jeden Building Block einen Namen, eine kurze Beschreibung und eine Begründung der Abgrenzung fest.

### Schritt 4: Metadaten erfassen

Nutzen Sie das Template in `metadata-template.md`, um minimale Informationen zu jedem Building Block zu dokumentieren.

### Schritt 5: Beziehungen erfassen

Dokumentieren Sie, ob ein Building Block andere Building Blocks verwendet, verfeinert, ersetzt, referenziert oder von ihnen abhängig ist.

### Schritt 6: Offene Fragen dokumentieren

Nicht alle Entscheidungen müssen sofort abschliessend getroffen werden. Offene Fragen können als Issues oder Kommentare dokumentiert werden.

### Schritt 7: Rückmeldung geben

Halten Sie fest, welche Teile der Guidelines verständlich, hilfreich, unklar oder zu restriktiv sind.

## Nicht-Ziele

Die Guidelines sollen nicht dazu führen, dass Fachgruppen ihre Standards vollständig neu schreiben müssen.

Sie sollen auch nicht bedeuten, dass jeder Absatz eines Standards mechanisch in einen Building Block übersetzt werden muss. Die Building-Block-Logik soll fachlich sinnvoll angewendet werden und einen Mehrwert für Pflege, Nachvollziehbarkeit, Wiederverwendung und Monitoring schaffen.

## Status

Dieses Dokument ist ein Arbeitsstand. Die Inhalte sollen im Rahmen der Fachgruppen-Pilotierung überprüft, ergänzt und verfeinert werden.
