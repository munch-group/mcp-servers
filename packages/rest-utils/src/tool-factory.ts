import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { RestClient } from "./client.js";
import { RestToolConfig, ApiError } from "./types.js";

export class RestToolFactory {
  constructor(private client: RestClient) {}

  createTool(config: RestToolConfig): Tool {
    return {
      name: config.name,
      description: config.description,
      inputSchema: config.inputSchema,
    };
  }

  async executeTool(config: RestToolConfig, args: any): Promise<any> {
    try {
      // Build the endpoint
      const endpoint = typeof config.endpoint === "function"
        ? config.endpoint(args)
        : config.endpoint;

      // Transform request if needed
      const requestOptions = config.transformRequest
        ? config.transformRequest(args)
        : { method: config.method || "GET" };

      // Make the API call
      const response = await this.client.request(endpoint, requestOptions);

      // Transform response if needed
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
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? `${error.message}${error.response ? `\n${JSON.stringify(error.response, null, 2)}` : ""}`
        : error instanceof Error
        ? error.message
        : String(error);

      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
}

/**
 * Helper function to create simple REST tools with common patterns
 */
export function createSimpleRestTool(config: {
  name: string;
  description: string;
  baseEndpoint: string;
  pathParams?: string[];
  queryParams?: string[];
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  inputSchema: Tool["inputSchema"];
}): RestToolConfig {
  return {
    name: config.name,
    description: config.description,
    method: config.method || "GET",
    inputSchema: config.inputSchema,
    endpoint: (args: any) => {
      let endpoint = config.baseEndpoint;

      // Replace path parameters
      if (config.pathParams) {
        config.pathParams.forEach((param) => {
          endpoint = endpoint.replace(`{${param}}`, args[param]);
        });
      }

      return endpoint;
    },
    transformRequest: (args: any) => {
      const queryParams: Record<string, string | number | boolean> = {};

      // Add query parameters
      if (config.queryParams) {
        config.queryParams.forEach((param) => {
          if (args[param] !== undefined) {
            queryParams[param] = args[param];
          }
        });
      }

      return {
        method: config.method || "GET",
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      };
    },
  };
}
