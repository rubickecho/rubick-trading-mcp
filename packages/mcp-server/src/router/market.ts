import {
  normalizeOkxCandles,
  normalizeOkxFundingRate,
  normalizeOkxOpenInterest,
  normalizeOkxOrderBook,
  normalizeOkxTicker
} from "@rubick-trading-mcp/core-schema";
import type { MarketToolInput, MarketToolName, McpResponse } from "../types";
import { validateMarketToolInput } from "../validation";
import { OUTPUT_SCHEMA_MAP } from "../tools/schemaMap";

export type MarketProvider = {
  getTicker(params: MarketToolInput): Promise<unknown>;
  getCandles(params: MarketToolInput): Promise<unknown>;
  getOrderBook(params: MarketToolInput): Promise<unknown>;
  getFundingRate(params: MarketToolInput): Promise<unknown>;
  getOpenInterest(params: MarketToolInput): Promise<unknown>;
};

function errorResponse(message: string): McpResponse<null> {
  return {
    content: [{ type: "text", text: message }],
    structuredContent: null,
    outputSchema: null,
    isError: true
  };
}

function resolveInstId(input: MarketToolInput): string {
  const instId = input.instId ?? input.symbol;
  if (!instId) {
    throw new Error("instId or symbol is required");
  }
  return instId;
}

export async function handleMarketTool(
  tool: MarketToolName,
  input: MarketToolInput,
  provider: MarketProvider
): Promise<McpResponse<unknown>> {
  const validationError = validateMarketToolInput(input);
  if (validationError) {
    return errorResponse(validationError);
  }

  try {
    let raw: unknown;
    let normalized: unknown;
    switch (tool) {
      case "get_ticker":
        raw = await provider.getTicker(input);
        normalized = normalizeOkxTicker(raw as never);
        break;
      case "get_candles":
        raw = await provider.getCandles(input);
        normalized = normalizeOkxCandles(raw as never, resolveInstId(input));
        break;
      case "get_order_book":
        raw = await provider.getOrderBook(input);
        normalized = normalizeOkxOrderBook(raw as never, resolveInstId(input), input.depth);
        break;
      case "get_funding_rate":
        raw = await provider.getFundingRate(input);
        normalized = normalizeOkxFundingRate(raw as never);
        break;
      case "get_open_interest":
        raw = await provider.getOpenInterest(input);
        normalized = normalizeOkxOpenInterest(raw as never);
        break;
      default:
        return errorResponse(`unsupported tool: ${tool}`);
    }

    return {
      content: [{ type: "text", text: "ok" }],
      structuredContent: { raw, normalized },
      outputSchema: OUTPUT_SCHEMA_MAP[tool],
      isError: false
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return errorResponse(message);
  }
}
