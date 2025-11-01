# MCP Servers Monorepo

A collection of Model Context Protocol (MCP) servers built on shared REST API utilities.

## Installation

### Via pip

```bash
# Install from source
git clone https://github.com/yourusername/mcp_servers.git
cd mcp_servers
pip install -e .

# Or install directly from git
pip install git+https://github.com/yourusername/mcp_servers.git
```

### Via Conda

```bash
# Add channel (replace 'yourusername' with actual Anaconda.org username)
conda config --add channels yourusername

# Install GitHub CLI server
conda install gh-mcp

# Install Ensembl server
conda install ensembl-mcp

# Install STRING server
conda install string-mcp
```

### Via npm

```bash
# Install from source
git clone https://github.com/yourusername/mcp_servers.git
cd mcp_servers
npm install
npm run build
```

## Structure

```
mcp_servers/
├── packages/
│   └── rest-utils/          # Shared REST utilities for all MCP servers
│       ├── src/
│       │   ├── client.ts    # HTTP client with retry logic
│       │   ├── tool-factory.ts  # Factory for creating MCP tools
│       │   └── types.ts     # Shared TypeScript types
│       └── package.json
└── servers/
    ├── gh/                  # GitHub CLI wrapper MCP server (Python)
    │   ├── server.py        # Server implementation
    │   └── pyproject.toml   # Python package configuration
    ├── ensembl/             # Ensembl genomics API server
    │   ├── src/
    │   │   ├── index.ts     # Server entry point
    │   │   └── tools.ts     # Ensembl tool definitions
    │   └── package.json
    └── string/              # STRING protein-protein interaction server
        ├── src/
        │   ├── index.ts     # Server entry point
        │   └── tools.ts     # STRING tool definitions
        └── package.json
```

## Shared REST Utilities (`@mcp/rest-utils`)

The `@mcp/rest-utils` package provides common functionality for REST API-based MCP servers:

### Features

- **RestClient**: HTTP client with automatic retries, timeout handling, and error management
- **RestToolFactory**: Factory pattern for creating and executing MCP tools
- **Type-safe configuration**: TypeScript interfaces for REST tool definitions
- **Error handling**: Unified error handling across all servers

### Example Usage

```typescript
import { RestClient, RestToolFactory } from "@mcp/rest-utils";

// Create a REST client
const client = new RestClient({
  baseUrl: "https://api.example.com",
  defaultHeaders: { "Content-Type": "application/json" },
  timeout: 30000,
  retries: 3,
});

// Define tools
const tools = [{
  name: "get_data",
  description: "Get data from API",
  method: "GET",
  endpoint: (args) => `/data/${args.id}`,
  inputSchema: { /* ... */ },
}];

// Create tool factory and execute
const factory = new RestToolFactory(client);
const result = await factory.executeTool(tools[0], { id: "123" });
```

## Available Servers

### GitHub CLI MCP Server

Wraps the GitHub CLI (`gh`) tool to provide comprehensive access to GitHub functionality:

- Repository management (list, view, create)
- Pull requests (list, view, create, merge, checkout)
- Issues (list, view, create, close)
- GitHub Actions (workflows, runs)
- Releases (list, view, create)
- Search (repos, issues)
- Gists (list, create)
- Authenticated API requests
- Authentication status and notifications

**Prerequisites:**
- GitHub CLI (`gh`) installed and authenticated
- Python 3.10 or higher

#### Register with Claude Desktop

After installing with pip:

```bash
# The gh-mcp-server command will be available in your PATH
claude mcp add gh gh-mcp-server
```

Or from the source directory:

```bash
claude mcp add gh python /Users/kmt/mcp_servers/servers/gh/server.py
```

Or using conda:

```bash
conda install gh-mcp
```

### Ensembl MCP Server

Provides access to the Ensembl genomics REST API with 30+ tools for:

- Gene lookup by symbol or ID
- Sequence retrieval
- Genetic variants
- Cross-species homology
- Phenotype data
- Regulatory features
- Ontology and taxonomy data

#### Register with Claude Desktop

From the `/Users/kmt/mcp_servers` directory:

```bash
claude mcp add ensembl node /Users/kmt/mcp_servers/servers/ensembl/build/index.js
```

Or using npx:

```bash
claude mcp add ensembl npx -y ensembl-mcp
```

### STRING MCP Server

Provides access to the STRING protein-protein interaction database with 9 tools for:

- Mapping protein identifiers to STRING IDs
- Retrieving protein interaction networks
- Finding interaction partners
- Functional enrichment analysis (GO, KEGG, pathways)
- PPI enrichment testing
- Cross-species homology mapping
- Protein name resolution

**Common species taxon IDs:**
- Human: 9606
- Mouse: 10090
- Rat: 10116
- Fruit fly: 7227
- C. elegans: 6239
- Yeast: 4932

#### Register with Claude Desktop

From the `/Users/kmt/mcp_servers` directory:

```bash
claude mcp add string node /Users/kmt/mcp_servers/servers/string/build/index.js
```

Or using npx:

```bash
claude mcp add string npx -y string-mcp
```

## Development

### Install dependencies

```bash
npm install
```

### Build all packages

```bash
npm run build
```

### Build specific packages

```bash
npm run build:shared    # Build @mcp/rest-utils
npm run build:ensembl   # Build ensembl-mcp
npm run build:string    # Build string-mcp
```

## Adding New Servers

To add a new REST API-based MCP server:

1. Create a new directory in `servers/`
2. Add package.json with dependency on `@mcp/rest-utils`
3. Define your tools using the `RestToolConfig` interface
4. Create a server using `RestClient` and `RestToolFactory`

Example structure:

```typescript
import { RestClient, RestToolFactory, RestToolConfig } from "@mcp/rest-utils";

const tools: RestToolConfig[] = [
  {
    name: "my_tool",
    description: "My tool description",
    method: "GET",
    endpoint: (args) => `/endpoint/${args.param}`,
    inputSchema: { /* JSON schema */ },
  }
];

const client = new RestClient({ baseUrl: "https://api.example.com" });
const factory = new RestToolFactory(client);

// Use factory to create and execute tools
```

## License

ISC
