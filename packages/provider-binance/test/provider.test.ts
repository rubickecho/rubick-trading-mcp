import { describe, expect, it } from "vitest";
import type { HttpClient, HttpRequest, HttpResponse } from "@rubick-trading-mcp/core-utils";
import { getHistoryOrders, getPositions } from "../src/provider";

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

describe("binance provider", () => {
  it("throws when history orders missing symbol", async () => {
    const client = createMockClient(() => undefined);
    await expect(
      getHistoryOrders({ client, credentials: { apiKey: "key", apiSecret: "secret" } }, {})
    ).rejects.toThrow("requires symbol");
  });

  it("builds signed positions request", async () => {
    let captured: HttpRequest | undefined;
    const client = createMockClient((req) => {
      captured = req;
    });

    await getPositions(
      { client, credentials: { apiKey: "key", apiSecret: "secret" }, baseUrl: "https://fapi.binance.com" },
      { symbol: "BTC/USDT" }
    );

    expect(captured?.method).toBe("GET");
    expect(captured?.url).toContain("/fapi/v2/positionRisk");
    expect(captured?.url).toContain("symbol=BTCUSDT");
    expect(captured?.url).toContain("signature=");
    expect(captured?.headers?.["X-MBX-APIKEY"]).toBe("key");
  });
});
