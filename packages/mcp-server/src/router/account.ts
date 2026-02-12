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
import type { AccountToolInput, AccountToolName, Exchange, McpResponse } from "../types";
import { validateAccountToolInput } from "../validation";
import { OUTPUT_SCHEMA_MAP } from "../tools/schemaMap";

export type AccountProvider = {
  getBalance(params: AccountToolInput): Promise<unknown>;
  getPositions(params: AccountToolInput): Promise<unknown>;
  getPendingOrders(params: AccountToolInput): Promise<unknown>;
  getHistoryOrders(params: AccountToolInput): Promise<unknown>;
};

export type AccountProviders = Record<Exchange, AccountProvider>;

function errorResponse(message: string): McpResponse<null> {
  return {
    content: [{ type: "text", text: message }],
    structuredContent: null,
    outputSchema: null,
    isError: true
  };
}

export async function handleAccountTool(
  tool: AccountToolName,
  input: AccountToolInput,
  providers: AccountProviders
): Promise<McpResponse<unknown>> {
  const validationError = validateAccountToolInput(tool, input);
  if (validationError) {
    return errorResponse(validationError);
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
