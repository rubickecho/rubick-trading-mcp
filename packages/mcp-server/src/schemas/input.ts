export const accountToolInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["exchange"],
  properties: {
    exchange: { type: "string", enum: ["okx", "binance", "hyperliquid"] },
    symbol: { type: "string" },
    instId: { type: "string" },
    marginCcy: { type: "string", enum: ["USDT", "USDC"] },
    settleCcy: { type: "string", enum: ["USDT", "USDC"] },
    since: { type: "number" },
    end: { type: "number" },
    limit: { type: "number" },
    cursor: { type: "string" },
    extra: { type: "object", additionalProperties: true }
  }
} as const;

export const marketToolInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["exchange"],
  anyOf: [{ required: ["instId"] }, { required: ["symbol"] }],
  properties: {
    exchange: { type: "string", enum: ["okx"] },
    instId: { type: "string" },
    symbol: { type: "string" },
    bar: { type: "string" },
    limit: { type: "number" },
    depth: { type: "number" }
  }
} as const;
