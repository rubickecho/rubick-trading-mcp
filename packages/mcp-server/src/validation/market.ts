import type { MarketToolInput } from "../types";

export function validateMarketToolInput(input: MarketToolInput): string | null {
  if (!input || typeof input !== "object") {
    return "input is required";
  }
  if (input.exchange !== "okx") {
    return "market tools only support exchange=okx";
  }
  if (!input.instId && !input.symbol) {
    return "instId or symbol is required";
  }
  if (input.limit !== undefined && input.limit <= 0) {
    return "limit must be > 0";
  }
  if (input.depth !== undefined && input.depth <= 0) {
    return "depth must be > 0";
  }
  return null;
}
