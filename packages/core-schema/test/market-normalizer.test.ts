import { describe, expect, it } from "vitest";
import {
  OkxCandlesSchema,
  OkxFundingRateSchema,
  OkxOpenInterestSchema,
  OkxOrderBookSchema,
  OkxTickerSchema,
  normalizeOkxCandles,
  normalizeOkxFundingRate,
  normalizeOkxOpenInterest,
  normalizeOkxOrderBook,
  normalizeOkxTicker
} from "../src";

describe("market normalizers", () => {
  it("normalizes OKX ticker", () => {
    const normalized = normalizeOkxTicker({
      data: [
        {
          instId: "BTC-USDT-SWAP",
          last: "30000",
          bidPx: "29999",
          askPx: "30001",
          high24h: "31000",
          low24h: "28000",
          vol24h: "1000",
          ts: "1700000000000"
        }
      ]
    });
    expect(() => OkxTickerSchema.parse(normalized)).not.toThrow();
  });

  it("normalizes OKX candles", () => {
    const normalized = normalizeOkxCandles(
      {
        data: [["1700000000000", "1", "2", "0.5", "1.5", "10", "", "", "1"]]
      },
      "BTC-USDT-SWAP"
    );
    expect(() => OkxCandlesSchema.parse(normalized)).not.toThrow();
  });

  it("normalizes OKX order book", () => {
    const normalized = normalizeOkxOrderBook(
      {
        data: [
          {
            bids: [["30000", "1"], ["29900", "2"]],
            asks: [["30010", "1"]],
            ts: "1700000000000"
          }
        ]
      },
      "BTC-USDT-SWAP",
      5
    );
    expect(() => OkxOrderBookSchema.parse(normalized)).not.toThrow();
  });

  it("normalizes OKX funding rate", () => {
    const normalized = normalizeOkxFundingRate({
      data: [
        {
          instId: "BTC-USDT-SWAP",
          fundingRate: "0.0001",
          nextFundingRate: "0.0002",
          fundingTime: "1700000000000",
          ts: "1700000001000"
        }
      ]
    });
    expect(() => OkxFundingRateSchema.parse(normalized)).not.toThrow();
  });

  it("normalizes OKX open interest", () => {
    const normalized = normalizeOkxOpenInterest({
      data: [
        {
          instId: "BTC-USDT-SWAP",
          oi: "123",
          oiCcy: "456",
          oiUsd: "789",
          ts: "1700000000000"
        }
      ]
    });
    expect(() => OkxOpenInterestSchema.parse(normalized)).not.toThrow();
  });
});
