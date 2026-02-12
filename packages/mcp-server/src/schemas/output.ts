const accountCommon = {
  type: "object",
  required: ["exchange", "accountType", "marginCcy", "settleCcy", "timestamp"],
  properties: {
    exchange: { type: "string", enum: ["okx", "binance", "hyperliquid"] },
    accountType: { type: "string", enum: ["swap", "future"] },
    marginCcy: { type: "string", enum: ["USDT", "USDC"] },
    settleCcy: { type: "string", enum: ["USDT", "USDC"] },
    timestamp: { type: "string" }
  }
} as const;

export const balanceOutputSchema = {
  ...accountCommon,
  required: [...accountCommon.required, "assets"],
  properties: {
    ...accountCommon.properties,
    assets: {
      type: "array",
      items: {
        type: "object",
        required: ["ccy", "free", "used", "total"],
        properties: {
          ccy: { type: "string" },
          free: { type: "number" },
          used: { type: "number" },
          total: { type: "number" },
          usdValue: { type: "number" }
        }
      }
    }
  }
} as const;

export const positionsOutputSchema = {
  ...accountCommon,
  required: [...accountCommon.required, "positions"],
  properties: {
    ...accountCommon.properties,
    positions: {
      type: "array",
      items: {
        type: "object",
        required: ["instId", "symbol", "side", "size", "entryPrice"],
        properties: {
          instId: { type: "string" },
          symbol: { type: "string" },
          side: { type: "string", enum: ["long", "short"] },
          size: { type: "number" },
          entryPrice: { type: "number" },
          markPrice: { type: "number" },
          liqPrice: { type: "number" },
          unrealizedPnl: { type: "number" },
          leverage: { type: "number" },
          marginMode: { type: "string", enum: ["cross", "isolated"] },
          notional: { type: "number" }
        }
      }
    }
  }
} as const;

export const ordersOutputSchema = {
  ...accountCommon,
  required: [...accountCommon.required, "orders"],
  properties: {
    ...accountCommon.properties,
    orders: {
      type: "array",
      items: {
        type: "object",
        required: ["orderId", "instId", "symbol", "side", "type", "size", "status", "createTime"],
        properties: {
          orderId: { type: "string" },
          instId: { type: "string" },
          symbol: { type: "string" },
          side: { type: "string", enum: ["buy", "sell"] },
          type: { type: "string", enum: ["limit", "market", "post_only", "ioc", "fok"] },
          price: { type: "number" },
          size: { type: "number" },
          filled: { type: "number" },
          status: { type: "string", enum: ["open", "closed", "canceled"] },
          createTime: { type: "string" },
          updateTime: { type: "string" }
        }
      }
    }
  }
} as const;

const marketCommon = {
  type: "object",
  required: ["exchange", "instId", "symbol", "timestamp"],
  properties: {
    exchange: { type: "string", enum: ["okx"] },
    instId: { type: "string" },
    symbol: { type: "string" },
    timestamp: { type: "string" }
  }
} as const;

export const tickerOutputSchema = {
  ...marketCommon,
  required: [...marketCommon.required, "last", "bid", "ask", "high24h", "low24h", "vol24h"],
  properties: {
    ...marketCommon.properties,
    last: { type: "number" },
    bid: { type: "number" },
    ask: { type: "number" },
    high24h: { type: "number" },
    low24h: { type: "number" },
    vol24h: { type: "number" }
  }
} as const;

export const candlesOutputSchema = {
  ...marketCommon,
  required: [...marketCommon.required, "candles"],
  properties: {
    ...marketCommon.properties,
    candles: {
      type: "array",
      items: {
        type: "object",
        required: ["timestamp", "open", "high", "low", "close", "volume"],
        properties: {
          timestamp: { type: "string" },
          open: { type: "number" },
          high: { type: "number" },
          low: { type: "number" },
          close: { type: "number" },
          volume: { type: "number" },
          isComplete: { type: "boolean" }
        }
      }
    }
  }
} as const;

export const orderBookOutputSchema = {
  ...marketCommon,
  required: [...marketCommon.required, "bids", "asks", "depth"],
  properties: {
    ...marketCommon.properties,
    bids: { type: "array", items: { type: "array", items: [{ type: "number" }, { type: "number" }], minItems: 2, maxItems: 2 } },
    asks: { type: "array", items: { type: "array", items: [{ type: "number" }, { type: "number" }], minItems: 2, maxItems: 2 } },
    depth: { type: "number" }
  }
} as const;

export const fundingRateOutputSchema = {
  ...marketCommon,
  required: [...marketCommon.required, "fundingRate"],
  properties: {
    ...marketCommon.properties,
    fundingRate: { type: "number" },
    nextFundingRate: { type: "number" },
    fundingTime: { type: "string" }
  }
} as const;

export const openInterestOutputSchema = {
  ...marketCommon,
  required: [...marketCommon.required, "openInterest"],
  properties: {
    ...marketCommon.properties,
    openInterest: { type: "number" },
    openInterestCcy: { type: "number" },
    openInterestUsd: { type: "number" }
  }
} as const;
