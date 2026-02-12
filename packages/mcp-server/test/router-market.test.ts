import { describe, expect, it } from "vitest";
import { handleMarketTool } from "../src/router/market";
import type { MarketProvider } from "../src/router/market";

const provider: MarketProvider = {
  getTicker: async () => ({ data: [{ instId: "BTC-USDT-SWAP", last: "1", bidPx: "1", askPx: "1", high24h: "1", low24h: "1", vol24h: "1", ts: "1700000000000" }] }),
  getCandles: async () => ({ data: [["1700000000000", "1", "2", "0.5", "1.5", "10", "", "", "1"]] }),
  getOrderBook: async () => ({ data: [{ bids: [["1", "2"]], asks: [["1", "1"]], ts: "1700000000000" }] }),
  getFundingRate: async () => ({ data: [{ instId: "BTC-USDT-SWAP", fundingRate: "0.1", nextFundingRate: "0.2", fundingTime: "1700000000000", ts: "1700000001000" }] }),
  getOpenInterest: async () => ({ data: [{ instId: "BTC-USDT-SWAP", oi: "1", oiCcy: "2", oiUsd: "3", ts: "1700000000000" }] })
};

describe("market router", () => {
  it("returns normalized response", async () => {
    const response = await handleMarketTool(
      "get_ticker",
      { exchange: "okx", instId: "BTC-USDT-SWAP" },
      provider
    );
    expect(response.isError).toBe(false);
    expect(response.structuredContent?.normalized).toBeDefined();
  });

  it("returns error when instId missing", async () => {
    const response = await handleMarketTool("get_candles", { exchange: "okx" }, provider);
    expect(response.isError).toBe(true);
    expect(response.error?.code).toBe("INVALID_INPUT");
  });

  it("returns error when depth invalid", async () => {
    const response = await handleMarketTool(
      "get_order_book",
      { exchange: "okx", instId: "BTC-USDT-SWAP", depth: 0 },
      provider
    );
    expect(response.isError).toBe(true);
  });
});
