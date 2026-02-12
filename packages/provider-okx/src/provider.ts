import { buildOkxHeaders, HttpClient, HttpError, OkxCredentials } from "@rubick-trading-mcp/core-utils";
import type { AccountToolParams, MarketToolParams } from "./types";

const DEFAULT_BASE_URL = "https://www.okx.com";

export type OkxProviderOptions = {
  client: HttpClient;
  credentials: OkxCredentials;
  baseUrl?: string;
};

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }
    search.append(key, String(value));
  }
  return search.toString();
}

function buildRequestPath(path: string, params?: Record<string, string | number | undefined>): string {
  if (!params) {
    return path;
  }
  const qs = buildQueryString(params);
  return qs ? `${path}?${qs}` : path;
}

function getCcyFromSymbol(symbol?: string): string | undefined {
  if (!symbol) {
    return undefined;
  }
  if (symbol.includes("/")) {
    return symbol.split("/")[1];
  }
  if (symbol === "USDT" || symbol === "USDC") {
    return symbol;
  }
  return undefined;
}

function getBalanceQuery(params: AccountToolParams): Record<string, string | number | undefined> {
  const ccy = getCcyFromSymbol(params.symbol) ?? getCcyFromSymbol(params.instId);
  return ccy ? { ccy } : {};
}

async function okxGet<T>(options: OkxProviderOptions, path: string, query?: Record<string, string | number | undefined>): Promise<T> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const requestPath = buildRequestPath(path, query);
  const timestamp = new Date().toISOString();
  const headers = buildOkxHeaders({
    credentials: options.credentials,
    timestamp,
    method: "GET",
    requestPath
  });

  const response = await options.client.request<T>({
    method: "GET",
    url: `${baseUrl}${requestPath}`,
    headers
  });

  if (response.status >= 400) {
    throw new HttpError(`OKX request failed with status ${response.status}`, {
      status: response.status,
      body: response.rawBody,
      headers: response.headers
    });
  }

  return response.data;
}

async function okxPublicGet<T>(options: OkxProviderOptions, path: string, query?: Record<string, string | number | undefined>): Promise<T> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const requestPath = buildRequestPath(path, query);
  const response = await options.client.request<T>({
    method: "GET",
    url: `${baseUrl}${requestPath}`
  });

  if (response.status >= 400) {
    throw new HttpError(`OKX request failed with status ${response.status}`, {
      status: response.status,
      body: response.rawBody,
      headers: response.headers
    });
  }

  return response.data;
}

function resolveInstId(params: MarketToolParams): string {
  const instId = params.instId ?? params.symbol;
  if (!instId) {
    throw new Error("instId or symbol is required");
  }
  return instId;
}

export async function getBalance(options: OkxProviderOptions, params: AccountToolParams = {}) {
  return okxGet(options, "/api/v5/account/balance", getBalanceQuery(params));
}

export async function getPositions(options: OkxProviderOptions, params: AccountToolParams = {}) {
  const query: Record<string, string | number | undefined> = {};
  if (params.instId) {
    query.instId = params.instId;
  }
  return okxGet(options, "/api/v5/account/positions", query);
}

export async function getPendingOrders(options: OkxProviderOptions, params: AccountToolParams = {}) {
  const query: Record<string, string | number | undefined> = {};
  if (params.instId) {
    query.instId = params.instId;
  }
  return okxGet(options, "/api/v5/trade/orders-pending", query);
}

export async function getHistoryOrders(options: OkxProviderOptions, params: AccountToolParams = {}) {
  const query: Record<string, string | number | undefined> = {};
  if (params.instId) {
    query.instId = params.instId;
  }
  if (params.since) {
    query.begin = params.since;
  }
  if (params.end) {
    query.end = params.end;
  }
  if (params.limit) {
    query.limit = params.limit;
  }
  if (params.cursor) {
    query.before = params.cursor;
  }
  return okxGet(options, "/api/v5/trade/orders-history", query);
}

export async function getTicker(options: OkxProviderOptions, params: MarketToolParams = {}) {
  const instId = resolveInstId(params);
  return okxPublicGet(options, "/api/v5/market/ticker", { instId });
}

export async function getCandles(options: OkxProviderOptions, params: MarketToolParams = {}) {
  const instId = resolveInstId(params);
  const query: Record<string, string | number | undefined> = { instId };
  if (params.bar) {
    query.bar = params.bar;
  }
  if (params.limit) {
    query.limit = params.limit;
  }
  return okxPublicGet(options, "/api/v5/market/candles", query);
}

export async function getOrderBook(options: OkxProviderOptions, params: MarketToolParams = {}) {
  const instId = resolveInstId(params);
  const query: Record<string, string | number | undefined> = { instId };
  if (params.depth) {
    query.sz = params.depth;
  }
  return okxPublicGet(options, "/api/v5/market/books", query);
}

export async function getFundingRate(options: OkxProviderOptions, params: MarketToolParams = {}) {
  const instId = resolveInstId(params);
  return okxPublicGet(options, "/api/v5/public/funding-rate", { instId });
}

export async function getOpenInterest(options: OkxProviderOptions, params: MarketToolParams = {}) {
  const instId = resolveInstId(params);
  return okxPublicGet(options, "/api/v5/public/open-interest", { instType: "SWAP", instId });
}
