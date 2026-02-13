import { describe, expect, it, vi } from "vitest";
import { createFetchClient } from "../../src/http/fetchClient";
import type { HttpRequest } from "../../src/http/types";

describe("fetch client", () => {
  it("passes basic request options", async () => {
    let captured: RequestInit = {};

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit & { dispatcher?: unknown }) => {
        captured = init ?? {};
        return {
          status: 200,
          headers: { entries: () => [] },
          text: async () => ""
        } as unknown as Response;
      })
    );

    const client = createFetchClient();
    const req: HttpRequest = { method: "GET", url: "https://example.com" };
    await client.request(req);

    expect(captured.method).toBe("GET");

    vi.unstubAllGlobals();
  });
});
