import { describe, expect, it } from "vitest";
import {
  BalanceSchema,
  HistoryOrdersSchema,
  PendingOrdersSchema,
  PositionsSchema,
  normalizeBinanceBalance,
  normalizeBinanceHistoryOrders,
  normalizeBinancePendingOrders,
  normalizeBinancePositions,
  normalizeHyperliquidBalance,
  normalizeHyperliquidHistoryOrders,
  normalizeHyperliquidPendingOrders,
  normalizeHyperliquidPositions,
  normalizeOkxBalance,
  normalizeOkxHistoryOrders,
  normalizeOkxPendingOrders,
  normalizeOkxPositions
} from "../src";

describe("account normalizers", () => {
  it("normalizes OKX data", () => {
    const balance = normalizeOkxBalance({
      data: [
        {
          uTime: "1700000000000",
          details: [
            { ccy: "USDT", availEq: "100", frozenBal: "20", eq: "120", usdEq: "120" }
          ]
        }
      ]
    });
    const positions = normalizeOkxPositions({
      data: [
        {
          instId: "BTC-USDT-SWAP",
          posSide: "long",
          pos: "1",
          avgPx: "30000",
          markPx: "30100",
          liqPx: "25000",
          upl: "100",
          lever: "10",
          mgnMode: "cross",
          notionalUsd: "30000",
          ctValCcy: "USDT",
          uTime: "1700000000000"
        }
      ]
    });
    const ordersRaw = {
      data: [
        {
          ordId: "1",
          instId: "BTC-USDT-SWAP",
          side: "buy",
          ordType: "limit",
          px: "30000",
          sz: "1",
          fillSz: "0",
          state: "live",
          cTime: "1700000000000",
          uTime: "1700000001000"
        }
      ]
    };

    const pending = normalizeOkxPendingOrders(ordersRaw);
    const history = normalizeOkxHistoryOrders(ordersRaw);

    expect(() => BalanceSchema.parse(balance)).not.toThrow();
    expect(() => PositionsSchema.parse(positions)).not.toThrow();
    expect(() => PendingOrdersSchema.parse(pending)).not.toThrow();
    expect(() => HistoryOrdersSchema.parse(history)).not.toThrow();
  });

  it("normalizes Binance data", () => {
    const balance = normalizeBinanceBalance([
      { asset: "USDT", availableBalance: "100", balance: "150" }
    ]);
    const positions = normalizeBinancePositions([
      {
        symbol: "BTCUSDT",
        positionAmt: "-0.5",
        entryPrice: "30000",
        markPrice: "30100",
        liquidationPrice: "40000",
        unRealizedProfit: "-50",
        leverage: "10",
        marginType: "cross",
        notional: "15000"
      }
    ]);
    const ordersRaw = [
      {
        orderId: 1,
        symbol: "BTCUSDT",
        side: "SELL",
        type: "LIMIT",
        price: "30000",
        origQty: "1",
        executedQty: "0.1",
        status: "NEW",
        time: 1700000000000,
        updateTime: 1700000001000
      }
    ];

    const pending = normalizeBinancePendingOrders(ordersRaw);
    const history = normalizeBinanceHistoryOrders(ordersRaw);

    expect(() => BalanceSchema.parse(balance)).not.toThrow();
    expect(() => PositionsSchema.parse(positions)).not.toThrow();
    expect(() => PendingOrdersSchema.parse(pending)).not.toThrow();
    expect(() => HistoryOrdersSchema.parse(history)).not.toThrow();
  });

  it("normalizes Hyperliquid data", () => {
    const balance = normalizeHyperliquidBalance({
      clearinghouseState: {
        marginSummary: { accountValue: "1000", totalMarginUsed: "100" },
        assetPositions: [
          { position: { coin: "BTC", szi: "1", entryPx: "30000" } }
        ]
      }
    });
    const positions = normalizeHyperliquidPositions({
      clearinghouseState: {
        assetPositions: [
          {
            position: {
              coin: "ETH",
              szi: "-2",
              entryPx: "2000",
              markPx: "2100",
              liquidationPx: "1500",
              unrealizedPnl: "-10",
              leverage: "5",
              positionValue: "4200"
            }
          }
        ]
      }
    });
    const openOrders = [
      {
        oid: 1,
        coin: "BTC",
        side: "buy",
        orderType: "limit",
        limitPx: "30000",
        sz: "1",
        filledSz: "0",
        timestamp: 1700000000000
      }
    ];
    const fills = [
      {
        oid: 2,
        coin: "ETH",
        side: "sell",
        orderType: "market",
        px: "2000",
        sz: "1",
        time: 1700000000000
      }
    ];

    const pending = normalizeHyperliquidPendingOrders(openOrders);
    const history = normalizeHyperliquidHistoryOrders(fills);

    expect(() => BalanceSchema.parse(balance)).not.toThrow();
    expect(() => PositionsSchema.parse(positions)).not.toThrow();
    expect(() => PendingOrdersSchema.parse(pending)).not.toThrow();
    expect(() => HistoryOrdersSchema.parse(history)).not.toThrow();
  });
});
