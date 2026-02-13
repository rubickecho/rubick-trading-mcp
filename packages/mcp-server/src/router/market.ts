import {
  normalizeOkxCandles,
  normalizeOkxFundingRate,
  normalizeOkxOpenInterest,
  normalizeOkxOrderBook,
  normalizeOkxTicker
} from "@rubick-trading-mcp/core-schema";
import type { MarketToolInput, MarketToolName, McpResponse, McpErrorCode } from "../types";
import { validateMarketToolInput, validateSchema } from "../validation";
import { marketToolInputSchema } from "../schemas";
import { OUTPUT_SCHEMA_MAP } from "../tools/schemaMap";
import { buildMarketSummary } from "../summary";
import { deriveMarket, DERIVED_SCHEMA_MAP } from "../derived";

export type MarketProvider = {
  getTicker(params: MarketToolInput): Promise<unknown>;
  getCandles(params: MarketToolInput): Promise<unknown>;
  getOrderBook(params: MarketToolInput): Promise<unknown>;
  getFundingRate(params: MarketToolInput): Promise<unknown>;
  getOpenInterest(params: MarketToolInput): Promise<unknown>;
};

function errorResponse(code: McpErrorCode, message: string, details?: unknown): McpResponse<null> {
  const requestId = `req_${Math.random().toString(36).slice(2, 10)}`;
  return {
    content: [{ type: "text", text: message }],
    structuredContent: null,
    outputSchema: null,
    isError: true,
    error: {
      code,
      message,
      details
    },
    meta: {
      requestId
    }
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
  const inputSchemaCheck = validateSchema(marketToolInputSchema, input);
  if (!inputSchemaCheck.valid) {
    return errorResponse("INVALID_INPUT", "input schema validation failed", inputSchemaCheck.errors);
  }
  const validationError = validateMarketToolInput(input);
  if (validationError) {
    return errorResponse("INVALID_INPUT", validationError);
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
        return errorResponse("INVALID_INPUT", `unsupported tool: ${tool}`);
    }

    const outputSchema = OUTPUT_SCHEMA_MAP[tool];
    const outputCheck = validateSchema(outputSchema, normalized);
    if (!outputCheck.valid) {
      return errorResponse("OUTPUT_SCHEMA_ERROR", "output schema validation failed", outputCheck.errors);
    }

    const derived = deriveMarket(tool, input, normalized);
    if (derived) {
      const derivedSchema = DERIVED_SCHEMA_MAP[tool];
      if (derivedSchema) {
        const derivedCheck = validateSchema(derivedSchema, derived);
        if (!derivedCheck.valid) {
          return errorResponse("OUTPUT_SCHEMA_ERROR", "derived schema validation failed", derivedCheck.errors);
        }
      }
    }

    const requestId = `req_${Math.random().toString(36).slice(2, 10)}`;
    return {
      content: [{ type: "text", text: buildMarketSummary(tool, normalized) }],
      structuredContent: { raw, normalized, derived: derived ?? undefined },
      outputSchema,
      isError: false,
      meta: {
        requestId
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return errorResponse("PROVIDER_ERROR", message);
  }
}
