import { describe, expect, it } from "vitest";
import type { HttpClient, HttpRequest, HttpResponse } from "@rubick-trading-mcp/core-utils";
import { getPendingOrders } from "../src/provider";

function createMockClient(onRequest: (req: HttpRequest) => void): HttpClient {
  return {
    async request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>> {
      onRequest(req);
      return {
        status: 200,
        headers: {},
        data: {} as T,
        rawBody: "{}"
      };
    }
  };
}

describe("hyperliquid provider", () => {
  it("requires user", async () => {
    const client = createMockClient(() => undefined);
    await expect(getPendingOrders({ client }, {})).rejects.toThrow("extra.user");
  });

  it("builds openOrders request", async () => {
    let captured: HttpRequest | undefined;
    const client = createMockClient((req) => {
      captured = req;
    });

    await getPendingOrders({ client, baseUrl: "https://api.hyperliquid.xyz" }, { extra: { user: "0xabc" } });

    expect(captured?.method).toBe("POST");
    expect(captured?.url).toBe("https://api.hyperliquid.xyz/info");
    expect((captured?.body as Record<string, unknown>)?.type).toBe("openOrders");
  });
});
