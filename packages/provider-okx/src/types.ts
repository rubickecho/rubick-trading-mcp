export type AccountToolParams = {
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

export type MarketToolParams = {
  instId?: string;
  symbol?: string;
  bar?: string;
  limit?: number;
  depth?: number;
};
