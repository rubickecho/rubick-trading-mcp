import type { OkxOrderBook } from "@rubick-trading-mcp/core-schema";
import { createDerivedEnvelope, type DerivedEnvelope, type DerivedLevel } from "../types";
import { safeDiv } from "../utils/stats";

export type OkxOrderBookDerivedFeatures = {
  weighted_mid: number | null;
  imbalance_top_n: number | null;
  depth_ratio: number | null;
  spread_abs: number | null;
  spread_bps: number | null;
};

export function deriveOkxOrderBook(
  normalized: OkxOrderBook,
  level: DerivedLevel = "basic"
): DerivedEnvelope<OkxOrderBookDerivedFeatures> {
  const bids = normalized.bids;
  const asks = normalized.asks;
  const topN = Math.min(5, bids.length, asks.length);

  let bidVol = 0;
  let askVol = 0;
  let bidWeighted = 0;
  let askWeighted = 0;

  for (let i = 0; i < topN; i += 1) {
    const [bidPrice, bidSize] = bids[i];
    const [askPrice, askSize] = asks[i];
    bidVol += bidSize;
    askVol += askSize;
    bidWeighted += bidPrice * bidSize;
    askWeighted += askPrice * askSize;
  }

  const weightedBid = bidVol > 0 ? bidWeighted / bidVol : null;
  const weightedAsk = askVol > 0 ? askWeighted / askVol : null;
  const weightedMid =
    weightedBid !== null && weightedAsk !== null ? (weightedBid + weightedAsk) / 2 : null;

  const bestBid = bids[0]?.[0];
  const bestAsk = asks[0]?.[0];
  const spreadAbs =
    typeof bestBid === "number" && typeof bestAsk === "number" ? bestAsk - bestBid : null;
  const mid =
    typeof bestBid === "number" && typeof bestAsk === "number" ? (bestBid + bestAsk) / 2 : null;
  const spreadBps = spreadAbs !== null && mid ? safeDiv(spreadAbs, mid) : null;

  const imbalance =
    bidVol + askVol > 0 ? (bidVol - askVol) / (bidVol + askVol) : null;
  const depthRatio = safeDiv(bidVol, askVol);

  const features: OkxOrderBookDerivedFeatures = {
    weighted_mid: weightedMid,
    imbalance_top_n: imbalance,
    depth_ratio: depthRatio,
    spread_abs: spreadAbs,
    spread_bps: spreadBps !== null ? spreadBps * 10000 : null
  };

  return createDerivedEnvelope(level, features);
}
