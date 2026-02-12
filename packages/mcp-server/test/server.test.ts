import { describe, expect, it } from "vitest";
import type { HttpClient, HttpRequest, HttpResponse } from "@rubick-trading-mcp/core-utils";
import { createToolDispatcher } from "../src/server";

type MockRoute = {
  match: (req: HttpRequest) => boolean;
  response: HttpResponse<unknown>;
};

function createMockClient(routes: MockRoute[]): HttpClient {
  return {
    async request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>> {
      const route = routes.find((item) => item.match(req));
      if (!route) {
        return {
          status: 404,
          headers: {},
          data: {} as T,
          rawBody: "{}"
        };
      }
      return route.response as HttpResponse<T>;
    }
  };
}

describe("mcp server dispatcher", () => {
  it("dispatches okx account tool", async () => {
    const client = createMockClient([
      {
        match: (req) => req.url.includes("/api/v5/account/balance"),
        response: {
          status: 200,
          headers: {},
          data: {
            data: [
              {
                uTime: "1700000000000",
                details: [{ ccy: "USDT", availEq: "1", frozenBal: "0", eq: "1" }]
              }
            ]
          },
          rawBody: "{}"
        }
      }
    ]);

    const dispatch = createToolDispatcher({
      okx: { credentials: { apiKey: "k", apiSecret: "s", passphrase: "p" }, client },
      binance: { credentials: { apiKey: "k", apiSecret: "s" }, client },
      hyperliquid: { client }
    });

    const response = await dispatch("get_balance", { exchange: "okx" });
    expect(response.isError).toBe(false);
    expect(response.structuredContent?.normalized).toBeDefined();
  });

  it("dispatches okx market tool", async () => {
    const client = createMockClient([
      {
        match: (req) => req.url.includes("/api/v5/market/ticker"),
        response: {
          status: 200,
          headers: {},
          data: {
            data: [
              {
                instId: "BTC-USDT-SWAP",
                last: "1",
                bidPx: "1",
                askPx: "1",
                high24h: "1",
                low24h: "1",
                vol24h: "1",
                ts: "1700000000000"
              }
            ]
          },
          rawBody: "{}"
        }
      }
    ]);

    const dispatch = createToolDispatcher({
      okx: { credentials: { apiKey: "k", apiSecret: "s", passphrase: "p" }, client },
      binance: { credentials: { apiKey: "k", apiSecret: "s" }, client },
      hyperliquid: { client }
    });

    const response = await dispatch("get_ticker", { exchange: "okx", instId: "BTC-USDT-SWAP" });
    expect(response.isError).toBe(false);
    expect(response.structuredContent?.normalized).toBeDefined();
  });

  it("returns error for unknown tool", async () => {
    const client = createMockClient([]);
    const dispatch = createToolDispatcher({
      okx: { credentials: { apiKey: "k", apiSecret: "s", passphrase: "p" }, client },
      binance: { credentials: { apiKey: "k", apiSecret: "s" }, client },
      hyperliquid: { client }
    });

    const response = await dispatch("unknown", { exchange: "okx" } as never);
    expect(response.isError).toBe(true);
  });
});
