import type { HttpClient, HttpRequest, HttpResponse } from "./types";

export type RetryOptions = {
  maxAttempts: number;
  retryDelayMs: number;
  retryOnStatuses?: number[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createRetryingClient(client: HttpClient, options: RetryOptions): HttpClient {
  const retryOn = options.retryOnStatuses ?? [429, 500, 502, 503, 504];

  return {
    async request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>> {
      let attempt = 0;
      let lastResponse: HttpResponse<T> | undefined;
      while (attempt < options.maxAttempts) {
        attempt += 1;
        const response = await client.request<T>(req);
        lastResponse = response;
        if (!retryOn.includes(response.status)) {
          return response;
        }
        if (attempt < options.maxAttempts) {
          await sleep(options.retryDelayMs);
        }
      }
      return lastResponse as HttpResponse<T>;
    }
  };
}
