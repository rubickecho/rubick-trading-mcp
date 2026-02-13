export type Exchange = "okx" | "binance" | "hyperliquid";

export type AccountToolName =
  | "get_balance"
  | "get_positions"
  | "get_pending_orders"
  | "get_history_orders";

export type MarketToolName =
  | "get_ticker"
  | "get_candles"
  | "get_order_book"
  | "get_funding_rate"
  | "get_open_interest";

export type AccountToolInput = {
  exchange: Exchange;
  symbol?: string;
  instId?: string;
  marginCcy?: "USDT" | "USDC";
  settleCcy?: "USDT" | "USDC";
  since?: number;
  end?: number;
  limit?: number;
  cursor?: string;
  extra?: Record<string, unknown>;
};

export type MarketToolInput = {
  exchange: "okx";
  instId?: string;
  symbol?: string;
  bar?: string;
  limit?: number;
  depth?: number;
};

export type McpContent = { type: "text"; text: string };

export type McpErrorCode =
  | "INVALID_INPUT"
  | "PROVIDER_ERROR"
  | "OUTPUT_SCHEMA_ERROR"
  | "INTERNAL_ERROR";

export type McpError = {
  code: McpErrorCode;
  message: string;
  details?: unknown;
};

export type McpResponse<T = unknown> = {
  content: McpContent[];
  structuredContent: {
    raw: unknown;
    normalized: T;
    derived?: unknown;
  } | null;
  outputSchema: unknown;
  isError: boolean;
  error?: McpError;
  meta?: {
    requestId?: string;
  };
};

export type McpEnvelope<T = unknown> = {
  id?: string;
  result?: McpResponse<T>;
  error?: McpError;
};
