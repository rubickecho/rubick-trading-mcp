const numberOrNull = { type: ["number", "null"] } as const;

function envelopeSchema(featuresSchema: Record<string, unknown>) {
  return {
    type: "object",
    required: ["version", "asOf", "level", "features"],
    additionalProperties: false,
    properties: {
      version: { type: "string", enum: ["v1"] },
      asOf: { type: "string" },
      level: { type: "string", enum: ["basic", "standard", "full"] },
      features: featuresSchema,
      warnings: {
        type: "array",
        items: { type: "string" }
      }
    }
  } as const;
}

const tickerFeaturesSchema = {
  type: "object",
  additionalProperties: false,
  required: ["mid_price", "spread_abs", "spread_bps", "high_low_range_24h_pct"],
  properties: {
    mid_price: numberOrNull,
    spread_abs: numberOrNull,
    spread_bps: numberOrNull,
    high_low_range_24h_pct: numberOrNull
  }
} as const;

const candlesFeaturesSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "returns_pct",
    "volatility_std",
    "atr",
    "ema_fast",
    "ema_slow",
    "ema_diff",
    "rsi",
    "macd",
    "macd_signal",
    "macd_hist",
    "bb_upper",
    "bb_middle",
    "bb_lower",
    "bb_width",
    "trend_state_raw",
    "volume_zscore"
  ],
  properties: {
    returns_pct: { type: "array", items: { type: "number" } },
    volatility_std: numberOrNull,
    atr: numberOrNull,
    ema_fast: numberOrNull,
    ema_slow: numberOrNull,
    ema_diff: numberOrNull,
    rsi: numberOrNull,
    macd: numberOrNull,
    macd_signal: numberOrNull,
    macd_hist: numberOrNull,
    bb_upper: numberOrNull,
    bb_middle: numberOrNull,
    bb_lower: numberOrNull,
    bb_width: numberOrNull,
    trend_state_raw: { type: "string", enum: ["up", "down", "sideways", "undefined"] },
    volume_zscore: numberOrNull
  }
} as const;

const orderBookFeaturesSchema = {
  type: "object",
  additionalProperties: false,
  required: ["weighted_mid", "imbalance_top_n", "depth_ratio", "spread_abs", "spread_bps"],
  properties: {
    weighted_mid: numberOrNull,
    imbalance_top_n: numberOrNull,
    depth_ratio: numberOrNull,
    spread_abs: numberOrNull,
    spread_bps: numberOrNull
  }
} as const;

const fundingRateFeaturesSchema = {
  type: "object",
  additionalProperties: false,
  required: ["funding_rate", "funding_rate_annualized"],
  properties: {
    funding_rate: numberOrNull,
    funding_rate_annualized: numberOrNull
  }
} as const;

const openInterestFeaturesSchema = {
  type: "object",
  additionalProperties: false,
  required: ["open_interest", "open_interest_ccy", "open_interest_usd"],
  properties: {
    open_interest: numberOrNull,
    open_interest_ccy: numberOrNull,
    open_interest_usd: numberOrNull
  }
} as const;

const balanceFeaturesSchema = {
  type: "object",
  additionalProperties: false,
  required: ["free_pct", "used_pct", "asset_concentration_top1", "asset_count"],
  properties: {
    free_pct: numberOrNull,
    used_pct: numberOrNull,
    asset_concentration_top1: numberOrNull,
    asset_count: { type: "number" }
  }
} as const;

const positionsFeaturesSchema = {
  type: "object",
  additionalProperties: false,
  required: ["net_exposure", "gross_exposure", "unrealized_pnl_pct", "leverage_effective"],
  properties: {
    net_exposure: numberOrNull,
    gross_exposure: numberOrNull,
    unrealized_pnl_pct: numberOrNull,
    leverage_effective: numberOrNull
  }
} as const;

const ordersFeaturesSchema = {
  type: "object",
  additionalProperties: false,
  required: ["order_count", "buy_sell_ratio", "avg_order_size", "fill_ratio_avg"],
  properties: {
    order_count: { type: "number" },
    buy_sell_ratio: numberOrNull,
    avg_order_size: numberOrNull,
    fill_ratio_avg: numberOrNull
  }
} as const;

export const DERIVED_SCHEMA_MAP = {
  get_ticker: envelopeSchema(tickerFeaturesSchema),
  get_candles: envelopeSchema(candlesFeaturesSchema),
  get_order_book: envelopeSchema(orderBookFeaturesSchema),
  get_funding_rate: envelopeSchema(fundingRateFeaturesSchema),
  get_open_interest: envelopeSchema(openInterestFeaturesSchema),
  get_balance: envelopeSchema(balanceFeaturesSchema),
  get_positions: envelopeSchema(positionsFeaturesSchema),
  get_pending_orders: envelopeSchema(ordersFeaturesSchema),
  get_history_orders: envelopeSchema(ordersFeaturesSchema)
} as const;
