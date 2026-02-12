import type { NormalizedBalance, NormalizedHistoryOrders, NormalizedPendingOrders, NormalizedPositions } from "../../account/schema";
import {
  binanceSymbolToUnified,
  mapBinanceOrderStatus,
  mapBinanceOrderType,
  pickStableCcy,
  toIsoTimestamp,
  toNumber
} from "../utils";

type BinanceBalanceRaw = Array<{
  asset?: string;
  availableBalance?: string;
  balance?: string;
}>;

type BinancePositionsRaw = Array<{
  symbol?: string;
  positionAmt?: string;
  entryPrice?: string;
  markPrice?: string;
  liquidationPrice?: string;
  unRealizedProfit?: string;
  leverage?: string;
  marginType?: string;
  notional?: string;
}>;

type BinanceOrdersRaw = Array<{
  orderId?: number | string;
  symbol?: string;
  side?: string;
  type?: string;
  price?: string;
  origQty?: string;
  executedQty?: string;
  status?: string;
  time?: number | string;
  updateTime?: number | string;
}>;

export function normalizeBinanceBalance(raw: BinanceBalanceRaw): NormalizedBalance {
  const assets = (raw ?? []).map((item) => {
    const free = toNumber(item.availableBalance);
    const total = toNumber(item.balance);
    return {
      ccy: item.asset ?? "",
      free,
      used: Math.max(total - free, 0),
      total
    };
  });
  const marginCcy = pickStableCcy(raw.map((item) => item.asset));

  return {
    exchange: "binance",
    accountType: "swap",
    marginCcy,
    settleCcy: marginCcy,
    timestamp: new Date().toISOString(),
    assets
  };
}

export function normalizeBinancePositions(raw: BinancePositionsRaw): NormalizedPositions {
  const positions = (raw ?? []).map((item) => {
    const positionAmt = toNumber(item.positionAmt);
    const side: "long" | "short" = positionAmt >= 0 ? "long" : "short";
    const marginMode: "cross" | "isolated" | undefined =
      item.marginType === "cross" || item.marginType === "isolated" ? item.marginType : undefined;
    const instId = item.symbol ?? "";
    return {
      instId,
      symbol: binanceSymbolToUnified(instId),
      side,
      size: Math.abs(positionAmt),
      entryPrice: toNumber(item.entryPrice),
      markPrice: item.markPrice !== undefined ? toNumber(item.markPrice) : undefined,
      liqPrice: item.liquidationPrice !== undefined ? toNumber(item.liquidationPrice) : undefined,
      unrealizedPnl: item.unRealizedProfit !== undefined ? toNumber(item.unRealizedProfit) : undefined,
      leverage: item.leverage !== undefined ? toNumber(item.leverage) : undefined,
      marginMode,
      notional: item.notional !== undefined ? toNumber(item.notional) : undefined
    };
  });

  return {
    exchange: "binance",
    accountType: "swap",
    marginCcy: "USDT",
    settleCcy: "USDT",
    timestamp: new Date().toISOString(),
    positions
  };
}

function normalizeBinanceOrders(raw: BinanceOrdersRaw) {
  return (raw ?? []).map((order) => {
    const instId = order.symbol ?? "";
    const side: "buy" | "sell" = order.side === "SELL" || order.side === "sell" ? "sell" : "buy";
    return {
      orderId: String(order.orderId ?? ""),
      instId,
      symbol: binanceSymbolToUnified(instId),
      side,
      type: mapBinanceOrderType(order.type ?? "LIMIT"),
      price: order.price !== undefined ? toNumber(order.price) : undefined,
      size: toNumber(order.origQty),
      filled: order.executedQty !== undefined ? toNumber(order.executedQty) : undefined,
      status: mapBinanceOrderStatus(order.status ?? ""),
      createTime: toIsoTimestamp(order.time),
      updateTime: order.updateTime ? toIsoTimestamp(order.updateTime) : undefined
    };
  });
}

export function normalizeBinancePendingOrders(raw: BinanceOrdersRaw): NormalizedPendingOrders {
  const orders = normalizeBinanceOrders(raw);
  const timestamp = orders[0]?.updateTime ?? orders[0]?.createTime ?? new Date().toISOString();

  return {
    exchange: "binance",
    accountType: "swap",
    marginCcy: "USDT",
    settleCcy: "USDT",
    timestamp,
    orders
  };
}

export function normalizeBinanceHistoryOrders(raw: BinanceOrdersRaw): NormalizedHistoryOrders {
  const orders = normalizeBinanceOrders(raw);
  const timestamp = orders[0]?.updateTime ?? orders[0]?.createTime ?? new Date().toISOString();

  return {
    exchange: "binance",
    accountType: "swap",
    marginCcy: "USDT",
    settleCcy: "USDT",
    timestamp,
    orders
  };
}
