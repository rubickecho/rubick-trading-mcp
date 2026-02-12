export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export function toIsoTimestamp(value?: string | number | null): string {
  if (value === null || value === undefined) {
    return new Date().toISOString();
  }
  const asNumber = Number(value);
  if (!Number.isNaN(asNumber) && String(asNumber) === String(value)) {
    return new Date(asNumber).toISOString();
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return new Date().toISOString();
}

export function okxInstIdToSymbol(instId: string): string {
  const parts = instId.split("-");
  if (parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return instId;
}

const BINANCE_QUOTES = ["USDT", "USDC"];

export function binanceSymbolToUnified(symbol: string): string {
  for (const quote of BINANCE_QUOTES) {
    if (symbol.endsWith(quote)) {
      const base = symbol.slice(0, -quote.length);
      return `${base}/${quote}`;
    }
  }
  return symbol;
}

export function hyperliquidCoinToSymbol(coin: string, quote = "USDC"): string {
  return `${coin}/${quote}`;
}

export function mapOkxOrderType(ordType: string): "limit" | "market" | "post_only" | "ioc" | "fok" {
  const type = ordType.toLowerCase();
  if (type.includes("post")) {
    return "post_only";
  }
  if (type === "market") {
    return "market";
  }
  if (type === "fok") {
    return "fok";
  }
  if (type.includes("ioc")) {
    return "ioc";
  }
  return "limit";
}

export function mapBinanceOrderType(type: string): "limit" | "market" | "post_only" | "ioc" | "fok" {
  const upper = type.toUpperCase();
  if (upper === "MARKET") {
    return "market";
  }
  if (upper === "LIMIT_MAKER") {
    return "post_only";
  }
  if (upper.includes("IOC")) {
    return "ioc";
  }
  if (upper.includes("FOK")) {
    return "fok";
  }
  return "limit";
}

export function mapOkxOrderStatus(state: string): "open" | "closed" | "canceled" {
  const lower = state.toLowerCase();
  if (lower.includes("cancel")) {
    return "canceled";
  }
  if (lower.includes("filled")) {
    return "closed";
  }
  if (lower.includes("live") || lower.includes("part")) {
    return "open";
  }
  return "open";
}

export function mapBinanceOrderStatus(status: string): "open" | "closed" | "canceled" {
  const upper = status.toUpperCase();
  if (upper === "FILLED") {
    return "closed";
  }
  if (upper === "CANCELED" || upper === "EXPIRED" || upper === "REJECTED") {
    return "canceled";
  }
  return "open";
}

export function mapHyperliquidOrderType(type: string): "limit" | "market" | "post_only" | "ioc" | "fok" {
  const lower = type.toLowerCase();
  if (lower.includes("market")) {
    return "market";
  }
  if (lower.includes("post")) {
    return "post_only";
  }
  if (lower.includes("ioc")) {
    return "ioc";
  }
  if (lower.includes("fok")) {
    return "fok";
  }
  return "limit";
}

export function pickStableCcy(values: Array<string | undefined | null>): "USDT" | "USDC" {
  for (const value of values) {
    if (value === "USDT" || value === "USDC") {
      return value;
    }
  }
  return "USDT";
}
