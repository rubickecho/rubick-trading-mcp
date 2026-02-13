import type { OkxFundingRate } from "@rubick-trading-mcp/core-schema";
import { createDerivedEnvelope, type DerivedEnvelope, type DerivedLevel } from "../types";

export type OkxFundingRateDerivedFeatures = {
  funding_rate: number | null;
  funding_rate_annualized: number | null;
};

const FUNDING_INTERVALS_PER_DAY = 3;
const DAYS_PER_YEAR = 365;

export function deriveOkxFundingRate(
  normalized: OkxFundingRate,
  level: DerivedLevel = "basic"
): DerivedEnvelope<OkxFundingRateDerivedFeatures> {
  const rate = Number.isFinite(normalized.fundingRate) ? normalized.fundingRate : null;
  const annualized = rate !== null ? rate * FUNDING_INTERVALS_PER_DAY * DAYS_PER_YEAR : null;

  return createDerivedEnvelope(level, {
    funding_rate: rate,
    funding_rate_annualized: annualized
  });
}
