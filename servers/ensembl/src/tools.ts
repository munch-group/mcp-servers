import { RestToolConfig } from "@mcp/rest-utils";

export const ensemblTools: RestToolConfig[] = [
  {
    name: "lookup_gene_by_symbol",
    description: "Look up a gene by its symbol (e.g., BRCA2) and get detailed information including ID, location, and description",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Gene symbol (e.g., BRCA2, TP53)",
        },
        species: {
          type: "string",
          description: "Species name (default: human)",
          default: "human",
        },
        expand: {
          type: "boolean",
          description: "Expand transcripts information",
          default: false,
        },
      },
      required: ["symbol"],
    },
    endpoint: (args: any) => `/lookup/symbol/${args.species || "human"}/${args.symbol}`,
    transformRequest: (args: any) => ({
      method: "GET",
      queryParams: args.expand ? { expand: 1 } : undefined,
    }),
  },
  {
    name: "lookup_gene_by_id",
    description: "Look up a gene by its Ensembl stable ID (e.g., ENSG00000139618)",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Ensembl gene stable ID (e.g., ENSG00000139618)",
        },
        expand: {
          type: "boolean",
          description: "Expand transcripts information",
          default: false,
        },
      },
      required: ["id"],
    },
    endpoint: (args: any) => `/lookup/id/${args.id}`,
    transformRequest: (args: any) => ({
      method: "GET",
      queryParams: args.expand ? { expand: 1 } : undefined,
    }),
  },
  {
    name: "get_sequence",
    description: "Get the DNA/RNA/protein sequence for a given region or feature",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Ensembl stable ID (gene, transcript, or translation)",
        },
        type: {
          type: "string",
          enum: ["genomic", "cds", "cdna", "protein"],
          description: "Type of sequence to retrieve",
          default: "genomic",
        },
      },
      required: ["id"],
    },
    endpoint: (args: any) => `/sequence/id/${args.id}`,
    transformRequest: (args: any) => ({
      method: "GET",
      queryParams: { type: args.type || "genomic" },
    }),
  },
  {
    name: "get_variants_for_region",
    description: "Get genetic variants for a genomic region",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        species: {
          type: "string",
          description: "Species name",
          default: "human",
        },
        region: {
          type: "string",
          description: "Genomic region (e.g., 7:140424943-140624564)",
        },
      },
      required: ["region"],
    },
    endpoint: (args: any) => `/overlap/region/${args.species || "human"}/${args.region}`,
    transformRequest: () => ({
      method: "GET",
      queryParams: { feature: "variation" },
    }),
  },
  {
    name: "get_homology",
    description: "Get homologous genes/proteins across species",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Ensembl gene stable ID",
        },
        species: {
          type: "string",
          description: "Species name for the gene",
          default: "human",
        },
        target_species: {
          type: "string",
          description: "Target species for homology search (optional)",
        },
        type: {
          type: "string",
          enum: ["orthologues", "paralogues", "all"],
          description: "Type of homology",
          default: "orthologues",
        },
      },
      required: ["id"],
    },
    endpoint: (args: any) => `/homology/id/${args.species || "human"}/${args.id}`,
    transformRequest: (args: any) => {
      const queryParams: Record<string, string> = {};
      if (args.type && args.type !== "all") {
        queryParams.type = args.type;
      }
      if (args.target_species) {
        queryParams.target_species = args.target_species;
      }
      return { method: "GET", queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined };
    },
  },
  {
    name: "get_phenotype_by_gene",
    description: "Get phenotype annotations associated with a gene",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        gene_id: {
          type: "string",
          description: "Ensembl gene stable ID",
        },
        species: {
          type: "string",
          description: "Species name",
          default: "human",
        },
      },
      required: ["gene_id"],
    },
    endpoint: (args: any) => `/phenotype/gene/${args.species || "human"}/${args.gene_id}`,
  },
  {
    name: "get_regulatory_features",
    description: "Get regulatory features in a genomic region",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        species: {
          type: "string",
          description: "Species name",
          default: "human",
        },
        region: {
          type: "string",
          description: "Genomic region (e.g., X:1000000-1010000)",
        },
      },
      required: ["region"],
    },
    endpoint: (args: any) => `/overlap/region/${args.species || "human"}/${args.region}`,
    transformRequest: () => ({
      method: "GET",
      queryParams: { feature: "regulatory" },
    }),
  },
  {
    name: "overlap_region",
    description: "Get features that overlap a given genomic region",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        species: {
          type: "string",
          description: "Species name",
          default: "human",
        },
        region: {
          type: "string",
          description: "Genomic region (e.g., 7:140424943-140624564)",
        },
        feature: {
          type: "string",
          enum: [
            "gene",
            "transcript",
            "cds",
            "exon",
            "repeat",
            "simple_feature",
            "misc_feature",
            "variation",
            "structural_variation",
            "somatic_variation",
            "somatic_structural_variation",
            "constrained",
            "regulatory",
            "motif",
            "chipseq",
            "array_probe"
          ],
          description: "Type of feature to retrieve",
          default: "gene",
        },
      },
      required: ["region"],
    },
    endpoint: (args: any) => `/overlap/region/${args.species || "human"}/${args.region}`,
    transformRequest: (args: any) => ({
      method: "GET",
      queryParams: { feature: args.feature || "gene" },
    }),
  },
  {
    name: "get_xrefs_by_gene",
    description: "Get external references (cross-references) for a gene",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        gene_id: {
          type: "string",
          description: "Ensembl gene stable ID",
        },
        external_db: {
          type: "string",
          description: "Filter by external database name (e.g., HGNC, UniProt)",
        },
      },
      required: ["gene_id"],
    },
    endpoint: (args: any) => `/xrefs/id/${args.gene_id}`,
    transformRequest: (args: any) => ({
      method: "GET",
      queryParams: args.external_db ? { external_db: args.external_db } : undefined,
    }),
  },
  {
    name: "get_xrefs_by_symbol",
    description: "Get cross-references for a gene symbol",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        species: {
          type: "string",
          description: "Species name",
          default: "human",
        },
        symbol: {
          type: "string",
          description: "Gene symbol",
        },
        external_db: {
          type: "string",
          description: "Filter by external database",
        },
      },
      required: ["symbol"],
    },
    endpoint: (args: any) => `/xrefs/symbol/${args.species || "human"}/${args.symbol}`,
    transformRequest: (args: any) => ({
      method: "GET",
      queryParams: args.external_db ? { external_db: args.external_db } : undefined,
    }),
  },
  {
    name: "get_xrefs_by_name",
    description: "Search cross-references by name",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        species: {
          type: "string",
          description: "Species name",
          default: "human",
        },
        name: {
          type: "string",
          description: "Name to search for",
        },
      },
      required: ["species", "name"],
    },
    endpoint: (args: any) => `/xrefs/name/${args.species}/${args.name}`,
  },
  {
    name: "map_assembly",
    description: "Map coordinates between different genome assemblies",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        species: {
          type: "string",
          description: "Species name",
          default: "human",
        },
        asm_one: {
          type: "string",
          description: "Source assembly (e.g., GRCh37)",
        },
        region: {
          type: "string",
          description: "Region to map (e.g., X:1000000..1000100:1)",
        },
        asm_two: {
          type: "string",
          description: "Target assembly (e.g., GRCh38)",
        },
      },
      required: ["species", "asm_one", "region", "asm_two"],
    },
    endpoint: (args: any) => `/map/${args.species}/${args.asm_one}/${args.region}/${args.asm_two}`,
  },
  {
    name: "map_cdna_to_region",
    description: "Map cDNA coordinates to genomic coordinates",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Transcript stable ID",
        },
        region: {
          type: "string",
          description: "cDNA coordinates (e.g., 100..300)",
        },
      },
      required: ["id", "region"],
    },
    endpoint: (args: any) => `/map/cdna/${args.id}/${args.region}`,
  },
  {
    name: "map_cds_to_region",
    description: "Map CDS coordinates to genomic coordinates",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Transcript stable ID",
        },
        region: {
          type: "string",
          description: "CDS coordinates (e.g., 1..300)",
        },
      },
      required: ["id", "region"],
    },
    endpoint: (args: any) => `/map/cds/${args.id}/${args.region}`,
  },
  {
    name: "map_translation_to_region",
    description: "Map protein coordinates to genomic coordinates",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Translation stable ID",
        },
        region: {
          type: "string",
          description: "Protein coordinates (e.g., 1..100)",
        },
      },
      required: ["id", "region"],
    },
    endpoint: (args: any) => `/map/translation/${args.id}/${args.region}`,
  },
  {
    name: "get_ontology_by_id",
    description: "Get ontology term information by ID",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Ontology term ID (e.g., GO:0005667)",
        },
      },
      required: ["id"],
    },
    endpoint: (args: any) => `/ontology/id/${args.id}`,
  },
  {
    name: "get_ontology_ancestors",
    description: "Get ancestor terms for an ontology term",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Ontology term ID",
        },
      },
      required: ["id"],
    },
    endpoint: (args: any) => `/ontology/ancestors/${args.id}`,
  },
  {
    name: "get_ontology_descendants",
    description: "Get descendant terms for an ontology term",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Ontology term ID",
        },
        closest_terms: {
          type: "boolean",
          description: "Only return closest terms",
          default: false,
        },
      },
      required: ["id"],
    },
    endpoint: (args: any) => `/ontology/descendants/${args.id}`,
    transformRequest: (args: any) => ({
      method: "GET",
      queryParams: args.closest_terms ? { closest_term: 1 } : undefined,
    }),
  },
  {
    name: "search_ontology_by_name",
    description: "Search for ontology terms by name",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Term name to search",
        },
        ontology: {
          type: "string",
          description: "Ontology to search (e.g., GO, SO)",
        },
      },
      required: ["name"],
    },
    endpoint: (args: any) => `/ontology/name/${args.name}`,
    transformRequest: (args: any) => ({
      method: "GET",
      queryParams: args.ontology ? { ontology: args.ontology } : undefined,
    }),
  },
  {
    name: "get_taxonomy_by_id",
    description: "Get taxonomy information by ID",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Taxonomy ID (e.g., 9606 for human)",
        },
      },
      required: ["id"],
    },
    endpoint: (args: any) => `/taxonomy/id/${args.id}`,
  },
  {
    name: "get_taxonomy_classification",
    description: "Get taxonomic classification for a species",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Taxonomy ID",
        },
      },
      required: ["id"],
    },
    endpoint: (args: any) => `/taxonomy/classification/${args.id}`,
  },
  {
    name: "search_taxonomy_by_name",
    description: "Search taxonomy by name",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Taxonomy name to search",
        },
      },
      required: ["name"],
    },
    endpoint: (args: any) => `/taxonomy/name/${args.name}`,
  },
  {
    name: "overlap_id",
    description: "Get features that overlap a specific feature by ID",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Ensembl stable ID",
        },
        feature: {
          type: "string",
          enum: ["gene", "transcript", "cds", "exon", "repeat", "simple_feature", "misc_feature", "variation", "structural_variation", "somatic_variation", "somatic_structural_variation", "constrained", "regulatory", "motif", "chipseq", "array_probe"],
          description: "Type of feature to retrieve",
          default: "gene",
        },
      },
      required: ["id"],
    },
    endpoint: (args: any) => `/overlap/id/${args.id}`,
    transformRequest: (args: any) => ({
      method: "GET",
      queryParams: { feature: args.feature || "gene" },
    }),
  },
  {
    name: "overlap_translation",
    description: "Get features overlapping a translation (protein)",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Translation stable ID",
        },
        feature: {
          type: "string",
          enum: ["protein_feature", "transcript_variation", "somatic_transcript_variation"],
          description: "Type of feature to retrieve",
          default: "protein_feature",
        },
      },
      required: ["id"],
    },
    endpoint: (args: any) => `/overlap/translation/${args.id}`,
    transformRequest: (args: any) => ({
      method: "GET",
      queryParams: { type: args.feature || "protein_feature" },
    }),
  },
  {
    name: "vep_region",
    description: "Predict variant consequences for a genomic region using the Variant Effect Predictor (VEP). Returns detailed consequence predictions including transcript effects, protein changes, and regulatory impacts.",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {
        species: {
          type: "string",
          description: "Species name (e.g., human, mouse)",
          default: "human",
        },
        region: {
          type: "string",
          description: "Genomic region in format chr:start-end:strand (e.g., 9:22125503-22125502:1)",
        },
        allele: {
          type: "string",
          description: "Variant allele (e.g., C, T, DUP, DEL)",
        },
        // Transcript selection
        canonical: {
          type: "boolean",
          description: "Use only canonical transcripts",
        },
        ccds: {
          type: "boolean",
          description: "Use CCDS transcripts",
        },
        gencode_basic: {
          type: "boolean",
          description: "Use GENCODE basic transcripts",
        },
        mane: {
          type: "boolean",
          description: "Use MANE (Matched Annotation from NCBI and EBI) transcripts",
        },
        refseq: {
          type: "boolean",
          description: "Use RefSeq transcripts",
        },
        merged: {
          type: "boolean",
          description: "Use merged Ensembl/RefSeq transcripts",
        },
        pick: {
          type: "boolean",
          description: "Pick one consequence per variant",
        },
        pick_allele: {
          type: "boolean",
          description: "Pick one consequence per variant allele",
        },
        pick_allele_gene: {
          type: "boolean",
          description: "Pick one consequence per variant allele and gene",
        },
        per_gene: {
          type: "boolean",
          description: "Use per-gene output",
        },
        // Annotation details
        hgvs: {
          type: "boolean",
          description: "Include HGVS nomenclature",
        },
        protein: {
          type: "boolean",
          description: "Include protein sequence",
        },
        domains: {
          type: "boolean",
          description: "Include protein domains",
        },
        uniprot: {
          type: "boolean",
          description: "Include UniProt identifiers",
        },
        tsl: {
          type: "boolean",
          description: "Include transcript support level",
        },
        appris: {
          type: "boolean",
          description: "Include APPRIS annotation",
        },
        numbers: {
          type: "boolean",
          description: "Include affected exon/intron numbers",
        },
        variant_class: {
          type: "boolean",
          description: "Include Sequence Ontology variant class",
        },
        // Prediction plugins
        AlphaMissense: {
          type: "boolean",
          description: "Include AlphaMissense pathogenicity predictions",
        },
        CADD: {
          type: "boolean",
          description: "Include CADD pathogenicity scores",
        },
        REVEL: {
          type: "boolean",
          description: "Include REVEL pathogenicity scores",
        },
        Conservation: {
          type: "boolean",
          description: "Include conservation scores",
        },
        LoF: {
          type: "boolean",
          description: "Include Loss of Function predictions",
        },
        SpliceAI: {
          type: "boolean",
          description: "Include SpliceAI splice-altering predictions",
        },
        // Other options
        distance: {
          type: "number",
          description: "Distance to transcript (bp) for upstream/downstream variants",
        },
        minimal: {
          type: "boolean",
          description: "Return minimal output",
        },
        shift_3prime: {
          type: "boolean",
          description: "Shift variants to 3' end if possible",
        },
        transcript_version: {
          type: "boolean",
          description: "Include transcript version numbers",
        },
      },
      required: ["region", "allele"],
    },
    endpoint: (args: any) => `/vep/${args.species || "human"}/region/${args.region}/${args.allele}`,
    transformRequest: (args: any) => {
      const queryParams: Record<string, number | string> = {};

      // Boolean parameters - only add if true
      const boolParams = [
        'canonical', 'ccds', 'gencode_basic', 'mane', 'refseq', 'merged',
        'pick', 'pick_allele', 'pick_allele_gene', 'per_gene',
        'hgvs', 'protein', 'domains', 'uniprot', 'tsl', 'appris', 'numbers', 'variant_class',
        'AlphaMissense', 'CADD', 'REVEL', 'Conservation', 'LoF', 'SpliceAI',
        'minimal', 'shift_3prime', 'transcript_version'
      ];

      boolParams.forEach(param => {
        if (args[param]) queryParams[param] = 1;
      });

      // Number parameters
      if (args.distance !== undefined) queryParams.distance = args.distance;

      return {
        method: "GET",
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      };
    },
  },
];
