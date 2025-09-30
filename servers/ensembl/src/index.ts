#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { RestClient, RestToolFactory } from "@mcp/rest-utils";
import { ensemblTools } from "./tools.js";

const ENSEMBL_BASE_URL = "https://rest.ensembl.org";

// Create REST client
const client = new RestClient({
  baseUrl: ENSEMBL_BASE_URL,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  retries: 3,
});

// Create tool factory
const toolFactory = new RestToolFactory(client);

// Convert tool configs to MCP tools
const tools = ensemblTools.map((config) => toolFactory.createTool(config));

// Server implementation
const server = new Server(
  {
    name: "ensembl-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Find the tool configuration
  const toolConfig = ensemblTools.find((tool) => tool.name === name);

  if (!toolConfig) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Unknown tool: ${name}`,
        },
      ],
      isError: true,
    };
  }

  // Execute the tool using the factory
  return toolFactory.executeTool(toolConfig, args || {});
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Ensembl MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
