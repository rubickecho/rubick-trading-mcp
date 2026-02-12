import type { NormalizedBalance, NormalizedHistoryOrders, NormalizedPendingOrders, NormalizedPositions } from "../../account/schema";
import { hyperliquidCoinToSymbol, mapHyperliquidOrderType, toIsoTimestamp, toNumber } from "../utils";

type HyperliquidClearinghouseState = {
  marginSummary?: { accountValue?: string; totalMarginUsed?: string };
  assetPositions?: Array<{ position?: HyperliquidPosition; coin?: string; szi?: string }>;
};

type HyperliquidPosition = {
  coin?: string;
  szi?: string;
  entryPx?: string;
  markPx?: string;
  liquidationPx?: string;
  unrealizedPnl?: string;
  leverage?: string;
  positionValue?: string;
};

type HyperliquidBalanceRaw = { clearinghouseState?: HyperliquidClearinghouseState } | HyperliquidClearinghouseState;

function resolveState(raw: HyperliquidBalanceRaw): HyperliquidClearinghouseState | undefined {
  if ((raw as { clearinghouseState?: HyperliquidClearinghouseState }).clearinghouseState) {
    return (raw as { clearinghouseState?: HyperliquidClearinghouseState }).clearinghouseState;
  }
  return raw as HyperliquidClearinghouseState;
}

type HyperliquidOrdersRaw = Array<{
  oid?: string | number;
  coin?: string;
  side?: string;
  orderType?: string;
  limitPx?: string;
  px?: string;
  sz?: string;
  filledSz?: string;
  timestamp?: number | string;
  time?: number | string;
}>;

export function normalizeHyperliquidBalance(raw: HyperliquidBalanceRaw): NormalizedBalance {
  const state = resolveState(raw);
  const summary = state?.marginSummary;
  const accountValue = toNumber(summary?.accountValue);
  const used = toNumber(summary?.totalMarginUsed);

  return {
    exchange: "hyperliquid",
    accountType: "swap",
    marginCcy: "USDC",
    settleCcy: "USDC",
    timestamp: new Date().toISOString(),
    assets: [
      {
        ccy: "USDC",
        free: accountValue,
        used,
        total: accountValue
      }
    ]
  };
}

export function normalizeHyperliquidPositions(raw: HyperliquidBalanceRaw): NormalizedPositions {
  const state = resolveState(raw);
  const positionsRaw = state?.assetPositions ?? [];
  const positions = positionsRaw.map((item) => {
    const position = item.position ?? (item as unknown as HyperliquidPosition);
    const sizeValue = toNumber(position?.szi ?? item.szi);
    const side: "long" | "short" = sizeValue >= 0 ? "long" : "short";
    const coin = position?.coin ?? item.coin ?? "";

    return {
      instId: coin,
      symbol: hyperliquidCoinToSymbol(coin),
      side,
      size: Math.abs(sizeValue),
      entryPrice: toNumber(position?.entryPx),
      markPrice: position?.markPx !== undefined ? toNumber(position?.markPx) : undefined,
      liqPrice: position?.liquidationPx !== undefined ? toNumber(position?.liquidationPx) : undefined,
      unrealizedPnl: position?.unrealizedPnl !== undefined ? toNumber(position?.unrealizedPnl) : undefined,
      leverage: position?.leverage !== undefined ? toNumber(position?.leverage) : undefined,
      marginMode: "cross" as const,
      notional: position?.positionValue !== undefined ? toNumber(position?.positionValue) : undefined
    };
  });

  return {
    exchange: "hyperliquid",
    accountType: "swap",
    marginCcy: "USDC",
    settleCcy: "USDC",
    timestamp: new Date().toISOString(),
    positions
  };
}

function normalizeHyperliquidOrders(raw: HyperliquidOrdersRaw) {
  return (raw ?? []).map((order) => {
    const coin = order.coin ?? "";
    const side: "buy" | "sell" = order.side === "sell" ? "sell" : "buy";
    return {
      orderId: String(order.oid ?? ""),
      instId: coin,
      symbol: hyperliquidCoinToSymbol(coin),
      side,
      type: mapHyperliquidOrderType(order.orderType ?? "limit"),
      price: order.limitPx !== undefined ? toNumber(order.limitPx) : order.px !== undefined ? toNumber(order.px) : undefined,
      size: toNumber(order.sz),
      filled: order.filledSz !== undefined ? toNumber(order.filledSz) : undefined,
      status: "open" as const,
      createTime: toIsoTimestamp(order.timestamp ?? order.time)
    };
  });
}

export function normalizeHyperliquidPendingOrders(raw: HyperliquidOrdersRaw): NormalizedPendingOrders {
  const orders = normalizeHyperliquidOrders(raw);
  const timestamp = orders[0]?.createTime ?? new Date().toISOString();

  return {
    exchange: "hyperliquid",
    accountType: "swap",
    marginCcy: "USDC",
    settleCcy: "USDC",
    timestamp,
    orders
  };
}

export function normalizeHyperliquidHistoryOrders(raw: HyperliquidOrdersRaw): NormalizedHistoryOrders {
  const orders = (raw ?? []).map((fill) => {
    const coin = fill.coin ?? "";
    const side: "buy" | "sell" = fill.side === "sell" ? "sell" : "buy";
    return {
      orderId: String(fill.oid ?? ""),
      instId: coin,
      symbol: hyperliquidCoinToSymbol(coin),
      side,
      type: mapHyperliquidOrderType(fill.orderType ?? "limit"),
      price: fill.px !== undefined ? toNumber(fill.px) : undefined,
      size: toNumber(fill.sz),
      filled: toNumber(fill.sz),
      status: "closed" as const,
      createTime: toIsoTimestamp(fill.time ?? fill.timestamp)
    };
  });
  const timestamp = orders[0]?.createTime ?? new Date().toISOString();

  return {
    exchange: "hyperliquid",
    accountType: "swap",
    marginCcy: "USDC",
    settleCcy: "USDC",
    timestamp,
    orders
  };
}
