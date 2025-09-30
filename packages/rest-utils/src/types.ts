import { Tool } from "@modelcontextprotocol/sdk/types.js";

export interface RestClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  queryParams?: Record<string, string | number | boolean>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

export interface RestToolConfig {
  name: string;
  description: string;
  endpoint: string | ((args: any) => string);
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  inputSchema: Tool["inputSchema"];
  transformRequest?: (args: any) => ApiRequestOptions;
  transformResponse?: (data: any) => any;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}
