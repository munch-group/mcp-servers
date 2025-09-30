import { ApiError, RestClientConfig, ApiRequestOptions, ApiResponse } from "./types.js";

export class RestClient {
  private config: Required<RestClientConfig>;

  constructor(config: RestClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      defaultHeaders: config.defaultHeaders || {},
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildUrl(endpoint: string, queryParams?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.config.baseUrl);

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      queryParams,
    } = options;

    const url = this.buildUrl(endpoint, queryParams);
    const mergedHeaders = {
      "Content-Type": "application/json",
      ...this.config.defaultHeaders,
      ...headers,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          method,
          headers: mergedHeaders,
          body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = errorText;
          }

          throw new ApiError(
            `API error: ${response.status} ${response.statusText}`,
            response.status,
            response.statusText,
            errorData
          );
        }

        const contentType = response.headers.get("content-type");
        let data: T;

        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = (await response.text()) as T;
        }

        return {
          data,
          status: response.status,
          headers: response.headers,
        };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx) or abort errors
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          throw error;
        }

        if (error instanceof Error && error.name === "AbortError") {
          throw new ApiError("Request timeout", 408, "Timeout", undefined);
        }

        // Retry on network errors or 5xx errors
        if (attempt < this.config.retries) {
          await this.delay(this.config.retryDelay * (attempt + 1));
          continue;
        }
      }
    }

    throw lastError || new Error("Request failed after retries");
  }

  async get<T = any>(endpoint: string, queryParams?: Record<string, string | number | boolean>): Promise<T> {
    const response = await this.request<T>(endpoint, { method: "GET", queryParams });
    return response.data;
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    const response = await this.request<T>(endpoint, { method: "POST", body });
    return response.data;
  }

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    const response = await this.request<T>(endpoint, { method: "PUT", body });
    return response.data;
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: "DELETE" });
    return response.data;
  }

  async patch<T = any>(endpoint: string, body?: any): Promise<T> {
    const response = await this.request<T>(endpoint, { method: "PATCH", body });
    return response.data;
  }
}
