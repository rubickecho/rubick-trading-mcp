import type { NormalizedBalance, NormalizedHistoryOrders, NormalizedPendingOrders, NormalizedPositions } from "../../account/schema";
import {
  mapOkxOrderStatus,
  mapOkxOrderType,
  okxInstIdToSymbol,
  pickStableCcy,
  toIsoTimestamp,
  toNumber
} from "../utils";

type OkxBalanceRaw = {
  data?: Array<{ details?: Array<{ ccy?: string; availEq?: string; frozenBal?: string; eq?: string; usdEq?: string }>; uTime?: string }>;
};

type OkxPositionsRaw = {
  data?: Array<{
    instId?: string;
    posSide?: string;
    pos?: string;
    avgPx?: string;
    markPx?: string;
    liqPx?: string;
    upl?: string;
    lever?: string;
    mgnMode?: string;
    notionalUsd?: string;
    ctValCcy?: string;
    settleCcy?: string;
    uTime?: string;
  }>;
};

type OkxOrdersRaw = {
  data?: Array<{
    ordId?: string;
    instId?: string;
    side?: string;
    ordType?: string;
    px?: string;
    sz?: string;
    fillSz?: string;
    state?: string;
    cTime?: string;
    uTime?: string;
  }>;
};

export function normalizeOkxBalance(raw: OkxBalanceRaw): NormalizedBalance {
  const details = raw.data?.flatMap((item) => item.details ?? []) ?? [];
  const assets = details.map((detail) => {
    const free = toNumber(detail.availEq);
    const total = toNumber(detail.eq);
    const frozen = detail.frozenBal !== undefined ? toNumber(detail.frozenBal) : Math.max(total - free, 0);
    return {
      ccy: detail.ccy ?? "",
      free,
      used: frozen,
      total,
      usdValue: detail.usdEq !== undefined ? toNumber(detail.usdEq) : undefined
    };
  });
  const timestamp = toIsoTimestamp(raw.data?.[0]?.uTime);
  const marginCcy = pickStableCcy(details.map((detail) => detail.ccy));

  return {
    exchange: "okx",
    accountType: "swap",
    marginCcy,
    settleCcy: marginCcy,
    timestamp,
    assets
  };
}

export function normalizeOkxPositions(raw: OkxPositionsRaw): NormalizedPositions {
  const positionsRaw = raw.data ?? [];
  const positions = positionsRaw.map((position) => {
    const sizeValue = toNumber(position.pos);
    let side: "long" | "short" = "long";
    if (position.posSide === "long" || position.posSide === "short") {
      side = position.posSide;
    } else {
      side = sizeValue >= 0 ? "long" : "short";
    }
    const instId = position.instId ?? "";
    const marginMode: "cross" | "isolated" | undefined =
      position.mgnMode === "cross" || position.mgnMode === "isolated" ? position.mgnMode : undefined;

    return {
      instId,
      symbol: okxInstIdToSymbol(instId),
      side,
      size: Math.abs(sizeValue),
      entryPrice: toNumber(position.avgPx),
      markPrice: position.markPx !== undefined ? toNumber(position.markPx) : undefined,
      liqPrice: position.liqPx !== undefined ? toNumber(position.liqPx) : undefined,
      unrealizedPnl: position.upl !== undefined ? toNumber(position.upl) : undefined,
      leverage: position.lever !== undefined ? toNumber(position.lever) : undefined,
      marginMode,
      notional: position.notionalUsd !== undefined ? toNumber(position.notionalUsd) : undefined
    };
  });

  const marginCcy = pickStableCcy(positionsRaw.map((position) => position.ctValCcy ?? position.settleCcy));
  const timestamp = toIsoTimestamp(positionsRaw[0]?.uTime);

  return {
    exchange: "okx",
    accountType: "swap",
    marginCcy,
    settleCcy: marginCcy,
    timestamp,
    positions
  };
}

function normalizeOkxOrders(raw: OkxOrdersRaw): Array<{
  orderId: string;
  instId: string;
  symbol: string;
  side: "buy" | "sell";
  type: "limit" | "market" | "post_only" | "ioc" | "fok";
  price?: number;
  size: number;
  filled?: number;
  status: "open" | "closed" | "canceled";
  createTime: string;
  updateTime?: string;
}> {
  return (raw.data ?? []).map((order) => {
    const instId = order.instId ?? "";
    const side: "buy" | "sell" = order.side === "sell" ? "sell" : "buy";
    return {
      orderId: order.ordId ?? "",
      instId,
      symbol: okxInstIdToSymbol(instId),
      side,
      type: mapOkxOrderType(order.ordType ?? "limit"),
      price: order.px !== undefined ? toNumber(order.px) : undefined,
      size: toNumber(order.sz),
      filled: order.fillSz !== undefined ? toNumber(order.fillSz) : undefined,
      status: mapOkxOrderStatus(order.state ?? ""),
      createTime: toIsoTimestamp(order.cTime),
      updateTime: order.uTime ? toIsoTimestamp(order.uTime) : undefined
    };
  });
}

export function normalizeOkxPendingOrders(raw: OkxOrdersRaw): NormalizedPendingOrders {
  const orders = normalizeOkxOrders(raw);
  const timestamp = orders[0]?.updateTime ?? orders[0]?.createTime ?? new Date().toISOString();

  return {
    exchange: "okx",
    accountType: "swap",
    marginCcy: pickStableCcy([]),
    settleCcy: pickStableCcy([]),
    timestamp,
    orders
  };
}

export function normalizeOkxHistoryOrders(raw: OkxOrdersRaw): NormalizedHistoryOrders {
  const orders = normalizeOkxOrders(raw);
  const timestamp = orders[0]?.updateTime ?? orders[0]?.createTime ?? new Date().toISOString();

  return {
    exchange: "okx",
    accountType: "swap",
    marginCcy: pickStableCcy([]),
    settleCcy: pickStableCcy([]),
    timestamp,
    orders
  };
}
