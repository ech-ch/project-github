# Examples

[Repository Home](../README.md) > Examples

---

## Zweck dieses Bereichs

Dieser Bereich enthält konkrete Beispiele zur Anwendung der Building-Block-Logik auf eCH-Standards.

Die Beispiele sollen zeigen, wie Standards in Building Blocks gegliedert, beschrieben und mit weiteren Artefakten wie Wissensgraphen, Visualisierungen oder technischen Demonstratoren verbunden werden können.

Sie dienen als praktische Referenz für:

* eCH-Fachgruppen;
* Projektbeteiligte von eCH und ZHAW;
* technische Umsetzungsteams;
* Personen, die Guidelines, Templates oder Modellierungsprinzipien weiterentwickeln;
* Entscheidungsträgerinnen und Entscheidungsträger, die konkrete Resultate des Ansatzes nachvollziehen möchten.

## Rolle der Beispiele

Die Beispiele in diesem Ordner haben nicht den Anspruch, bereits einen verbindlichen eCH-Standardprozess abzubilden. Sie sind als Arbeits- und Referenzmaterial zu verstehen.

Sie können insbesondere helfen, folgende Fragen zu beantworten:

* Wie kann ein bestehender eCH-Standard in Building Blocks gegliedert werden?
* Welche Arten von Building Blocks entstehen bei konkreten Standards?
* Welche Modellierungsentscheidungen sind in der Praxis notwendig?
* Welche Beziehungen zwischen Building Blocks und anderen Standards können sichtbar gemacht werden?
* Welche Anforderungen ergeben sich daraus für Guidelines, Metadaten, Versionierung und technische Plattformfunktionen?

## Aktuell enthaltenes Beispiel

| Ordner                                                                                             | Inhalt                                                                                                                                 |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [`ech-0014-saga-building-blocks-lindrit-ahmetaj/`](ech-0014-saga-building-blocks-lindrit-ahmetaj/) | Beispielhafte Modellierung von eCH-0014 SAGA.ch als Building Blocks und Wissensgraph im Rahmen der Bachelor Thesis von Lindrit Ahmetaj |

## Künftige Beispiele

Dieser Bereich ist so angelegt, dass künftig weitere Beispiele ergänzt werden können.

Mögliche spätere Beispiele sind:

* weitere technische Standards;
* strukturelle Standards;
* beschreibende Standards;
* Standards mit starken Abhängigkeiten zu anderen eCH-Standards;
* Beispiele aus Fachgruppen-Pilotierungen;
* Beispiele für Building-Block-Versionierung;
* Beispiele für Interoperabilitätsmatrizen oder Wissensgraphen.

Für jedes neue Beispiel sollte ein eigener Unterordner erstellt werden.

Empfohlenes Namensschema:

```text
ech-<standardnummer>-<kurzbeschreibung>
```

Beispiele:

```text
ech-0014-saga-building-blocks
ech-0093-meldewesen-building-blocks
ech-0044-personenidentifikation-building-blocks
```

Falls ein Beispiel auf einer spezifischen Arbeit, Studie oder Thesis basiert, kann dies im Ordnernamen ergänzt werden:

```text
ech-0014-saga-building-blocks-lindrit-ahmetaj
```

## Empfohlene Struktur für neue Beispiele

Für künftige Beispiele kann folgende Minimalstruktur verwendet werden:

```text
<example-folder>/
├── README.md
└── artefacts/
```

Je nach Reifegrad des Beispiels können weitere Unterordner ergänzt werden:

```text
<example-folder>/
├── README.md
├── building-blocks/
├── relationships/
├── knowledge-graph/
├── visualisations/
├── modelling-decisions/
└── source-material/
```

Diese Struktur ist nicht verbindlich. Sie kann je nach Umfang, Reifegrad und Zweck des Beispiels angepasst werden.

## Zusammenhang mit den Guidelines

Die Beispiele stehen in engem Zusammenhang mit den Guidelines im Ordner [`02_guidelines-for-working-groups/`](../02_guidelines-for-working-groups/).

Insbesondere können Beispiele dazu beitragen, die folgenden Dokumente weiterzuentwickeln:

* [`building-block-guidelines.md`](../02_guidelines-for-working-groups/building-block-guidelines.md)
* [`guiding-questions.md`](../02_guidelines-for-working-groups/guiding-questions.md)
* [`nomenclature.md`](../02_guidelines-for-working-groups/nomenclature.md)
* [`metadata-template.md`](../02_guidelines-for-working-groups/metadata-template.md)
* [`modelling-principles.md`](../02_guidelines-for-working-groups/modelling-principles.md)

Die Beispiele sollen deshalb nicht isoliert betrachtet werden. Sie dienen auch dazu, die Praxistauglichkeit der Guidelines, der Nomenklatur, der Metadatenstruktur und der Modellierungsprinzipien zu prüfen.

## Status

Dieser Bereich befindet sich im Aufbau.

Aktuell enthält er zunächst ein Beispiel zur Modellierung von eCH-0014 SAGA.ch im Rahmen der Bachelor Thesis von Lindrit Ahmetaj. Weitere Beispiele können im Rahmen der Fachgruppen-Pilotierung oder späterer Projektphasen ergänzt werden.
