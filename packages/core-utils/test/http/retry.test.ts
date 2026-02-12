import { describe, expect, it } from "vitest";
import type { HttpClient, HttpRequest, HttpResponse } from "../../src/http/types";
import { createRetryingClient } from "../../src/http/retry";

describe("retry client", () => {
  it("retries on 500 and succeeds", async () => {
    let count = 0;
    const client: HttpClient = {
      async request<T = unknown>(_req: HttpRequest): Promise<HttpResponse<T>> {
        count += 1;
        if (count < 2) {
          return { status: 500, headers: {}, data: {} as T, rawBody: "" };
        }
        return { status: 200, headers: {}, data: { ok: true } as T, rawBody: "" };
      }
    };

    const retrying = createRetryingClient(client, { maxAttempts: 3, retryDelayMs: 1 });
    const response = await retrying.request({ method: "GET", url: "https://example.com" });
    expect(response.status).toBe(200);
    expect(count).toBe(2);
  });
});
