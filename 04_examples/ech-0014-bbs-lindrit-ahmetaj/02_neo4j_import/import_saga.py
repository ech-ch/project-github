"""
SAGA.ch (eCH-0014 V8.0) -> Neo4j Knowledge Graph Importer
=========================================================

Reads a structured Building Block JSON (produced from BB_Standard_Import.xlsx)
and loads it into a Neo4j graph using the schema documented below.

Usage
-----
    export NEO4J_URI=bolt://localhost:7687
    export NEO4J_USER=neo4j
    export NEO4J_PASSWORD=your_password
    python import_saga.py path/to/building_blocks.json

Schema
------
    Nodes
        (:Document {id, title, version})
        (:Building_Block:Macro {id, title, semantic_summary})
        (:Building_Block:Meso  {id, title, semantic_summary})
        (:Building_Block:Mikro {id, title, semantic_summary, notes?})
        (:Variant     {id, title})
        (:Alternative {id, title})
        (:External_Standard {key, label, organization?, url?})
        (:Interface   {id, description})            # S1, S2, S3 - fixed

    Relationships
        (:Document)-[:DEFINES]->(:Macro)
        (:Macro)-[:CONTAINS]->(:Meso)
        (:Meso)-[:CONTAINS]->(:Mikro)
        (:Mikro)-[:HAS_VARIANT]->(:Variant)
        (:Mikro)-[:HAS_ALTERNATIVE]->(:Alternative)
        (:Variant|:Alternative|:Mikro)-[:REFERENCES {reference_type}]->(:External_Standard)
        (:Variant|:Alternative|:Mikro)-[:APPLIES_TO {normative_status}]->(:Interface)

Design decisions (for thesis chapter 6.1 / 6.2)
-----------------------------------------------
1.  Single-version graph (V8.0 only). The `version` is stored on the Document
    node so that adding V9 later requires only a `version` property on the
    Building_Block nodes — no schema changes.

2.  Idempotent imports: every write uses MERGE. Re-running the script on the
    same JSON produces the same graph (relevant for the stability metric in
    Disposition §4.3.1).

3.  Assessments with empty `interface_scope` (e.g. Telnet, CORBA -
    "nicht empfohlen" without a specific Schnittstelle) are broadcast to all
    three interfaces. The SAGA semantics for "no scope listed" is global.

4.  External standards are split conservatively. Comma-separated reference
    labels are tokenized into one External_Standard node per token IF at
    least 70% of tokens match a known prefix (RFC, ISO, IEEE, ITU, ...).
    Otherwise the whole label becomes one node. See `split_references()`.
    Trade-off: avoids false splits on free-text annotations; accepts that
    some mixed labels will be coarser than ideal.

5.  Reference rows of type 'anmerkung' / 'bemerkung' / 'information' are
    NOT promoted to External_Standard nodes - they are free-text remarks and
    are stored on the source node as a `notes` property instead.

6.  Placeholder values ('-', '.', 'N', 'n', '') in any field are normalized
    to NULL during import.
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path
from typing import Any

from neo4j import GraphDatabase, Driver, Transaction


# --------------------------------------------------------------------------
# Constants
# --------------------------------------------------------------------------

PLACEHOLDER_VALUES = {"-", ".", "n", "N", ""}

# Prefixes that identify a "clean" external-standard reference token.
# Used by split_references() to decide whether a comma-separated label
# can be safely tokenised.
REFERENCE_PREFIX = re.compile(
    r"^(?:"
    r"RFC|ISO|ISO/IEC|IEEE|ITU|ITU-T|X\.|H\.|DIN|BSI|NIST|W3C|OASIS|"
    r"TCP|UDP|HTTP|UDDI|MTOM|UML|XMI|XPDL|BPEL|BPMN|XBRL|XHTML|JSON|"
    r"RDF|ATOM|RSS|WSDL|SAML|XACML|MQTT|AMQP|STOMP|SIP|RTP|RTCP|"
    r"LDAP|DSML|OCSP|sedex|swissdec|eCH|MEDIA@Komm|Adobe|Microsoft"
    r")\b",
    re.IGNORECASE,
)

# Reference rows of these types describe free-text remarks rather than
# authoritative external standards, and are NOT promoted to nodes.
NON_STANDARD_REF_TYPES = {"anmerkung", "bemerkung", "information"}

# The three SAGA Schnittstellen (cf. eCH-0014 §4.2)
INTERFACES = [
    ("S1", "Schnittstelle S1: Endbenutzer <-> eGovernment-Anwendung"),
    ("S2", "Schnittstelle S2: eGovernment-Anwendung <-> eGovernment-Anwendung"),
    ("S3", "Schnittstelle S3: eGovernment-Anwendung <-> Backend / Drittsystem"),
]


# --------------------------------------------------------------------------
# Schema (constraints + indexes)
# --------------------------------------------------------------------------

CONSTRAINTS = [
    "CREATE CONSTRAINT doc_id    IF NOT EXISTS FOR (d:Document)          REQUIRE d.id  IS UNIQUE",
    "CREATE CONSTRAINT bb_id     IF NOT EXISTS FOR (b:Building_Block)    REQUIRE b.id  IS UNIQUE",
    "CREATE CONSTRAINT var_id    IF NOT EXISTS FOR (v:Variant)           REQUIRE v.id  IS UNIQUE",
    "CREATE CONSTRAINT alt_id    IF NOT EXISTS FOR (a:Alternative)       REQUIRE a.id  IS UNIQUE",
    "CREATE CONSTRAINT ext_key   IF NOT EXISTS FOR (e:External_Standard) REQUIRE e.key IS UNIQUE",
    "CREATE CONSTRAINT iface_id  IF NOT EXISTS FOR (i:Interface)         REQUIRE i.id  IS UNIQUE",
    "CREATE INDEX bb_title       IF NOT EXISTS FOR (b:Building_Block)    ON (b.title)",
    "CREATE INDEX var_title      IF NOT EXISTS FOR (v:Variant)           ON (v.title)",
    "CREATE INDEX ext_org        IF NOT EXISTS FOR (e:External_Standard) ON (e.organization)",
]


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

def clean(value: Any) -> str | None:
    """Collapse placeholder values to None; strip whitespace otherwise."""
    if value is None:
        return None
    s = str(value).strip()
    return None if s in PLACEHOLDER_VALUES else s


def split_references(label: str) -> list[str]:
    """
    Split a reference label into individual standard tokens.

    Splits on ', ' if at least 70% of comma-separated tokens match a
    known reference prefix (and at least 2 do). Otherwise returns the
    label as a single-element list.

    Examples
    --------
    >>> split_references("RFC 1939, RFC 1957, RFC 2449")
    ['RFC 1939', 'RFC 1957', 'RFC 2449']

    >>> split_references("RFC 791, RFC 951, TCP RFC 793, UDP RFC 768")
    ['RFC 791', 'RFC 951', 'TCP RFC 793', 'UDP RFC 768']

    >>> split_references("ISO/IEC 9834")
    ['ISO/IEC 9834']

    >>> split_references("Some free-text description, with commas")
    ['Some free-text description, with commas']
    """
    if not label:
        return []
    label = label.strip()
    if "," not in label:
        return [label]
    tokens = [t.strip() for t in label.split(",") if t.strip()]
    if not tokens:
        return [label]
    matches = sum(1 for t in tokens if REFERENCE_PREFIX.match(t))
    if matches >= max(2, int(len(tokens) * 0.7)):
        return tokens
    return [label]


# --------------------------------------------------------------------------
# Cypher write functions (each runs inside a single transaction)
# --------------------------------------------------------------------------

def setup_schema(tx: Transaction) -> None:
    for q in CONSTRAINTS:
        tx.run(q)


def upsert_interfaces(tx: Transaction) -> None:
    for iid, desc in INTERFACES:
        tx.run(
            "MERGE (i:Interface {id:$id}) SET i.description = $desc",
            id=iid, desc=desc,
        )


def upsert_document(tx: Transaction, doc: dict) -> None:
    tx.run(
        """
        MERGE (d:Document {id:$id})
        SET d.title = $title, d.version = $version
        """,
        id=doc["standard_id"], title=doc["standard_title"], version=doc["version"],
    )


def upsert_macro(tx: Transaction, ma: dict, doc_id: str) -> None:
    tx.run(
        """
        MERGE (b:Building_Block:Macro {id:$id})
        SET b.title = $title, b.semantic_summary = $summary
        WITH b
        MATCH (d:Document {id:$did})
        MERGE (d)-[:DEFINES]->(b)
        """,
        id=ma["id"], title=ma["title"],
        summary=clean(ma.get("semantic_summary")), did=doc_id,
    )


def upsert_meso(tx: Transaction, me: dict) -> None:
    tx.run(
        """
        MERGE (b:Building_Block:Meso {id:$id})
        SET b.title = $title, b.semantic_summary = $summary
        WITH b
        MATCH (p:Macro {id:$pid})
        MERGE (p)-[:CONTAINS]->(b)
        """,
        id=me["id"], title=me["title"],
        summary=clean(me.get("semantic_summary")), pid=me["parent_id"],
    )


def upsert_mikro(tx: Transaction, mi: dict) -> None:
    tx.run(
        """
        MERGE (b:Building_Block:Mikro {id:$id})
        SET b.title = $title, b.semantic_summary = $summary
        WITH b
        MATCH (p:Meso {id:$pid})
        MERGE (p)-[:CONTAINS]->(b)
        """,
        id=mi["id"], title=mi["title"],
        summary=clean(mi.get("semantic_summary")), pid=mi["parent_id"],
    )


def upsert_variant(tx: Transaction, mikro_id: str, var: dict) -> None:
    tx.run(
        """
        MERGE (v:Variant {id:$vid})
        SET v.title = $title
        WITH v
        MATCH (m:Mikro {id:$mid})
        MERGE (m)-[:HAS_VARIANT]->(v)
        """,
        vid=var["variant_id"], title=var["title"], mid=mikro_id,
    )


def upsert_alternative(tx: Transaction, mikro_id: str, alt: dict) -> None:
    tx.run(
        """
        MERGE (a:Alternative {id:$aid})
        SET a.title = $title
        WITH a
        MATCH (m:Mikro {id:$mid})
        MERGE (m)-[:HAS_ALTERNATIVE]->(a)
        """,
        aid=alt["alternative_id"], title=alt["title"], mid=mikro_id,
    )


def upsert_references(
    tx: Transaction,
    source_label: str,
    source_id: str,
    references: list[dict],
    note_sink: list[str],
) -> int:
    """
    Attach references to the source node. Returns the number of
    External_Standard tokens created/merged.
    """
    n = 0
    for ref in references or []:
        rtype = clean(ref.get("reference_type")) or "standard"
        org = clean(ref.get("organization"))
        url = clean(ref.get("url"))
        raw_label = clean(ref.get("label"))
        if not raw_label:
            continue
        if rtype.lower() in NON_STANDARD_REF_TYPES:
            note_sink.append(raw_label)
            continue
        for token in split_references(raw_label):
            tx.run(
                f"""
                MERGE (e:External_Standard {{key:$key}})
                ON CREATE SET e.label = $key, e.organization = $org, e.url = $url
                ON MATCH  SET e.organization = coalesce(e.organization, $org),
                              e.url          = coalesce(e.url, $url)
                WITH e
                MATCH (s:{source_label} {{id:$sid}})
                MERGE (s)-[r:REFERENCES]->(e)
                SET r.reference_type = $rtype
                """,
                key=token, org=org, url=url, sid=source_id, rtype=rtype,
            )
            n += 1
    return n


def upsert_assessments(
    tx: Transaction,
    source_label: str,
    source_id: str,
    assessments: list[dict],
) -> int:
    """
    Create APPLIES_TO edges. Empty interface_scope => broadcast to S1/S2/S3.
    Returns number of edges created/merged.
    """
    n = 0
    for ass in assessments or []:
        status = clean(ass.get("normative_status"))
        if not status:
            continue
        # normalize status capitalization (the Excel mixes 'unter Beobachtung'
        # and 'unter beobachtung'; Cypher is case-sensitive)
        status = status.lower()
        scope = ass.get("interface_scope") or []
        if not scope:                   # global => broadcast
            scope = ["S1", "S2", "S3"]
        for iface in scope:
            tx.run(
                f"""
                MATCH (s:{source_label} {{id:$sid}})
                MATCH (i:Interface {{id:$iid}})
                MERGE (s)-[a:APPLIES_TO {{normative_status:$status}}]->(i)
                """,
                sid=source_id, iid=iface, status=status,
            )
            n += 1
    return n


def attach_notes(tx: Transaction, mikro_id: str, notes: list[str]) -> None:
    """Persist accumulated free-text remarks on the Mikro node."""
    if notes:
        tx.run(
            "MATCH (m:Mikro {id:$mid}) SET m.notes = $notes",
            mid=mikro_id, notes=notes,
        )


# --------------------------------------------------------------------------
# Orchestrator
# --------------------------------------------------------------------------

def run_import(driver: Driver, data: dict) -> dict[str, int]:
    doc = data["document"]
    counts = {
        "macro": 0, "meso": 0, "mikro": 0,
        "variant": 0, "alternative": 0,
        "references": 0, "assessments": 0,
    }

    with driver.session() as session:
        # Schema first (idempotent)
        session.execute_write(setup_schema)
        session.execute_write(upsert_interfaces)
        session.execute_write(upsert_document, doc)

        for ma in data["building_blocks"]:
            session.execute_write(upsert_macro, ma, doc["standard_id"])
            counts["macro"] += 1

            for me in ma.get("meso_blocks", []):
                session.execute_write(upsert_meso, me)
                counts["meso"] += 1

                for mi in me.get("mikro_blocks", []):
                    session.execute_write(upsert_mikro, mi)
                    counts["mikro"] += 1
                    notes: list[str] = []

                    counts["references"] += session.execute_write(
                        upsert_references, "Mikro", mi["id"],
                        mi.get("references", []), notes,
                    )
                    counts["assessments"] += session.execute_write(
                        upsert_assessments, "Mikro", mi["id"],
                        mi.get("assessments", []),
                    )

                    for v in mi.get("variants", []):
                        session.execute_write(upsert_variant, mi["id"], v)
                        counts["variant"] += 1
                        counts["references"] += session.execute_write(
                            upsert_references, "Variant", v["variant_id"],
                            v.get("references", []), notes,
                        )
                        counts["assessments"] += session.execute_write(
                            upsert_assessments, "Variant", v["variant_id"],
                            v.get("assessments", []),
                        )

                    for a in mi.get("alternatives", []):
                        session.execute_write(upsert_alternative, mi["id"], a)
                        counts["alternative"] += 1
                        counts["references"] += session.execute_write(
                            upsert_references, "Alternative", a["alternative_id"],
                            a.get("references", []), notes,
                        )
                        counts["assessments"] += session.execute_write(
                            upsert_assessments, "Alternative", a["alternative_id"],
                            a.get("assessments", []),
                        )

                    session.execute_write(attach_notes, mi["id"], notes)

    return counts


def graph_summary(driver: Driver) -> None:
    """Print node/relationship counts as a smoke test."""
    with driver.session() as session:
        nodes = session.run(
            "MATCH (n) RETURN labels(n) AS lbl, count(*) AS c ORDER BY c DESC"
        ).data()
        rels = session.run(
            "MATCH ()-[r]->() RETURN type(r) AS rel, count(*) AS c ORDER BY c DESC"
        ).data()

    print("\nNode counts:")
    for row in nodes:
        print(f"  {':'.join(row['lbl']):40s} {row['c']}")
    print("\nRelationship counts:")
    for row in rels:
        print(f"  {row['rel']:40s} {row['c']}")


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------

def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    json_path = Path(sys.argv[1]).resolve()
    if not json_path.is_file():
        print(f"ERROR: file not found: {json_path}", file=sys.stderr)
        sys.exit(2)
    data = json.loads(json_path.read_text(encoding="utf-8"))

    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    user = os.getenv("NEO4J_USER", "neo4j")
    pwd = os.getenv("NEO4J_PASSWORD")
    if not pwd:
        print("ERROR: env var NEO4J_PASSWORD is required.", file=sys.stderr)
        sys.exit(3)

    print(f"Connecting to {uri} as {user} ...")
    driver = GraphDatabase.driver(uri, auth=(user, pwd))
    try:
        driver.verify_connectivity()
        print(f"Importing {json_path.name} (Document {data['document']['standard_id']} V{data['document']['version']}) ...")
        counts = run_import(driver, data)
        print("\nImport complete:")
        for k, v in counts.items():
            print(f"  {k:14s} {v}")
        graph_summary(driver)
    finally:
        driver.close()


if __name__ == "__main__":
    main()
