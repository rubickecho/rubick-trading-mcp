import { describe, expect, it } from "vitest";
import { handleAccountTool } from "../src/router/account";
import type { AccountProviders } from "../src/router/account";

const okxRawBalance = {
  data: [
    {
      uTime: "1700000000000",
      details: [{ ccy: "USDT", availEq: "100", frozenBal: "0", eq: "100" }]
    }
  ]
};

const providers: AccountProviders = {
  okx: {
    getBalance: async () => okxRawBalance,
    getPositions: async () => ({ data: [] }),
    getPendingOrders: async () => ({ data: [] }),
    getHistoryOrders: async () => ({ data: [] })
  },
  binance: {
    getBalance: async () => [{ asset: "USDT", availableBalance: "1", balance: "1" }],
    getPositions: async () => [],
    getPendingOrders: async () => [],
    getHistoryOrders: async () => []
  },
  hyperliquid: {
    getBalance: async () => ({ clearinghouseState: { marginSummary: { accountValue: "1", totalMarginUsed: "0" } } }),
    getPositions: async () => ({ clearinghouseState: { assetPositions: [] } }),
    getPendingOrders: async () => [],
    getHistoryOrders: async () => []
  }
};

describe("account router", () => {
  it("returns normalized response", async () => {
    const response = await handleAccountTool("get_balance", { exchange: "okx" }, providers);
    expect(response.isError).toBe(false);
    expect(response.structuredContent?.normalized).toBeDefined();
  });

  it("returns error for binance history without symbol", async () => {
    const response = await handleAccountTool("get_history_orders", { exchange: "binance" }, providers);
    expect(response.isError).toBe(true);
  });

  it("returns error for hyperliquid missing user", async () => {
    const response = await handleAccountTool("get_balance", { exchange: "hyperliquid" }, providers);
    expect(response.isError).toBe(true);
  });

  it("returns error for invalid marginCcy", async () => {
    const response = await handleAccountTool(
      "get_balance",
      { exchange: "okx", marginCcy: "BTC" as never },
      providers
    );
    expect(response.isError).toBe(true);
  });
});
