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
