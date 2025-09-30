#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { RestClient, RestToolFactory } from "@mcp/rest-utils";
import { stringTools } from "./tools.js";

const STRING_BASE_URL = "https://string-db.org";

// Create REST client for STRING API
const client = new RestClient({
  baseUrl: STRING_BASE_URL,
  defaultHeaders: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  timeout: 30000,
  retries: 3,
});

// Custom tool factory with form-encoded body transformation
class StringToolFactory extends RestToolFactory {
  async executeTool(config: any, args: any): Promise<any> {
    try {
      const endpoint = typeof config.endpoint === "function"
        ? config.endpoint(args)
        : config.endpoint;

      let requestOptions = config.transformRequest
        ? config.transformRequest(args)
        : { method: config.method || "GET" };

      // Transform body to form-encoded format for POST requests
      if (requestOptions.body && requestOptions.method === "POST") {
        const formBody = new URLSearchParams();
        Object.entries(requestOptions.body).forEach(([key, value]) => {
          formBody.append(key, String(value));
        });
        requestOptions = {
          ...requestOptions,
          body: formBody.toString(),
        };
      }

      const response = await (this as any).client.request(endpoint, requestOptions);

      const data = config.transformResponse
        ? config.transformResponse(response.data)
        : response.data;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      const errorResponse = error.response ? `\n${JSON.stringify(error.response, null, 2)}` : "";

      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}${errorResponse}`,
          },
        ],
        isError: true,
      };
    }
  }
}

// Create tool factory
const toolFactory = new StringToolFactory(client);

// Convert tool configs to MCP tools
const tools = stringTools.map((config) => toolFactory.createTool(config));

// Server implementation
const server = new Server(
  {
    name: "string-mcp-server",
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
  const toolConfig = stringTools.find((tool) => tool.name === name);

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
  console.error("STRING MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
