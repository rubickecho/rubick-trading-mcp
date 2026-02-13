import { describe, expect, it } from "vitest";
import {
  deriveOkxTicker,
  deriveOkxCandles,
  deriveOkxOrderBook,
  deriveOkxFundingRate,
  deriveOkxOpenInterest,
  deriveOkxBalance,
  deriveOkxPositions,
  deriveOkxOrders
} from "../src";
import type { OkxCandles, OkxFundingRate, OkxOpenInterest, OkxOrderBook, OkxTicker } from "@rubick-trading-mcp/core-schema";
import type { NormalizedBalance, NormalizedHistoryOrders, NormalizedPendingOrders, NormalizedPositions } from "@rubick-trading-mcp/core-schema";

function buildCandles(count: number): OkxCandles {
  const candles = Array.from({ length: count }, (_, idx) => {
    const base = 100 + idx;
    return {
      timestamp: new Date(Date.now() - idx * 60_000).toISOString(),
      open: base,
      high: base + 1,
      low: base - 1,
      close: base + 0.5,
      volume: 1000 + idx,
      isComplete: true
    };
  });

  return {
    exchange: "okx",
    instId: "BTC-USDT-SWAP",
    symbol: "BTC/USDT",
    timestamp: candles[0].timestamp,
    candles
  };
}

describe("core-derived okx", () => {
  it("derives ticker", () => {
    const ticker: OkxTicker = {
      exchange: "okx",
      instId: "BTC-USDT-SWAP",
      symbol: "BTC/USDT",
      timestamp: new Date().toISOString(),
      last: 100,
      bid: 99,
      ask: 101,
      high24h: 110,
      low24h: 90,
      vol24h: 1234
    };

    const derived = deriveOkxTicker(ticker);
    expect(derived.version).toBe("v1");
    expect(derived.features.mid_price).toBe(100);
    expect(derived.features.spread_abs).toBe(2);
  });

  it("derives candles", () => {
    const candles = buildCandles(60);
    const derived = deriveOkxCandles(candles);
    expect(derived.features.returns_pct.length).toBe(60);
    expect(["up", "down", "sideways", "undefined"]).toContain(derived.features.trend_state_raw);
  });

  it("derives order book", () => {
    const orderBook: OkxOrderBook = {
      exchange: "okx",
      instId: "BTC-USDT-SWAP",
      symbol: "BTC/USDT",
      timestamp: new Date().toISOString(),
      bids: [
        [100, 2],
        [99, 3]
      ],
      asks: [
        [101, 1],
        [102, 2]
      ],
      depth: 2
    };
    const derived = deriveOkxOrderBook(orderBook);
    expect(derived.features.spread_abs).toBe(1);
  });

  it("derives funding rate", () => {
    const funding: OkxFundingRate = {
      exchange: "okx",
      instId: "BTC-USDT-SWAP",
      symbol: "BTC/USDT",
      timestamp: new Date().toISOString(),
      fundingRate: 0.0001
    };
    const derived = deriveOkxFundingRate(funding);
    expect(derived.features.funding_rate).toBe(0.0001);
  });

  it("derives open interest", () => {
    const oi: OkxOpenInterest = {
      exchange: "okx",
      instId: "BTC-USDT-SWAP",
      symbol: "BTC/USDT",
      timestamp: new Date().toISOString(),
      openInterest: 1000,
      openInterestCcy: 10,
      openInterestUsd: 1000
    };
    const derived = deriveOkxOpenInterest(oi);
    expect(derived.features.open_interest).toBe(1000);
  });

  it("derives balance", () => {
    const balance: NormalizedBalance = {
      exchange: "okx",
      accountType: "swap",
      marginCcy: "USDT",
      settleCcy: "USDT",
      timestamp: new Date().toISOString(),
      assets: [
        { ccy: "USDT", free: 90, used: 10, total: 100 },
        { ccy: "USDC", free: 50, used: 0, total: 50 }
      ]
    };
    const derived = deriveOkxBalance(balance);
    expect(derived.features.asset_count).toBe(2);
  });

  it("derives positions", () => {
    const positions: NormalizedPositions = {
      exchange: "okx",
      accountType: "swap",
      marginCcy: "USDT",
      settleCcy: "USDT",
      timestamp: new Date().toISOString(),
      positions: [
        {
          instId: "BTC-USDT-SWAP",
          symbol: "BTC/USDT",
          side: "long",
          size: 1,
          entryPrice: 100,
          markPrice: 105,
          unrealizedPnl: 5,
          leverage: 10
        }
      ]
    };
    const derived = deriveOkxPositions(positions);
    expect(derived.features.gross_exposure).not.toBeNull();
  });

  it("derives orders", () => {
    const orders: NormalizedPendingOrders = {
      exchange: "okx",
      accountType: "swap",
      marginCcy: "USDT",
      settleCcy: "USDT",
      timestamp: new Date().toISOString(),
      orders: [
        {
          orderId: "1",
          instId: "BTC-USDT-SWAP",
          symbol: "BTC/USDT",
          side: "buy",
          type: "limit",
          size: 2,
          filled: 1,
          status: "open",
          createTime: new Date().toISOString()
        }
      ]
    };
    const derived = deriveOkxOrders(orders);
    expect(derived.features.order_count).toBe(1);
  });

  it("derives history orders", () => {
    const orders: NormalizedHistoryOrders = {
      exchange: "okx",
      accountType: "swap",
      marginCcy: "USDT",
      settleCcy: "USDT",
      timestamp: new Date().toISOString(),
      orders: []
    };
    const derived = deriveOkxOrders(orders);
    expect(derived.features.order_count).toBe(0);
  });
});
