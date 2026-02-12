import type { OkxCandles, OkxFundingRate, OkxOpenInterest, OkxOrderBook, OkxTicker } from "../../market/okxSchema";
import { okxInstIdToSymbol, toIsoTimestamp, toNumber } from "../utils";

type OkxTickerRaw = {
  data?: Array<{
    instId?: string;
    last?: string;
    bidPx?: string;
    askPx?: string;
    high24h?: string;
    low24h?: string;
    vol24h?: string;
    ts?: string;
  }>;
};

type OkxCandlesRaw = {
  data?: Array<[string, string, string, string, string, string, string?, string?, string?]>;
};

type OkxOrderBookRaw = {
  data?: Array<{
    bids?: Array<[string, string, ...string[]]>;
    asks?: Array<[string, string, ...string[]]>;
    ts?: string;
  }>;
};

type OkxFundingRateRaw = {
  data?: Array<{
    instId?: string;
    fundingRate?: string;
    nextFundingRate?: string;
    fundingTime?: string;
    ts?: string;
  }>;
};

type OkxOpenInterestRaw = {
  data?: Array<{
    instId?: string;
    oi?: string;
    oiCcy?: string;
    oiUsd?: string;
    ts?: string;
  }>;
};

export function normalizeOkxTicker(raw: OkxTickerRaw): OkxTicker {
  const item = raw.data?.[0] ?? {};
  const instId = item.instId ?? "";
  return {
    exchange: "okx",
    instId,
    symbol: okxInstIdToSymbol(instId),
    timestamp: toIsoTimestamp(item.ts),
    last: toNumber(item.last),
    bid: toNumber(item.bidPx),
    ask: toNumber(item.askPx),
    high24h: toNumber(item.high24h),
    low24h: toNumber(item.low24h),
    vol24h: toNumber(item.vol24h)
  };
}

export function normalizeOkxCandles(raw: OkxCandlesRaw, instId: string): OkxCandles {
  const candles = (raw.data ?? []).map((row) => {
    const [ts, open, high, low, close, vol, , , confirm] = row;
    return {
      timestamp: toIsoTimestamp(ts),
      open: toNumber(open),
      high: toNumber(high),
      low: toNumber(low),
      close: toNumber(close),
      volume: toNumber(vol),
      isComplete: confirm !== undefined ? confirm === "1" : undefined
    };
  });

  return {
    exchange: "okx",
    instId,
    symbol: okxInstIdToSymbol(instId),
    timestamp: candles[0]?.timestamp ?? new Date().toISOString(),
    candles
  };
}

export function normalizeOkxOrderBook(raw: OkxOrderBookRaw, instId: string, depth?: number): OkxOrderBook {
  const item = raw.data?.[0] ?? {};
  const bids = (item.bids ?? []).map((bid) => [toNumber(bid[0]), toNumber(bid[1])] as [number, number]);
  const asks = (item.asks ?? []).map((ask) => [toNumber(ask[0]), toNumber(ask[1])] as [number, number]);
  const resolvedDepth = depth ?? Math.max(bids.length, asks.length);

  return {
    exchange: "okx",
    instId,
    symbol: okxInstIdToSymbol(instId),
    timestamp: toIsoTimestamp(item.ts),
    bids,
    asks,
    depth: resolvedDepth
  };
}

export function normalizeOkxFundingRate(raw: OkxFundingRateRaw): OkxFundingRate {
  const item = raw.data?.[0] ?? {};
  const instId = item.instId ?? "";

  return {
    exchange: "okx",
    instId,
    symbol: okxInstIdToSymbol(instId),
    timestamp: toIsoTimestamp(item.ts),
    fundingRate: toNumber(item.fundingRate),
    nextFundingRate: item.nextFundingRate !== undefined ? toNumber(item.nextFundingRate) : undefined,
    fundingTime: item.fundingTime ? toIsoTimestamp(item.fundingTime) : undefined
  };
}

export function normalizeOkxOpenInterest(raw: OkxOpenInterestRaw): OkxOpenInterest {
  const item = raw.data?.[0] ?? {};
  const instId = item.instId ?? "";

  return {
    exchange: "okx",
    instId,
    symbol: okxInstIdToSymbol(instId),
    timestamp: toIsoTimestamp(item.ts),
    openInterest: toNumber(item.oi),
    openInterestCcy: item.oiCcy !== undefined ? toNumber(item.oiCcy) : undefined,
    openInterestUsd: item.oiUsd !== undefined ? toNumber(item.oiUsd) : undefined
  };
}
