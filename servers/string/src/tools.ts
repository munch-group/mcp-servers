import { RestToolConfig } from "@mcp/rest-utils";

export const stringTools: RestToolConfig[] = [
  {
    name: "get_string_ids",
    description: "Map protein names, synonyms, and UniProt identifiers to STRING identifiers. Species parameter uses NCBI taxon IDs (e.g., 9606 for human, 10090 for mouse).",
    method: "POST",
    inputSchema: {
      type: "object",
      properties: {
        identifiers: {
          type: "string",
          description: "Protein names or IDs, newline or space-separated (e.g., 'TP53 BRCA1' or 'P04637')",
        },
        species: {
          type: "number",
          description: "NCBI taxon ID (e.g., 9606 for human, 10090 for mouse)",
          default: 9606,
        },
        limit: {
          type: "number",
          description: "Maximum number of STRING identifiers to return per query protein",
          default: 1,
        },
        echo_query: {
          type: "boolean",
          description: "Include the submitted identifier in the output",
          default: true,
        },
      },
      required: ["identifiers"],
    },
    endpoint: "/api/json/get_string_ids",
    transformRequest: (args: any) => ({
      method: "POST",
      body: {
        identifiers: args.identifiers,
        species: args.species || 9606,
        limit: args.limit || 1,
        echo_query: args.echo_query !== false ? 1 : 0,
      },
    }),
  },
  {
    name: "get_network",
    description: "Retrieve protein-protein interaction network for given proteins. Returns network edges with confidence scores.",
    method: "POST",
    inputSchema: {
      type: "object",
      properties: {
        identifiers: {
          type: "string",
          description: "Protein names or STRING IDs, newline or space-separated",
        },
        species: {
          type: "number",
          description: "NCBI taxon ID",
          default: 9606,
        },
        required_score: {
          type: "number",
          description: "Minimum interaction confidence score (0-1000)",
          default: 400,
        },
        network_type: {
          type: "string",
          enum: ["functional", "physical"],
          description: "Type of network (functional includes all evidence, physical only direct interactions)",
          default: "functional",
        },
        add_nodes: {
          type: "number",
          description: "Number of additional nodes to add to the network",
          default: 0,
        },
      },
      required: ["identifiers"],
    },
    endpoint: "/api/json/network",
    transformRequest: (args: any) => ({
      method: "POST",
      body: {
        identifiers: args.identifiers,
        species: args.species || 9606,
        required_score: args.required_score || 400,
        network_type: args.network_type || "functional",
        add_nodes: args.add_nodes || 0,
      },
    }),
  },
  {
    name: "get_interaction_partners",
    description: "Get all STRING interaction partners for your proteins. Returns a list of interacting proteins with confidence scores.",
    method: "POST",
    inputSchema: {
      type: "object",
      properties: {
        identifiers: {
          type: "string",
          description: "Protein names or STRING IDs, newline or space-separated",
        },
        species: {
          type: "number",
          description: "NCBI taxon ID",
          default: 9606,
        },
        limit: {
          type: "number",
          description: "Maximum number of interaction partners to return per query protein",
          default: 10,
        },
        required_score: {
          type: "number",
          description: "Minimum interaction confidence score (0-1000)",
          default: 400,
        },
        network_type: {
          type: "string",
          enum: ["functional", "physical"],
          description: "Type of network",
          default: "functional",
        },
      },
      required: ["identifiers"],
    },
    endpoint: "/api/json/interaction_partners",
    transformRequest: (args: any) => ({
      method: "POST",
      body: {
        identifiers: args.identifiers,
        species: args.species || 9606,
        limit: args.limit || 10,
        required_score: args.required_score || 400,
        network_type: args.network_type || "functional",
      },
    }),
  },
  {
    name: "get_enrichment",
    description: "Perform functional enrichment analysis for a set of proteins. Tests for over-representation in Gene Ontology terms, KEGG pathways, etc.",
    method: "POST",
    inputSchema: {
      type: "object",
      properties: {
        identifiers: {
          type: "string",
          description: "Protein names or STRING IDs, newline or space-separated",
        },
        species: {
          type: "number",
          description: "NCBI taxon ID",
          default: 9606,
        },
        background: {
          type: "string",
          description: "Background proteins for enrichment (optional, newline or space-separated)",
        },
      },
      required: ["identifiers"],
    },
    endpoint: "/api/json/enrichment",
    transformRequest: (args: any) => {
      const body: any = {
        identifiers: args.identifiers,
        species: args.species || 9606,
      };
      if (args.background) {
        body.background_string_identifiers = args.background;
      }
      return { method: "POST", body };
    },
  },
  {
    name: "get_ppi_enrichment",
    description: "Test if your protein set has more interactions than expected by chance. Returns enrichment p-value.",
    method: "POST",
    inputSchema: {
      type: "object",
      properties: {
        identifiers: {
          type: "string",
          description: "Protein names or STRING IDs, newline or space-separated",
        },
        species: {
          type: "number",
          description: "NCBI taxon ID",
          default: 9606,
        },
        required_score: {
          type: "number",
          description: "Minimum interaction confidence score (0-1000)",
          default: 400,
        },
      },
      required: ["identifiers"],
    },
    endpoint: "/api/json/ppi_enrichment",
    transformRequest: (args: any) => ({
      method: "POST",
      body: {
        identifiers: args.identifiers,
        species: args.species || 9606,
        required_score: args.required_score || 400,
      },
    }),
  },
  {
    name: "get_homology",
    description: "Get homology information for proteins across species using STRING.",
    method: "POST",
    inputSchema: {
      type: "object",
      properties: {
        identifiers: {
          type: "string",
          description: "Protein names or STRING IDs, newline or space-separated",
        },
        species: {
          type: "number",
          description: "Source species NCBI taxon ID",
          default: 9606,
        },
        target_species: {
          type: "number",
          description: "Target species NCBI taxon ID (optional)",
        },
      },
      required: ["identifiers"],
    },
    endpoint: "/api/json/homology",
    transformRequest: (args: any) => {
      const body: any = {
        identifiers: args.identifiers,
        species: args.species || 9606,
      };
      if (args.target_species) {
        body.target_species = args.target_species;
      }
      return { method: "POST", body };
    },
  },
  {
    name: "get_homology_best",
    description: "Get the best homology match for proteins in a target species.",
    method: "POST",
    inputSchema: {
      type: "object",
      properties: {
        identifiers: {
          type: "string",
          description: "Protein names or STRING IDs, newline or space-separated",
        },
        species: {
          type: "number",
          description: "Source species NCBI taxon ID",
          default: 9606,
        },
        target_species: {
          type: "number",
          description: "Target species NCBI taxon ID",
        },
      },
      required: ["identifiers", "target_species"],
    },
    endpoint: "/api/json/homology_best",
    transformRequest: (args: any) => ({
      method: "POST",
      body: {
        identifiers: args.identifiers,
        species: args.species || 9606,
        target_species: args.target_species,
      },
    }),
  },
  {
    name: "resolve_proteins",
    description: "Resolve protein names to their preferred names in STRING database.",
    method: "POST",
    inputSchema: {
      type: "object",
      properties: {
        identifiers: {
          type: "string",
          description: "Protein names or STRING IDs, newline or space-separated",
        },
        species: {
          type: "number",
          description: "NCBI taxon ID",
          default: 9606,
        },
      },
      required: ["identifiers"],
    },
    endpoint: "/api/json/resolve",
    transformRequest: (args: any) => ({
      method: "POST",
      body: {
        identifiers: args.identifiers,
        species: args.species || 9606,
      },
    }),
  },
  {
    name: "get_version",
    description: "Get the current version of the STRING database.",
    method: "GET",
    inputSchema: {
      type: "object",
      properties: {},
    },
    endpoint: "/api/json/version",
  },
];
