import type { OkxOpenInterest } from "@rubick-trading-mcp/core-schema";
import { createDerivedEnvelope, type DerivedEnvelope, type DerivedLevel } from "../types";

export type OkxOpenInterestDerivedFeatures = {
  open_interest: number | null;
  open_interest_ccy: number | null;
  open_interest_usd: number | null;
};

export function deriveOkxOpenInterest(
  normalized: OkxOpenInterest,
  level: DerivedLevel = "basic"
): DerivedEnvelope<OkxOpenInterestDerivedFeatures> {
  return createDerivedEnvelope(level, {
    open_interest: Number.isFinite(normalized.openInterest) ? normalized.openInterest : null,
    open_interest_ccy:
      normalized.openInterestCcy !== undefined && Number.isFinite(normalized.openInterestCcy)
        ? normalized.openInterestCcy
        : null,
    open_interest_usd:
      normalized.openInterestUsd !== undefined && Number.isFinite(normalized.openInterestUsd)
        ? normalized.openInterestUsd
        : null
  });
}
