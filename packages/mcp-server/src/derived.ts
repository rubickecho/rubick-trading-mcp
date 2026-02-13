import {
  DERIVED_SCHEMA_MAP,
  deriveOkxBalance,
  deriveOkxCandles,
  deriveOkxFundingRate,
  deriveOkxOpenInterest,
  deriveOkxOrderBook,
  deriveOkxOrders,
  deriveOkxPositions,
  deriveOkxTicker,
  type DerivedEnvelope,
  type DerivedLevel
} from "@rubick-trading-mcp/core-derived";
import type { AccountToolInput, AccountToolName, MarketToolInput, MarketToolName } from "./types";
import type {
  NormalizedBalance,
  NormalizedHistoryOrders,
  NormalizedPendingOrders,
  NormalizedPositions,
  OkxCandles,
  OkxFundingRate,
  OkxOpenInterest,
  OkxOrderBook,
  OkxTicker
} from "@rubick-trading-mcp/core-schema";

const DEFAULT_LEVEL: DerivedLevel = "basic";

export { DERIVED_SCHEMA_MAP };

export function deriveAccount(
  tool: AccountToolName,
  input: AccountToolInput,
  normalized: unknown
): DerivedEnvelope<unknown> | null {
  if (input.exchange !== "okx") {
    return null;
  }

  switch (tool) {
    case "get_balance":
      return deriveOkxBalance(normalized as NormalizedBalance, DEFAULT_LEVEL);
    case "get_positions":
      return deriveOkxPositions(normalized as NormalizedPositions, DEFAULT_LEVEL);
    case "get_pending_orders":
      return deriveOkxOrders(normalized as NormalizedPendingOrders, DEFAULT_LEVEL);
    case "get_history_orders":
      return deriveOkxOrders(normalized as NormalizedHistoryOrders, DEFAULT_LEVEL);
    default:
      return null;
  }
}

export function deriveMarket(
  tool: MarketToolName,
  input: MarketToolInput,
  normalized: unknown
): DerivedEnvelope<unknown> | null {
  if (input.exchange !== "okx") {
    return null;
  }

  switch (tool) {
    case "get_ticker":
      return deriveOkxTicker(normalized as OkxTicker, DEFAULT_LEVEL);
    case "get_candles":
      return deriveOkxCandles(normalized as OkxCandles, DEFAULT_LEVEL);
    case "get_order_book":
      return deriveOkxOrderBook(normalized as OkxOrderBook, DEFAULT_LEVEL);
    case "get_funding_rate":
      return deriveOkxFundingRate(normalized as OkxFundingRate, DEFAULT_LEVEL);
    case "get_open_interest":
      return deriveOkxOpenInterest(normalized as OkxOpenInterest, DEFAULT_LEVEL);
    default:
      return null;
  }
}
