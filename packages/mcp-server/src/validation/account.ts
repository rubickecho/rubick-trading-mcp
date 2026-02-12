import type { AccountToolInput, AccountToolName, Exchange } from "../types";

const STABLE_CCY = new Set(["USDT", "USDC"]);

function isExchange(value: unknown): value is Exchange {
  return value === "okx" || value === "binance" || value === "hyperliquid";
}

export function validateAccountToolInput(tool: AccountToolName, input: AccountToolInput): string | null {
  if (!input || typeof input !== "object") {
    return "input is required";
  }
  if (!isExchange(input.exchange)) {
    return "exchange must be okx/binance/hyperliquid";
  }
  if (input.marginCcy && !STABLE_CCY.has(input.marginCcy)) {
    return "marginCcy must be USDT or USDC";
  }
  if (input.settleCcy && !STABLE_CCY.has(input.settleCcy)) {
    return "settleCcy must be USDT or USDC";
  }
  if (input.since && input.end && input.since > input.end) {
    return "since must be <= end";
  }
  if (input.limit !== undefined && input.limit <= 0) {
    return "limit must be > 0";
  }

  if (input.exchange === "binance" && tool === "get_history_orders" && !input.symbol) {
    return "binance get_history_orders requires symbol";
  }
  if (input.exchange === "hyperliquid" && !input.extra?.user) {
    return "hyperliquid requires extra.user";
  }

  return null;
}
