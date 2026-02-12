import { z } from "zod";

export const ExchangeSchema = z.enum(["okx", "binance", "hyperliquid"]);
export const AccountTypeSchema = z.enum(["swap", "future"]);
export const MarginCcySchema = z.enum(["USDT", "USDC"]);

export const CommonAccountFieldsSchema = z.object({
  exchange: ExchangeSchema,
  accountType: AccountTypeSchema,
  marginCcy: MarginCcySchema,
  settleCcy: MarginCcySchema,
  timestamp: z.string()
});

export const AssetSchema = z.object({
  ccy: z.string(),
  free: z.number(),
  used: z.number(),
  total: z.number(),
  usdValue: z.number().optional()
});

export const PositionSchema = z.object({
  instId: z.string(),
  symbol: z.string(),
  side: z.enum(["long", "short"]),
  size: z.number(),
  entryPrice: z.number(),
  markPrice: z.number().optional(),
  liqPrice: z.number().optional(),
  unrealizedPnl: z.number().optional(),
  leverage: z.number().optional(),
  marginMode: z.enum(["cross", "isolated"]).optional(),
  notional: z.number().optional()
});

export const OrderSchema = z.object({
  orderId: z.string(),
  instId: z.string(),
  symbol: z.string(),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["limit", "market", "post_only", "ioc", "fok"]),
  price: z.number().optional(),
  size: z.number(),
  filled: z.number().optional(),
  status: z.enum(["open", "closed", "canceled"]),
  createTime: z.string(),
  updateTime: z.string().optional()
});

export const BalanceSchema = CommonAccountFieldsSchema.extend({
  assets: z.array(AssetSchema)
});

export const PositionsSchema = CommonAccountFieldsSchema.extend({
  positions: z.array(PositionSchema)
});

export const PendingOrdersSchema = CommonAccountFieldsSchema.extend({
  orders: z.array(OrderSchema)
});

export const HistoryOrdersSchema = CommonAccountFieldsSchema.extend({
  orders: z.array(OrderSchema)
});

export type NormalizedBalance = z.infer<typeof BalanceSchema>;
export type NormalizedPositions = z.infer<typeof PositionsSchema>;
export type NormalizedPendingOrders = z.infer<typeof PendingOrdersSchema>;
export type NormalizedHistoryOrders = z.infer<typeof HistoryOrdersSchema>;
