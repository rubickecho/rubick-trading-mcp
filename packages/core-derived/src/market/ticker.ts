import type { OkxTicker } from "@rubick-trading-mcp/core-schema";
import { createDerivedEnvelope, type DerivedEnvelope, type DerivedLevel } from "../types";
import { pctChange, safeDiv } from "../utils/stats";

export type OkxTickerDerivedFeatures = {
  mid_price: number | null;
  spread_abs: number | null;
  spread_bps: number | null;
  high_low_range_24h_pct: number | null;
};

export function deriveOkxTicker(
  normalized: OkxTicker,
  level: DerivedLevel = "basic"
): DerivedEnvelope<OkxTickerDerivedFeatures> {
  const bid = normalized.bid;
  const ask = normalized.ask;
  const mid = safeDiv(bid + ask, 2);
  const spreadAbs = bid !== undefined && ask !== undefined ? ask - bid : null;
  const spreadBps = mid && spreadAbs !== null ? safeDiv(spreadAbs, mid) : null;
  const highLowRange = pctChange(normalized.high24h, normalized.low24h);

  const features: OkxTickerDerivedFeatures = {
    mid_price: mid,
    spread_abs: spreadAbs,
    spread_bps: spreadBps !== null ? spreadBps * 10000 : null,
    high_low_range_24h_pct: highLowRange !== null ? highLowRange * 100 : null
  };

  return createDerivedEnvelope(level, features);
}
