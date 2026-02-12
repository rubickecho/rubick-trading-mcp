import { describe, expect, it } from "vitest";
import type { HttpClient, HttpRequest, HttpResponse } from "@rubick-trading-mcp/core-utils";
import { getCandles, getFundingRate, getOpenInterest, getOrderBook, getTicker } from "../src/provider";

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

describe("okx market provider", () => {
  const options = { client: createMockClient(() => undefined), credentials: { apiKey: "k", apiSecret: "s", passphrase: "p" }, baseUrl: "https://www.okx.com" };

  it("requests ticker", async () => {
    let captured: HttpRequest | undefined;
    const client = createMockClient((req) => {
      captured = req;
    });
    await getTicker({ ...options, client }, { instId: "BTC-USDT-SWAP" });
    expect(captured?.url).toContain("/api/v5/market/ticker");
    expect(captured?.url).toContain("instId=BTC-USDT-SWAP");
  });

  it("requests candles with bar", async () => {
    let captured: HttpRequest | undefined;
    const client = createMockClient((req) => {
      captured = req;
    });
    await getCandles({ ...options, client }, { instId: "BTC-USDT-SWAP", bar: "1m", limit: 100 });
    expect(captured?.url).toContain("/api/v5/market/candles");
    expect(captured?.url).toContain("bar=1m");
    expect(captured?.url).toContain("limit=100");
  });

  it("requests order book with depth", async () => {
    let captured: HttpRequest | undefined;
    const client = createMockClient((req) => {
      captured = req;
    });
    await getOrderBook({ ...options, client }, { instId: "BTC-USDT-SWAP", depth: 5 });
    expect(captured?.url).toContain("/api/v5/market/books");
    expect(captured?.url).toContain("sz=5");
  });

  it("requests funding rate", async () => {
    let captured: HttpRequest | undefined;
    const client = createMockClient((req) => {
      captured = req;
    });
    await getFundingRate({ ...options, client }, { instId: "BTC-USDT-SWAP" });
    expect(captured?.url).toContain("/api/v5/public/funding-rate");
  });

  it("requests open interest", async () => {
    let captured: HttpRequest | undefined;
    const client = createMockClient((req) => {
      captured = req;
    });
    await getOpenInterest({ ...options, client }, { instId: "BTC-USDT-SWAP" });
    expect(captured?.url).toContain("/api/v5/public/open-interest");
    expect(captured?.url).toContain("instType=SWAP");
  });
});
