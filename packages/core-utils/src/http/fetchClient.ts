import { buildUrl } from "./utils";
import type { HttpClient, HttpRequest, HttpResponse } from "./types";

export type FetchClientOptions = {
  baseUrl?: string;
  timeoutMs?: number;
  defaultHeaders?: Record<string, string>;
};

export function createFetchClient(options: FetchClientOptions = {}): HttpClient {
  const baseUrl = options.baseUrl;
  const defaultHeaders = options.defaultHeaders ?? {};
  const defaultTimeout = options.timeoutMs;
  return {
    async request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>> {
      const url = buildUrl(baseUrl, req.url, req.query);
      const headers: Record<string, string> = {
        ...defaultHeaders,
        ...(req.headers ?? {})
      };

      let body: string | undefined;
      if (req.body !== undefined && req.body !== null) {
        if (typeof req.body === "string") {
          body = req.body;
        } else {
          body = JSON.stringify(req.body);
          if (!headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
          }
        }
      }

      const controller = new AbortController();
      const timeoutMs = req.timeoutMs ?? defaultTimeout;
      const timeoutId = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;

      try {
      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
        body,
        signal: controller.signal
      };

      const response = await fetch(url, fetchOptions);
        const rawBody = await response.text();
        let data: T;
        try {
          data = rawBody ? JSON.parse(rawBody) : (undefined as unknown as T);
        } catch {
          data = rawBody as unknown as T;
        }
        const headerEntries = Object.fromEntries(response.headers.entries());
        return {
          status: response.status,
          headers: headerEntries,
          data,
          rawBody
        };
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    }
  };
}
