# Anleitung zum Ausfüllen der Excel-Tabelle  
**Datei:** `BB Standard Import.xlsx`

## Ziel der Excel-Datei

Diese Excel-Datei dient dazu, dein konzeptionelles Building-Block-Modell **strukturiert, konsistent und maschinenlesbar** zu erfassen, damit daraus später mit einem Python-Skript automatisch eine JSON-Datei erzeugt werden kann.

Die Grundidee ist:

- **MAKRO** beschreibt die übergeordnete Domäne
- **MESO** beschreibt einen Teilbereich innerhalb eines Makro-Blocks
- **MIKRO** beschreibt die konzeptionelle technische Einheit
- **MIKRO_VARIANTS** enthält Varianten eines Mikro-Blocks
- **MIKRO_ALTERNATIVES** enthält funktionale Alternativen eines Mikro-Blocks
- **MIKRO_REFERENCES** enthält technische Referenzen wie RFCs, Standards oder URLs
- **MIKRO_ASSESSMENTS** enthält die normative Bewertung und den Interface Scope

Die Excel-Datei ist also **normalisiert** aufgebaut. Das bedeutet:  
Listen wie `references`, `assessments`, `variants` oder `alternatives` werden **nicht in einer Zelle gesammelt**, sondern in eigenen Sheets erfasst. Dadurch bleibt die Datei sauber, gut pflegbar und sehr einfach in JSON überführbar.

---

# 1. Grundprinzip des Workbooks

## 1.1 Hierarchie

Die Grundhierarchie ist:

**MAKRO -> MESO -> MIKRO**

Zusätzlich kann ein Mikro-Block noch weiter ausdifferenziert werden durch:

- **Varianten** (`MIKRO_VARIANTS`)  
  Beispiel: HTTP -> HTTP/1.1, HTTP/2

- **Alternativen** (`MIKRO_ALTERNATIVES`)  
  Beispiel: Mail-Zugangsprotokolle -> POP3, IMAP4, HTTP für E-Mail

- **Referenzen** (`MIKRO_REFERENCES`)  
  Beispiel: RFC 5321, RFC 7540, OASIS-Link

- **Assessments** (`MIKRO_ASSESSMENTS`)  
  Beispiel: `S1 = Y`, `S2 = Y`, `S3 = Y`, `normative_status = dringend empfohlen`

---

## 1.2 Grundsatz für IDs

Alle IDs sollten:

- eindeutig sein
- stabil bleiben
- nur Kleinbuchstaben, Ziffern und `_` verwenden
- keine Leerzeichen oder Sonderzeichen enthalten

### Empfohlene Konvention
- Makro: `bb_ma_xxx`
- Meso: `bb_me_xxx`
- Mikro: `bb_micro_xxx`
- Variant: `var_xxx`
- Alternative: `alt_xxx`
- Assessment: `ass_xxx`

### Beispiele
- `bb_ma_communication_protocols`
- `bb_me_application_protocols`
- `bb_micro_http`
- `var_http_1_1`
- `alt_pop3`
- `ass_http_1_1_main`

Wichtig ist vor allem: **eine Konvention wählen und konsequent durchziehen**.

---

# 2. Empfohlene Reihenfolge beim Ausfüllen

Damit das Workbook strukturiert bleibt, solltest du es immer in dieser Reihenfolge befüllen:

## Schritt 1
Zuerst **MAKRO** ausfüllen

## Schritt 2
Dann **MESO** ausfüllen  
Dabei muss jeder Meso-Block auf einen existierenden Makro-Block verweisen.

## Schritt 3
Dann **MIKRO** ausfüllen  
Dabei muss jeder Mikro-Block auf einen existierenden Meso-Block verweisen.

## Schritt 4
Falls nötig: **MIKRO_VARIANTS** ausfüllen

## Schritt 5
Falls nötig: **MIKRO_ALTERNATIVES** ausfüllen

## Schritt 6
Dann **MIKRO_REFERENCES** ausfüllen

## Schritt 7
Zum Schluss **MIKRO_ASSESSMENTS** ausfüllen

Diese Reihenfolge ist wichtig, weil die späteren Sheets auf IDs aus den vorherigen Sheets referenzieren.

---

# 3. Sheet für Sheet erklärt

---

# 3.1 Sheet `MAKRO`

## Zweck
Hier werden die übergeordneten Domänen erfasst.

## Spalten
- `ID*`
- `PARENT_ID`
- `LEVEL*`
- `TITLE*`
- `SEMANTIC_SUMMARY*`

## Ausfüllhinweise
### `ID*`
Eindeutige ID des Makro-Blocks

### `PARENT_ID`
Bei Makro in der Regel leer

### `LEVEL*`
Immer: `MAKRO`

### `TITLE*`
Menschenlesbarer Titel

### `SEMANTIC_SUMMARY*`
Kurze fachliche Beschreibung der Domäne

## Beispiel
| ID | PARENT_ID | LEVEL | TITLE | SEMANTIC_SUMMARY |
|---|---|---|---|---|
| bb_ma_communication_protocols |  | MAKRO | Kommunikationsprotokolle | Übergeordnete Domäne für Kommunikationsprotokolle. |

---

# 3.2 Sheet `MESO`

## Zweck
Hier werden Teilbereiche innerhalb eines Makro-Blocks erfasst.

## Spalten
- `ID*`
- `PARENT_ID*`
- `LEVEL*`
- `TITLE*`
- `SEMANTIC_SUMMARY*`

## Ausfüllhinweise
### `ID*`
Eindeutige ID des Meso-Blocks

### `PARENT_ID*`
ID des zugehörigen Makro-Blocks

### `LEVEL*`
Immer: `MESO`

### `TITLE*`
Menschenlesbarer Titel

### `SEMANTIC_SUMMARY*`
Kurze fachliche Beschreibung des Teilbereichs

## Beispiel
| ID | PARENT_ID | LEVEL | TITLE | SEMANTIC_SUMMARY |
|---|---|---|---|---|
| bb_me_application_protocols | bb_ma_communication_protocols | MESO | Anwendungsprotokolle | Teilbereich innerhalb der Kommunikationsprotokolle. |

---

# 3.3 Sheet `MIKRO`

## Zweck
Hier werden die eigentlichen konzeptionellen technischen Einheiten erfasst.

Ein Mikro-Block ist **nicht automatisch ein konkretes RFC-Dokument**, sondern die fachliche Einheit, die in deinem Modell als zentrales Objekt behandelt wird.

## Spalten
- `ID*`
- `PARENT_ID*`
- `LEVEL*`
- `TITLE*`
- `SEMANTIC_SUMMARY*`
- `USES_VARIANTS`
- `USES_ALTERNATIVES`

## Ausfüllhinweise
### `ID*`
Eindeutige ID des Mikro-Blocks

### `PARENT_ID*`
ID des zugehörigen Meso-Blocks

### `LEVEL*`
Immer: `MIKRO`

### `TITLE*`
Menschenlesbarer Titel des Mikro-Blocks

### `SEMANTIC_SUMMARY*`
Kurze fachliche Beschreibung in 1–2 Sätzen

### `USES_VARIANTS`
`Y` oder `N`  
Gibt an, ob der Mikro-Block Varianten besitzt

### `USES_ALTERNATIVES`
`Y` oder `N`  
Gibt an, ob der Mikro-Block funktionale Alternativen besitzt

## Logik von `USES_VARIANTS` und `USES_ALTERNATIVES`
Es gibt drei saubere Fälle:

### Fall A: normaler Mikro-Block
- `USES_VARIANTS = N`
- `USES_ALTERNATIVES = N`

Beispiel: SMTP

### Fall B: Mikro-Block mit Varianten
- `USES_VARIANTS = Y`
- `USES_ALTERNATIVES = N`

Beispiel: HTTP -> HTTP/1.1 und HTTP/2

### Fall C: Mikro-Block mit Alternativen
- `USES_VARIANTS = N`
- `USES_ALTERNATIVES = Y`

Beispiel: Mail-Zugangsprotokolle -> POP3, IMAP4, HTTP für E-Mail

Empfehlung: Für den ersten Import sollte ein Mikro-Block **nicht gleichzeitig Varianten und Alternativen** verwenden.

## Beispiel
| ID | PARENT_ID | LEVEL | TITLE | SEMANTIC_SUMMARY | USES_VARIANTS | USES_ALTERNATIVES |
|---|---|---|---|---|---|---|
| bb_micro_http | bb_me_application_protocols | MIKRO | HTTP | Konzeptionelle technische Einheit für Hyper Text Transfer Protocol. | Y | N |
| bb_micro_smtp | bb_me_application_protocols | MIKRO | SMTP | Konzeptionelle technische Einheit für E-Mail-Transport auf Basis von SMTP. | N | N |
| bb_micro_mail_access_protocols | bb_me_application_protocols | MIKRO | Mail-Zugangsprotokolle | Konzeptionelle Einheit für den standardmässigen Zugang zu E-Mails. | N | Y |

---

# 3.4 Sheet `MIKRO_VARIANTS`

## Zweck
Dieses Sheet enthält konkrete Varianten eines Mikro-Blocks.

Wichtig:  
Eine Variant ist **keine eigene Granularitätsstufe**, sondern eine Untereinheit eines Mikro-Blocks.

## Typische Fälle
- HTTP -> HTTP/1.1, HTTP/2
- Internet Protocol -> IPv4, IPv6
- CMIS -> CMIS 1.1, CMIS 2.0

## Spalten
- `VARIANT_ID*`
- `MICRO_ID*`
- `TITLE*`

## Ausfüllhinweise
### `VARIANT_ID*`
Eindeutige ID der Variant

### `MICRO_ID*`
ID des Mikro-Blocks, zu dem die Variant gehört

### `TITLE*`
Menschenlesbarer Titel der Variant

## Beispiel
| VARIANT_ID | MICRO_ID | TITLE |
|---|---|---|
| var_http_1_1 | bb_micro_http | HTTP/1.1 |
| var_http_2 | bb_micro_http | HTTP/2 |

---

# 3.5 Sheet `MIKRO_ALTERNATIVES`

## Zweck
Dieses Sheet enthält funktionale Alternativen eines Mikro-Blocks.

Alternativen sind **keine Versionen**, sondern unterschiedliche technische Optionen mit derselben funktionalen Rolle.

## Typischer Fall
Mail-Zugangsprotokolle:
- POP3
- IMAP4
- HTTP für E-Mail

## Spalten
- `ALTERNATIVE_ID*`
- `MICRO_ID*`
- `TITLE*`

## Ausfüllhinweise
### `ALTERNATIVE_ID*`
Eindeutige ID der Alternative

### `MICRO_ID*`
ID des Mikro-Blocks, zu dem die Alternative gehört

### `TITLE*`
Menschenlesbarer Titel der Alternative

## Beispiel
| ALTERNATIVE_ID | MICRO_ID | TITLE |
|---|---|---|
| alt_pop3 | bb_micro_mail_access_protocols | POP3 |
| alt_imap4 | bb_micro_mail_access_protocols | IMAP4 |
| alt_http_for_email | bb_micro_mail_access_protocols | HTTP für E-Mail |

---

# 3.6 Sheet `MIKRO_REFERENCES`

## Zweck
Hier werden technische Referenzen gepflegt, also z. B.:

- RFCs
- RFC-Serien
- ISO-/IEC-Standards
- OASIS-Spezifikationen
- URLs

## Ganz wichtige Regel
Pro Zeile darf sich die Referenz auf **genau ein Zielobjekt** beziehen:

- entweder auf einen Mikro-Block
- oder auf eine Variant
- oder auf eine Alternative

Daher gilt:

- genau **eine** der drei Target-Spalten befüllen
- die anderen beiden leer lassen

## Spalten
- `TARGET_MICRO_ID`
- `TARGET_VARIANT_ID`
- `TARGET_ALTERNATIVE_ID`
- `LABEL*`
- `ORGANIZATION*`
- `REFERENCE_TYPE*`
- `URL*`

## Ausfüllhinweise
### `TARGET_MICRO_ID`
Nur befüllen, wenn die Referenz direkt am Mikro-Block hängt

### `TARGET_VARIANT_ID`
Nur befüllen, wenn die Referenz direkt an einer Variant hängt

### `TARGET_ALTERNATIVE_ID`
Nur befüllen, wenn die Referenz direkt an einer Alternative hängt

### `LABEL*`
Menschenlesbare Bezeichnung der Referenz  
Beispiel: `RFC 5321`, `RFC 7540`, `CMIS Version 1.1`

### `ORGANIZATION*`
Herausgebende Organisation  
Beispiel: `IETF`, `OASIS`, `ISO/IEC`

### `REFERENCE_TYPE*`
Typ der Referenz  
Empfohlene Werte:
- `rfc`
- `rfc_series`
- `standard`
- `specification_url`
- `bcp`
- `informational`
- `other`

### `URL*`
Nur befüllen, wenn ein Weblink vorhanden oder gewünscht ist

## Beispiele

### Referenz direkt auf Mikro
| TARGET_MICRO_ID | TARGET_VARIANT_ID | TARGET_ALTERNATIVE_ID | LABEL | ORGANIZATION | REFERENCE_TYPE | URL |
|---|---|---|---|---|---|---|
| bb_micro_smtp |  |  | RFC 5321 | IETF | rfc |  |

### Referenz auf Variant
| TARGET_MICRO_ID | TARGET_VARIANT_ID | TARGET_ALTERNATIVE_ID | LABEL | ORGANIZATION | REFERENCE_TYPE | URL |
|---|---|---|---|---|---|---|
|  | var_http_2 |  | RFC 7540 | IETF | rfc |  |

### Referenz auf Alternative
| TARGET_MICRO_ID | TARGET_VARIANT_ID | TARGET_ALTERNATIVE_ID | LABEL | ORGANIZATION | REFERENCE_TYPE | URL |
|---|---|---|---|---|---|---|
|  |  | alt_pop3 | RFC 1939 | IETF | rfc |  |

### Referenz mit URL
| TARGET_MICRO_ID | TARGET_VARIANT_ID | TARGET_ALTERNATIVE_ID | LABEL | ORGANIZATION | REFERENCE_TYPE | URL |
|---|---|---|---|---|---|---|
| bb_micro_cmis |  |  | CMIS Version 1.1 | OASIS | specification_url | https://www.oasis-open.org/... |

---

# 3.7 Sheet `MIKRO_ASSESSMENTS`

## Zweck
Hier wird die **normative Bewertung** und der **Interface Scope** gepflegt.

Ein Assessment beschreibt also nicht den Block selbst, sondern **wie dieser Block bewertet wird**.

## Ganz wichtige Regel
Auch hier gilt:

- genau **eine** der Target-Spalten befüllen
- die anderen leer lassen

Ein Assessment gehört also zu:
- einem Mikro-Block
- oder einer Variant
- oder einer Alternative

## Spalten
- `ASSESSMENT_ID*`
- `TARGET_MICRO_ID*`
- `TARGET_VARIANT_ID*`
- `TARGET_ALTERNATIVE_ID`
- `SCOPE_S1*`
- `SCOPE_S2*`
- `SCOPE_S3*`
- `NORMATIVE_STATUS*`

## Ausfüllhinweise
### `ASSESSMENT_ID*`
Eindeutige ID des Assessments

### `TARGET_MICRO_ID`
ID des Mikro-Blocks, wenn das Assessment direkt auf Mikro-Ebene liegt

### `TARGET_VARIANT_ID`
ID der Variant, wenn das Assessment auf Variant-Ebene liegt

### `TARGET_ALTERNATIVE_ID`
ID der Alternative, wenn das Assessment auf Alternative-Ebene liegt

### `SCOPE_S1*`, `SCOPE_S2*`, `SCOPE_S3*`
Jeweils `Y` oder `N`

Damit wird später das JSON-Feld `interface_scope` erzeugt.

Beispiel:
- `Y | Y | Y` -> `["S1", "S2", "S3"]`
- `Y | N | N` -> `["S1"]`

### `NORMATIVE_STATUS*`
Normative Bewertung des Zielobjekts

Empfohlene Werte:
- `dringend empfohlen`
- `empfohlen`
- `unter Beobachtung`
- `nicht empfohlen`

## Beispiele

### Assessment direkt auf Mikro
| ASSESSMENT_ID | TARGET_MICRO_ID | TARGET_VARIANT_ID | TARGET_ALTERNATIVE_ID | SCOPE_S1 | SCOPE_S2 | SCOPE_S3 | NORMATIVE_STATUS |
|---|---|---|---|---|---|---|---|
| ass_smtp_01 | bb_micro_smtp |  |  | Y | Y | Y | dringend empfohlen |

### Assessment auf Variant
| ASSESSMENT_ID | TARGET_MICRO_ID | TARGET_VARIANT_ID | TARGET_ALTERNATIVE_ID | SCOPE_S1 | SCOPE_S2 | SCOPE_S3 | NORMATIVE_STATUS |
|---|---|---|---|---|---|---|---|
| ass_http_1_1_01 |  | var_http_1_1 |  | Y | Y | Y | dringend empfohlen |
| ass_http_2_01 |  | var_http_2 |  | Y | Y | Y | empfohlen |

### Assessment auf Mikro mit Alternativen
Wenn die Bewertung für alle Alternativen gemeinsam gilt, dann das Assessment **auf Mikro-Ebene** erfassen:

| ASSESSMENT_ID | TARGET_MICRO_ID | TARGET_VARIANT_ID | TARGET_ALTERNATIVE_ID | SCOPE_S1 | SCOPE_S2 | SCOPE_S3 | NORMATIVE_STATUS |
|---|---|---|---|---|---|---|---|
| ass_mail_access_01 | bb_micro_mail_access_protocols |  |  | Y | N | N | dringend empfohlen |

---

# 4. Wie das später in JSON überführt wird

Das Python-Skript wird später die Informationen aus den einzelnen Sheets zusammenführen.

## Beispiel Mikro ohne Varianten
Aus:

- `MIKRO`
- `MIKRO_REFERENCES`
- `MIKRO_ASSESSMENTS`

wird etwa:

```json
{
  "id": "bb_micro_smtp",
  "parent_id": "bb_me_application_protocols",
  "title": "SMTP",
  "level": "MIKRO",
  "semantic_summary": "Konzeptionelle technische Einheit fuer E-Mail-Transport auf Basis von SMTP.",
  "references": [
    {
      "label": "RFC 5321",
      "organization": "IETF",
      "reference_type": "rfc"
    }
  ],
  "assessments": [
    {
      "interface_scope": ["S1", "S2", "S3"],
      "normative_status": "dringend empfohlen"
    }
  ],
  "variants": [],
  "alternatives": []
}
```

## Beispiel Mikro mit Varianten
HTTP würde später so zusammengesetzt:

- `MIKRO`
- `MIKRO_VARIANTS`
- `MIKRO_REFERENCES`
- `MIKRO_ASSESSMENTS`

---

# 5. Häufige Fehler vermeiden

## Fehler 1
Ein Objekt in mehreren Sheets doppelt erfassen

Beispiel:
- RFC 7540 sowohl beim Mikro-Block HTTP als auch nochmals direkt bei HTTP/2  
Das führt oft zu Inkonsistenzen.

## Fehler 2
Mehrere Target-Spalten gleichzeitig befüllen

Falsch:
- `TARGET_MICRO_ID` und `TARGET_VARIANT_ID` in derselben Zeile

Richtig:
- genau eine Target-Spalte

## Fehler 3
Varianten und Alternativen verwechseln

### Varianten
Versionen oder konkrete Ausprägungen derselben Einheit  
Beispiel: HTTP/1.1, HTTP/2

### Alternativen
Unterschiedliche technische Optionen mit derselben funktionalen Rolle  
Beispiel: POP3, IMAP4, HTTP für E-Mail

## Fehler 4
IDs uneinheitlich vergeben

Nicht:
- `HTTP2`
- `Http_2`
- `bb_micro_HTTP2`

Sondern konsequent:
- `var_http_2`

## Fehler 5
Assessment auf der falschen Ebene ablegen

Beispiel:
Wenn nur `HTTP/1.1` und `HTTP/2` getrennt bewertet werden, dann gehört das Assessment auf die **Variant-Ebene**, nicht auf den Mikro-Block HTTP.
