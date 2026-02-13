import type { NormalizedBalance } from "@rubick-trading-mcp/core-schema";
import { createDerivedEnvelope, type DerivedEnvelope, type DerivedLevel } from "../types";
import { sum, safeDiv } from "../utils/stats";

export type OkxBalanceDerivedFeatures = {
  free_pct: number | null;
  used_pct: number | null;
  asset_concentration_top1: number | null;
  asset_count: number;
};

export function deriveOkxBalance(
  normalized: NormalizedBalance,
  level: DerivedLevel = "basic"
): DerivedEnvelope<OkxBalanceDerivedFeatures> {
  const totals = normalized.assets.map((asset) => asset.total);
  const free = normalized.assets.map((asset) => asset.free);
  const used = normalized.assets.map((asset) => asset.used);
  const totalSum = sum(totals);

  const freePct = safeDiv(sum(free), totalSum);
  const usedPct = safeDiv(sum(used), totalSum);
  const top1 = totals.length > 0 ? Math.max(...totals) : 0;
  const concentration = safeDiv(top1, totalSum);

  const features: OkxBalanceDerivedFeatures = {
    free_pct: freePct,
    used_pct: usedPct,
    asset_concentration_top1: concentration,
    asset_count: normalized.assets.length
  };

  return createDerivedEnvelope(level, features);
}
