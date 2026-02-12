import { describe, expect, it, vi } from "vitest";
import type { HttpClient, HttpRequest, HttpResponse } from "../../src/http/types";
import { createThrottledClient } from "../../src/http/throttle";

describe("throttle client", () => {
  it("spaces requests by minTimeMs", async () => {
    vi.useFakeTimers();
    const timestamps: number[] = [];
    const client: HttpClient = {
      async request<T = unknown>(_req: HttpRequest): Promise<HttpResponse<T>> {
        timestamps.push(Date.now());
        return { status: 200, headers: {}, data: {} as T, rawBody: "" };
      }
    };

    const throttled = createThrottledClient(client, { minTimeMs: 100 });
    const p1 = throttled.request({ method: "GET", url: "https://example.com" });
    const p2 = throttled.request({ method: "GET", url: "https://example.com" });

    await vi.runAllTimersAsync();
    await Promise.all([p1, p2]);

    expect(timestamps.length).toBe(2);
    expect(timestamps[1] - timestamps[0]).toBeGreaterThanOrEqual(100);

    vi.useRealTimers();
  });
});
