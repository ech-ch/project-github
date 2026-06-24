// =====================================================================
// SAGA.ch Knowledge Graph - Baseline Queries (Cypher reference set)
// =====================================================================
//
// Convention:
//   - Each query is a self-contained statement separated by ;.
//   - Use-case prefix codes (A1, B2, ...) are stable identifiers that the
//     test set in the Jupyter notebook will reference.

// ---------------------------------------------------------------------
// Smoke tests (run these first after import to verify graph integrity)
// ---------------------------------------------------------------------

// SMOKE-1: Counts per node label
MATCH (n) RETURN labels(n) AS labels, count(*) AS c ORDER BY c DESC;

// SMOKE-2: Counts per relationship type
MATCH ()-[r]->() RETURN type(r) AS rel, count(*) AS c ORDER BY c DESC;

// SMOKE-3: Distinct normative_status values present in the graph
MATCH ()-[a:APPLIES_TO]->() RETURN DISTINCT a.normative_status ORDER BY a.normative_status;

// ---------------------------------------------------------------------
// USE CASE A : Traceability
// "Locate a Building Block in the document and trace its standards."
// ---------------------------------------------------------------------

// A1. Full hierarchical path for a given Mikro
MATCH path = (d:Document)-[:DEFINES]->(:Macro)-[:CONTAINS]->(:Meso)
             -[:CONTAINS]->(m:Mikro {id:'bb_mi_http'})
RETURN path;

// A2. All external standards referenced by HTTP across all variants
MATCH (m:Mikro {id:'bb_mi_http'})-[:HAS_VARIANT]->(v:Variant)
      -[r:REFERENCES]->(e:External_Standard)
RETURN v.title AS variant, e.key AS standard, r.reference_type AS type
ORDER BY v.title, e.key;

// A3. Normative classification of a Mikro per interface
MATCH (m:Mikro {id:'bb_mi_http'})-[:HAS_VARIANT]->(v:Variant)
      -[a:APPLIES_TO]->(i:Interface)
RETURN v.title AS variant, i.id AS interface, a.normative_status AS status
ORDER BY v.title, i.id;

// A4. Find a Mikro by free-text title fragment
MATCH (m:Mikro)
WHERE toLower(m.title) CONTAINS toLower('SOAP')
RETURN m.id, m.title, m.semantic_summary LIMIT 10;

// ---------------------------------------------------------------------
// USE CASE B : Dependency / impact analysis (reverse lookup)
// "If external standard X changes, which Building Blocks are affected?"
// ---------------------------------------------------------------------

// B1. Which Building Blocks reference a specific RFC?
MATCH (e:External_Standard {key:'RFC 7230'})<-[:REFERENCES]-(s)
OPTIONAL MATCH (s)<-[:HAS_VARIANT|:HAS_ALTERNATIVE]-(m:Mikro)
RETURN coalesce(m.title, s.title) AS subject,
       labels(s) AS source_kind,
       e.key AS standard;

// B2. External standards referenced by more than one Mikro
//     (shared dependencies = high blast radius for changes)
MATCH (e:External_Standard)<-[:REFERENCES]-(s)
OPTIONAL MATCH (s)<-[:HAS_VARIANT|:HAS_ALTERNATIVE]-(m:Mikro)
WITH e, collect(DISTINCT coalesce(m.id, s.id)) AS users
WHERE size(users) > 1
RETURN e.key AS standard, e.organization AS org,
       size(users) AS user_count, users
ORDER BY user_count DESC LIMIT 25;

// B3. Top organizations by number of distinct standards referenced
MATCH (e:External_Standard)<-[:REFERENCES]-()
WHERE e.organization IS NOT NULL
RETURN e.organization AS organization, count(DISTINCT e) AS distinct_standards
ORDER BY distinct_standards DESC;

// B4. All Mikros that reference any IETF standard
MATCH (e:External_Standard {organization:'IETF'})<-[:REFERENCES]-(s)
MATCH (s)<-[:HAS_VARIANT|:HAS_ALTERNATIVE*0..1]-(m:Mikro)
RETURN DISTINCT m.id, m.title
ORDER BY m.title;

// ---------------------------------------------------------------------
// USE CASE C : Normative status / scope queries
// "What is recommended/forbidden for which interface?"
// ---------------------------------------------------------------------

// C1. Everything 'dringend empfohlen' for interface S1
MATCH (s)-[:APPLIES_TO {normative_status:'dringend empfohlen'}]->(:Interface {id:'S1'})
OPTIONAL MATCH (s)<-[:HAS_VARIANT|:HAS_ALTERNATIVE]-(m:Mikro)
RETURN coalesce(m.title, '(direkt am Mikro)') AS via_mikro,
       labels(s) AS source_kind, s.title AS source_title
ORDER BY source_title;

// C2. Everything 'nicht empfohlen' (any interface)
MATCH (s)-[:APPLIES_TO {normative_status:'nicht empfohlen'}]->(i:Interface)
OPTIONAL MATCH (s)<-[:HAS_VARIANT|:HAS_ALTERNATIVE]-(m:Mikro)
RETURN coalesce(m.title, s.title) AS subject,
       collect(DISTINCT i.id) AS interfaces;

// C3. Mikros with at least one 'dringend empfohlen' variant for S2
MATCH (m:Mikro)-[:HAS_VARIANT]->(v:Variant)
      -[:APPLIES_TO {normative_status:'dringend empfohlen'}]->(:Interface {id:'S2'})
RETURN DISTINCT m.id, m.title
ORDER BY m.title;

// C4. Distribution of normative_status per Macro area
MATCH (ma:Macro)-[:CONTAINS]->(:Meso)-[:CONTAINS]->(mi:Mikro)
OPTIONAL MATCH (mi)<-[:HAS_VARIANT|:HAS_ALTERNATIVE*0..1]-(s)
              -[a:APPLIES_TO]->()
RETURN ma.title AS macro_area,
       a.normative_status AS status,
       count(DISTINCT mi) AS mikro_count
ORDER BY macro_area, status;

// ---------------------------------------------------------------------
// USE CASE D : Coverage / data hygiene (engineering queries)
// ---------------------------------------------------------------------

// D1. Mikros without any assessment anywhere - data gaps
MATCH (m:Mikro)
WHERE NOT EXISTS { (m)-[:APPLIES_TO]->() }
  AND NOT EXISTS { (m)-[:HAS_VARIANT|:HAS_ALTERNATIVE]->()-[:APPLIES_TO]->() }
RETURN m.id, m.title;

// D2. Mikros that have variants AND alternatives (modeling double-check;
//     usually one or the other is used)
MATCH (m:Mikro)
WHERE EXISTS { (m)-[:HAS_VARIANT]->() }
  AND EXISTS { (m)-[:HAS_ALTERNATIVE]->() }
RETURN m.id, m.title;

// D3. External_Standard nodes referenced by exactly one source
//     (potential parsing artefacts to review before final thesis submission)
MATCH (e:External_Standard)<-[:REFERENCES]-()
WITH e, count(*) AS users
WHERE users = 1
RETURN e.key, e.organization
ORDER BY e.organization, e.key
LIMIT 50;

// D4. Mikros without any reference to an external standard
MATCH (m:Mikro)
WHERE NOT EXISTS { (m)-[:REFERENCES]->() }
  AND NOT EXISTS { (m)-[:HAS_VARIANT|:HAS_ALTERNATIVE]->()-[:REFERENCES]->() }
RETURN m.id, m.title;
