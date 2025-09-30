# STRING MCP Server - Endpoint Documentation

This document details all 9 endpoints supported by the STRING MCP server and their available options.

## Overview

STRING (Search Tool for the Retrieval of Interacting Genes/Proteins) is a database of known and predicted protein-protein interactions. The interactions include direct (physical) and indirect (functional) associations.

**Base URL:** https://string-db.org/api/json/

**Common Species Taxon IDs:**
- Human: 9606
- Mouse: 10090
- Rat: 10116
- Fruit fly (D. melanogaster): 7227
- C. elegans: 6239
- Yeast (S. cerevisiae): 4932
- E. coli: 511145
- Zebrafish: 7955

## Identifier Mapping (1)

### get_string_ids
Map protein names, synonyms, and UniProt identifiers to STRING identifiers.

**Required Parameters:**
- `identifiers` (string): Protein names or IDs, newline or space-separated (e.g., "TP53 BRCA1" or "P04637")

**Optional Parameters:**
- `species` (number): NCBI taxon ID (default: 9606 - human)
- `limit` (number): Maximum number of STRING identifiers to return per query protein (default: 1)
- `echo_query` (boolean): Include the submitted identifier in the output (default: true)

**Example:**
```json
{
  "identifiers": "TP53 BRCA1",
  "species": 9606,
  "limit": 1,
  "echo_query": true
}
```

## Network and Interaction Endpoints (2)

### get_network
Retrieve protein-protein interaction network for given proteins.

**Required Parameters:**
- `identifiers` (string): Protein names or STRING IDs, newline or space-separated

**Optional Parameters:**
- `species` (number): NCBI taxon ID (default: 9606)
- `required_score` (number): Minimum interaction confidence score 0-1000 (default: 400)
- `network_type` (string): Type of network - "functional" (all evidence) or "physical" (direct interactions only) (default: functional)
- `add_nodes` (number): Number of additional nodes to add to the network (default: 0)

**Network Confidence Scores:**
- 150: Low confidence
- 400: Medium confidence (default)
- 700: High confidence
- 900: Highest confidence

**Example:**
```json
{
  "identifiers": "TP53 MDM2",
  "species": 9606,
  "required_score": 700,
  "network_type": "physical"
}
```

### get_interaction_partners
Get all STRING interaction partners for your proteins.

**Required Parameters:**
- `identifiers` (string): Protein names or STRING IDs, newline or space-separated

**Optional Parameters:**
- `species` (number): NCBI taxon ID (default: 9606)
- `limit` (number): Maximum number of interaction partners to return per query protein (default: 10)
- `required_score` (number): Minimum interaction confidence score 0-1000 (default: 400)
- `network_type` (string): Type of network - "functional" or "physical" (default: functional)

## Enrichment Analysis Endpoints (2)

### get_enrichment
Perform functional enrichment analysis for a set of proteins.

Tests for over-representation in:
- Gene Ontology (GO) terms (Biological Process, Molecular Function, Cellular Component)
- KEGG pathways
- Reactome pathways
- WikiPathways
- SMART domains
- Pfam domains
- InterPro domains

**Required Parameters:**
- `identifiers` (string): Protein names or STRING IDs, newline or space-separated

**Optional Parameters:**
- `species` (number): NCBI taxon ID (default: 9606)
- `background` (string): Background proteins for enrichment (optional, newline or space-separated)

**Example:**
```json
{
  "identifiers": "TP53 MDM2 CDKN1A BAX BCL2",
  "species": 9606
}
```

### get_ppi_enrichment
Test if your protein set has more interactions than expected by chance.

Returns a p-value indicating whether the network has significantly more interactions than would be expected for a random set of proteins of similar size.

**Required Parameters:**
- `identifiers` (string): Protein names or STRING IDs, newline or space-separated

**Optional Parameters:**
- `species` (number): NCBI taxon ID (default: 9606)
- `required_score` (number): Minimum interaction confidence score 0-1000 (default: 400)

## Homology Endpoints (2)

### get_homology
Get homology information for proteins across species.

**Required Parameters:**
- `identifiers` (string): Protein names or STRING IDs, newline or space-separated

**Optional Parameters:**
- `species` (number): Source species NCBI taxon ID (default: 9606)
- `target_species` (number): Target species NCBI taxon ID (optional - if not specified, returns homologs across all species)

**Example:**
```json
{
  "identifiers": "TP53",
  "species": 9606,
  "target_species": 10090
}
```

### get_homology_best
Get the best homology match for proteins in a target species.

**Required Parameters:**
- `identifiers` (string): Protein names or STRING IDs, newline or space-separated
- `target_species` (number): Target species NCBI taxon ID

**Optional Parameters:**
- `species` (number): Source species NCBI taxon ID (default: 9606)

## Utility Endpoints (2)

### resolve_proteins
Resolve protein names to their preferred names in STRING database.

Useful for standardizing protein identifiers and getting the canonical name used by STRING.

**Required Parameters:**
- `identifiers` (string): Protein names or STRING IDs, newline or space-separated

**Optional Parameters:**
- `species` (number): NCBI taxon ID (default: 9606)

**Example:**
```json
{
  "identifiers": "p53 tumor protein",
  "species": 9606
}
```

### get_version
Get the current version of the STRING database.

**Required Parameters:** None

**Returns:** Version information including database version and release date.

---

## Coverage Summary

**Total Endpoints:** 9

**By Category:**
- Identifier Mapping: 1
- Network/Interactions: 2
- Enrichment Analysis: 2
- Homology: 2
- Utilities: 2

**Request Method:** All endpoints except `get_version` use POST with form-encoded bodies. `get_version` uses GET.

**Response Format:** All endpoints return JSON responses.

## Usage Notes

1. **Identifier Flexibility:** STRING accepts multiple identifier types:
   - Protein names (e.g., "TP53", "p53")
   - UniProt IDs (e.g., "P04637")
   - Ensembl IDs
   - RefSeq IDs
   - STRING IDs (e.g., "9606.ENSP00000269305")

2. **Batch Queries:** Most endpoints support multiple proteins in a single request by separating identifiers with newlines or spaces.

3. **Confidence Scores:** Interaction scores range from 0-1000:
   - 150: Low confidence
   - 400: Medium confidence (recommended default)
   - 700: High confidence
   - 900: Highest confidence

4. **Network Types:**
   - `functional`: Includes all types of associations (default, recommended for most analyses)
   - `physical`: Only direct physical interactions (experimental evidence)

5. **Species Coverage:** STRING covers 5,090+ organisms. Use NCBI taxonomy IDs for species specification.

## API Documentation

Full API documentation available at: https://string-db.org/help/api/
