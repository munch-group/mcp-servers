# Ensembl MCP Server - Endpoint Documentation

This document details all 31 endpoints supported by the Ensembl MCP server and their available options.

## Lookup Endpoints (2)

### lookup_gene_by_symbol
Look up a gene by its symbol (e.g., BRCA2).

**Required Parameters:**
- `symbol` (string): Gene symbol (e.g., BRCA2, TP53)

**Optional Parameters:**
- `species` (string): Species name (default: human)
- `expand` (boolean): Expand transcripts information (default: false)

**Example:**
```json
{
  "symbol": "BRCA2",
  "species": "human",
  "expand": true
}
```

### lookup_gene_by_id
Look up a gene by its Ensembl stable ID.

**Required Parameters:**
- `id` (string): Ensembl gene stable ID (e.g., ENSG00000139618)

**Optional Parameters:**
- `expand` (boolean): Expand transcripts information (default: false)

## Sequence Endpoints (1)

### get_sequence
Get DNA/RNA/protein sequence for a given region or feature.

**Required Parameters:**
- `id` (string): Ensembl stable ID (gene, transcript, or translation)

**Optional Parameters:**
- `type` (string): Type of sequence - "genomic", "cds", "cdna", "protein" (default: genomic)

## Variant Endpoints (2)

### get_variants_for_region
Get genetic variants for a genomic region.

**Required Parameters:**
- `region` (string): Genomic region (e.g., 7:140424943-140624564)

**Optional Parameters:**
- `species` (string): Species name (default: human)

### vep_region
Predict variant consequences using Variant Effect Predictor (VEP).

**Required Parameters:**
- `region` (string): Genomic region in format chr:start-end:strand (e.g., 9:22125503-22125502:1)
- `allele` (string): Variant allele (e.g., C, T, DUP, DEL)

**Optional Parameters (28 total):**

*Transcript Selection (10):*
- `canonical` (boolean): Use only canonical transcripts
- `ccds` (boolean): Use CCDS transcripts
- `gencode_basic` (boolean): Use GENCODE basic transcripts
- `mane` (boolean): Use MANE transcripts
- `refseq` (boolean): Use RefSeq transcripts
- `merged` (boolean): Use merged Ensembl/RefSeq transcripts
- `pick` (boolean): Pick one consequence per variant
- `pick_allele` (boolean): Pick one consequence per variant allele
- `pick_allele_gene` (boolean): Pick one consequence per variant allele and gene
- `per_gene` (boolean): Use per-gene output

*Annotation Details (8):*
- `hgvs` (boolean): Include HGVS nomenclature
- `protein` (boolean): Include protein sequence
- `domains` (boolean): Include protein domains
- `uniprot` (boolean): Include UniProt identifiers
- `tsl` (boolean): Include transcript support level
- `appris` (boolean): Include APPRIS annotation
- `numbers` (boolean): Include affected exon/intron numbers
- `variant_class` (boolean): Include Sequence Ontology variant class

*Prediction Plugins (6):*
- `AlphaMissense` (boolean): Include AlphaMissense pathogenicity predictions
- `CADD` (boolean): Include CADD pathogenicity scores
- `REVEL` (boolean): Include REVEL pathogenicity scores
- `Conservation` (boolean): Include conservation scores
- `LoF` (boolean): Include Loss of Function predictions
- `SpliceAI` (boolean): Include SpliceAI splice-altering predictions

*Other Options (4):*
- `species` (string): Species name (default: human)
- `distance` (number): Distance to transcript (bp) for upstream/downstream variants
- `minimal` (boolean): Return minimal output
- `shift_3prime` (boolean): Shift variants to 3' end if possible
- `transcript_version` (boolean): Include transcript version numbers

## Homology Endpoints (1)

### get_homology
Get homologous genes/proteins across species.

**Required Parameters:**
- `id` (string): Ensembl gene stable ID

**Optional Parameters:**
- `target_species` (string): Target species for homology search
- `type` (string): Type of homology - "orthologues", "paralogues", "all" (default: all)

## Phenotype Endpoints (1)

### get_phenotype_by_gene
Get phenotype annotations associated with a gene.

**Required Parameters:**
- `gene_id` (string): Ensembl gene stable ID

**Optional Parameters:**
- `species` (string): Species name (default: human)

## Regulatory Endpoints (1)

### get_regulatory_features
Get regulatory features in a genomic region.

**Required Parameters:**
- `region` (string): Genomic region (e.g., X:1000000-1010000)

**Optional Parameters:**
- `species` (string): Species name (default: human)

## Overlap Endpoints (3)

### overlap_region
Get features that overlap a given genomic region.

**Required Parameters:**
- `region` (string): Genomic region (e.g., 7:140424943-140624564)

**Optional Parameters:**
- `species` (string): Species name (default: human)
- `feature` (string): Type of feature - gene, transcript, cds, exon, repeat, simple_feature, misc_feature, variation, structural_variation, somatic_variation, somatic_structural_variation, constrained, regulatory, motif, chipseq, array_probe (default: gene)

### overlap_id
Get features that overlap a specific feature by ID.

**Required Parameters:**
- `id` (string): Ensembl stable ID

**Optional Parameters:**
- `feature` (string): Type of feature (same options as overlap_region, default: gene)

### overlap_translation
Get features overlapping a translation (protein).

**Required Parameters:**
- `id` (string): Translation stable ID

**Optional Parameters:**
- `feature` (string): Type of feature - protein_feature, transcript_variation, somatic_transcript_variation (default: protein_feature)

## Cross-Reference Endpoints (3)

### get_xrefs_by_gene
Get external references for a gene.

**Required Parameters:**
- `gene_id` (string): Ensembl gene stable ID

**Optional Parameters:**
- `external_db` (string): Filter by external database name (e.g., HGNC, UniProt)

### get_xrefs_by_symbol
Get cross-references for a gene symbol.

**Required Parameters:**
- `symbol` (string): Gene symbol

**Optional Parameters:**
- `species` (string): Species name (default: human)
- `external_db` (string): Filter by external database

### get_xrefs_by_name
Search cross-references by name.

**Required Parameters:**
- `species` (string): Species name
- `name` (string): Name to search for

## Mapping Endpoints (4)

### map_assembly
Map coordinates between different genome assemblies.

**Required Parameters:**
- `species` (string): Species name
- `asm_one` (string): Source assembly (e.g., GRCh37)
- `region` (string): Region to map (e.g., X:1000000..1000100:1)
- `asm_two` (string): Target assembly (e.g., GRCh38)

### map_cdna_to_region
Map cDNA coordinates to genomic coordinates.

**Required Parameters:**
- `id` (string): Transcript stable ID
- `region` (string): cDNA coordinates (e.g., 100..300)

### map_cds_to_region
Map CDS coordinates to genomic coordinates.

**Required Parameters:**
- `id` (string): Transcript stable ID
- `region` (string): CDS coordinates (e.g., 1..300)

### map_translation_to_region
Map protein coordinates to genomic coordinates.

**Required Parameters:**
- `id` (string): Translation stable ID
- `region` (string): Protein coordinates (e.g., 1..100)

## Ontology Endpoints (4)

### get_ontology_by_id
Get ontology term information by ID.

**Required Parameters:**
- `id` (string): Ontology term ID (e.g., GO:0005667)

### get_ontology_ancestors
Get ancestor terms for an ontology term.

**Required Parameters:**
- `id` (string): Ontology term ID

### get_ontology_descendants
Get descendant terms for an ontology term.

**Required Parameters:**
- `id` (string): Ontology term ID

**Optional Parameters:**
- `closest_terms` (boolean): Only return closest terms (default: false)

### search_ontology_by_name
Search for ontology terms by name.

**Required Parameters:**
- `name` (string): Term name to search

**Optional Parameters:**
- `ontology` (string): Ontology to search (e.g., GO, SO)

## Taxonomy Endpoints (3)

### get_taxonomy_by_id
Get taxonomy information by ID.

**Required Parameters:**
- `id` (string): Taxonomy ID (e.g., 9606 for human)

### get_taxonomy_classification
Get taxonomic classification for a species.

**Required Parameters:**
- `id` (string): Taxonomy ID

### search_taxonomy_by_name
Search taxonomy by name.

**Required Parameters:**
- `name` (string): Taxonomy name to search

---

## Coverage Summary

**Total Endpoints:** 31
- Lookup: 2
- Sequence: 1
- Variants: 2 (including VEP with 28 optional parameters)
- Homology: 1
- Phenotype: 1
- Regulatory: 1
- Overlap: 3
- Cross-references: 3
- Mapping: 4
- Ontology: 4
- Taxonomy: 3

**Most Comprehensive Endpoint:** `vep_region` with 30 total parameters (2 required + 28 optional)

All endpoints support the JSON response format from the Ensembl REST API (https://rest.ensembl.org).
