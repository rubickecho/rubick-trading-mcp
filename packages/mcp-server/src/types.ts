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

export type McpResponse<T = unknown> = {
  content: McpContent[];
  structuredContent: {
    raw: unknown;
    normalized: T;
  } | null;
  outputSchema: unknown;
  isError: boolean;
};
