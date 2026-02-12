import {
  normalizeBinanceBalance,
  normalizeBinanceHistoryOrders,
  normalizeBinancePendingOrders,
  normalizeBinancePositions,
  normalizeHyperliquidBalance,
  normalizeHyperliquidHistoryOrders,
  normalizeHyperliquidPendingOrders,
  normalizeHyperliquidPositions,
  normalizeOkxBalance,
  normalizeOkxHistoryOrders,
  normalizeOkxPendingOrders,
  normalizeOkxPositions
} from "@rubick-trading-mcp/core-schema";
import type { AccountToolInput, AccountToolName, Exchange, McpResponse, McpErrorCode } from "../types";
import { validateAccountToolInput, validateSchema } from "../validation";
import { accountToolInputSchema } from "../schemas";
import { OUTPUT_SCHEMA_MAP } from "../tools/schemaMap";
import { buildAccountSummary } from "../summary";

export type AccountProvider = {
  getBalance(params: AccountToolInput): Promise<unknown>;
  getPositions(params: AccountToolInput): Promise<unknown>;
  getPendingOrders(params: AccountToolInput): Promise<unknown>;
  getHistoryOrders(params: AccountToolInput): Promise<unknown>;
};

export type AccountProviders = Record<Exchange, AccountProvider>;

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

export async function handleAccountTool(
  tool: AccountToolName,
  input: AccountToolInput,
  providers: AccountProviders
): Promise<McpResponse<unknown>> {
  const inputSchemaCheck = validateSchema(accountToolInputSchema, input);
  if (!inputSchemaCheck.valid) {
    return errorResponse("INVALID_INPUT", "input schema validation failed", inputSchemaCheck.errors);
  }
  const validationError = validateAccountToolInput(tool, input);
  if (validationError) {
    return errorResponse("INVALID_INPUT", validationError);
  }

  try {
    const provider = providers[input.exchange];
    let raw: unknown;
    let normalized: unknown;

    switch (tool) {
      case "get_balance":
        raw = await provider.getBalance(input);
        normalized =
          input.exchange === "okx"
            ? normalizeOkxBalance(raw as never)
            : input.exchange === "binance"
            ? normalizeBinanceBalance(raw as never)
            : normalizeHyperliquidBalance(raw as never);
        break;
      case "get_positions":
        raw = await provider.getPositions(input);
        normalized =
          input.exchange === "okx"
            ? normalizeOkxPositions(raw as never)
            : input.exchange === "binance"
            ? normalizeBinancePositions(raw as never)
            : normalizeHyperliquidPositions(raw as never);
        break;
      case "get_pending_orders":
        raw = await provider.getPendingOrders(input);
        normalized =
          input.exchange === "okx"
            ? normalizeOkxPendingOrders(raw as never)
            : input.exchange === "binance"
            ? normalizeBinancePendingOrders(raw as never)
            : normalizeHyperliquidPendingOrders(raw as never);
        break;
      case "get_history_orders":
        raw = await provider.getHistoryOrders(input);
        normalized =
          input.exchange === "okx"
            ? normalizeOkxHistoryOrders(raw as never)
            : input.exchange === "binance"
            ? normalizeBinanceHistoryOrders(raw as never)
            : normalizeHyperliquidHistoryOrders(raw as never);
        break;
      default:
        return errorResponse("INVALID_INPUT", `unsupported tool: ${tool}`);
    }

    const outputSchema = OUTPUT_SCHEMA_MAP[tool];
    const outputCheck = validateSchema(outputSchema, normalized);
    if (!outputCheck.valid) {
      return errorResponse("OUTPUT_SCHEMA_ERROR", "output schema validation failed", outputCheck.errors);
    }

    const requestId = `req_${Math.random().toString(36).slice(2, 10)}`;
    return {
      content: [{ type: "text", text: buildAccountSummary(tool, normalized) }],
      structuredContent: { raw, normalized },
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
