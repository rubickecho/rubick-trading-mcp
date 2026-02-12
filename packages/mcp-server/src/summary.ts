import type { AccountToolName, MarketToolName } from "./types";

function formatNumber(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) {
    return "n/a";
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(6);
}

export function buildAccountSummary(tool: AccountToolName, normalized: any): string {
  switch (tool) {
    case "get_balance": {
      const assets = normalized?.assets ?? [];
      const count = Array.isArray(assets) ? assets.length : 0;
      const total = assets
        .filter((asset: any) => asset?.ccy === "USDT" || asset?.ccy === "USDC")
        .reduce((acc: number, asset: any) => acc + (Number(asset?.total) || 0), 0);
      return `balance assets=${count}, stableTotal=${formatNumber(total)}`;
    }
    case "get_positions": {
      const positions = normalized?.positions ?? [];
      const count = Array.isArray(positions) ? positions.length : 0;
      const longs = positions.filter((pos: any) => pos?.side === "long").length;
      const shorts = positions.filter((pos: any) => pos?.side === "short").length;
      return `positions=${count}, long=${longs}, short=${shorts}`;
    }
    case "get_pending_orders": {
      const orders = normalized?.orders ?? [];
      const count = Array.isArray(orders) ? orders.length : 0;
      return `pending orders=${count}`;
    }
    case "get_history_orders": {
      const orders = normalized?.orders ?? [];
      const count = Array.isArray(orders) ? orders.length : 0;
      return `history orders=${count}`;
    }
    default:
      return "ok";
  }
}

export function buildMarketSummary(tool: MarketToolName, normalized: any): string {
  switch (tool) {
    case "get_ticker": {
      return `ticker last=${formatNumber(normalized?.last)} bid=${formatNumber(normalized?.bid)} ask=${formatNumber(
        normalized?.ask
      )}`;
    }
    case "get_candles": {
      const candles = normalized?.candles ?? [];
      const count = Array.isArray(candles) ? candles.length : 0;
      return `candles count=${count}`;
    }
    case "get_order_book": {
      const bids = normalized?.bids ?? [];
      const asks = normalized?.asks ?? [];
      const depth = normalized?.depth;
      return `order_book bids=${bids.length} asks=${asks.length} depth=${formatNumber(depth)}`;
    }
    case "get_funding_rate": {
      return `funding_rate=${formatNumber(normalized?.fundingRate)}`;
    }
    case "get_open_interest": {
      return `open_interest=${formatNumber(normalized?.openInterest)}`;
    }
    default:
      return "ok";
  }
}
