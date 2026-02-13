import type { NormalizedPositions } from "@rubick-trading-mcp/core-schema";
import { createDerivedEnvelope, type DerivedEnvelope, type DerivedLevel } from "../types";
import { safeDiv, sum } from "../utils/stats";

export type OkxPositionsDerivedFeatures = {
  net_exposure: number | null;
  gross_exposure: number | null;
  unrealized_pnl_pct: number | null;
  leverage_effective: number | null;
};

export function deriveOkxPositions(
  normalized: NormalizedPositions,
  level: DerivedLevel = "basic"
): DerivedEnvelope<OkxPositionsDerivedFeatures> {
  const notionals: number[] = [];
  const longNotionals: number[] = [];
  const shortNotionals: number[] = [];
  const unrealized: number[] = [];
  const leverageWeighted: Array<{ leverage: number; notional: number }> = [];

  for (const position of normalized.positions) {
    const price = position.markPrice ?? position.entryPrice;
    const notional = position.notional ?? (position.size * price);
    notionals.push(notional);
    if (position.side === "long") {
      longNotionals.push(notional);
    } else {
      shortNotionals.push(notional);
    }
    if (position.unrealizedPnl !== undefined) {
      unrealized.push(position.unrealizedPnl);
    }
    if (position.leverage !== undefined && Number.isFinite(position.leverage)) {
      leverageWeighted.push({ leverage: position.leverage, notional });
    }
  }

  const gross = sum(notionals);
  const net = sum(longNotionals) - sum(shortNotionals);
  const pnlPct = gross > 0 ? safeDiv(sum(unrealized), gross) : null;

  let leverageEffective: number | null = null;
  if (leverageWeighted.length > 0 && gross > 0) {
    const weighted = leverageWeighted.reduce((acc, item) => acc + item.leverage * item.notional, 0);
    leverageEffective = weighted / gross;
  }

  const features: OkxPositionsDerivedFeatures = {
    net_exposure: gross > 0 ? net : null,
    gross_exposure: gross > 0 ? gross : null,
    unrealized_pnl_pct: pnlPct,
    leverage_effective: leverageEffective
  };

  return createDerivedEnvelope(level, features);
}
