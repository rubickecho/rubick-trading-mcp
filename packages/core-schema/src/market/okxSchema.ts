import { z } from "zod";

export const OkxMarketCommonSchema = z.object({
  exchange: z.literal("okx"),
  instId: z.string(),
  symbol: z.string(),
  timestamp: z.string()
});

export const OkxTickerSchema = OkxMarketCommonSchema.extend({
  last: z.number(),
  bid: z.number(),
  ask: z.number(),
  high24h: z.number(),
  low24h: z.number(),
  vol24h: z.number()
});

export const OkxCandlesSchema = OkxMarketCommonSchema.extend({
  candles: z.array(
    z.object({
      timestamp: z.string(),
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
      volume: z.number(),
      isComplete: z.boolean().optional()
    })
  )
});

export const OkxOrderBookSchema = OkxMarketCommonSchema.extend({
  bids: z.array(z.tuple([z.number(), z.number()])),
  asks: z.array(z.tuple([z.number(), z.number()])),
  depth: z.number()
});

export const OkxFundingRateSchema = OkxMarketCommonSchema.extend({
  fundingRate: z.number(),
  nextFundingRate: z.number().optional(),
  fundingTime: z.string().optional()
});

export const OkxOpenInterestSchema = OkxMarketCommonSchema.extend({
  openInterest: z.number(),
  openInterestCcy: z.number().optional(),
  openInterestUsd: z.number().optional()
});

export type OkxTicker = z.infer<typeof OkxTickerSchema>;
export type OkxCandles = z.infer<typeof OkxCandlesSchema>;
export type OkxOrderBook = z.infer<typeof OkxOrderBookSchema>;
export type OkxFundingRate = z.infer<typeof OkxFundingRateSchema>;
export type OkxOpenInterest = z.infer<typeof OkxOpenInterestSchema>;
