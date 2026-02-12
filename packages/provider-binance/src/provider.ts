import { buildBinanceHeaders, HttpClient, HttpError, signBinance, BinanceCredentials } from "@rubick-trading-mcp/core-utils";
import type { AccountToolParams } from "./types";

const DEFAULT_BASE_URL = "https://fapi.binance.com";

export type BinanceProviderOptions = {
  client: HttpClient;
  credentials: BinanceCredentials;
  baseUrl?: string;
};

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  const keys = Object.keys(params).sort();
  for (const key of keys) {
    const value = params[key];
    if (value === undefined) {
      continue;
    }
    search.append(key, String(value));
  }
  return search.toString();
}

async function binanceGet<T>(options: BinanceProviderOptions, path: string, query: Record<string, string | number | undefined>) {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const queryString = buildQueryString(query);
  const signature = signBinance(queryString, options.credentials.apiSecret);
  const signedQuery = `${queryString}&signature=${signature}`;
  const url = `${baseUrl}${path}?${signedQuery}`;
  const headers = buildBinanceHeaders(options.credentials);

  const response = await options.client.request<T>({
    method: "GET",
    url,
    headers
  });

  if (response.status >= 400) {
    throw new HttpError(`Binance request failed with status ${response.status}`, {
      status: response.status,
      body: response.rawBody,
      headers: response.headers
    });
  }

  return response.data;
}

function withTimestamp(params: Record<string, string | number | undefined>, extra?: Record<string, unknown>) {
  const recvWindow = typeof extra?.recvWindow === "number" ? extra?.recvWindow : undefined;
  return {
    ...params,
    recvWindow: recvWindow ?? undefined,
    timestamp: Date.now()
  };
}

export async function getBalance(options: BinanceProviderOptions, params: AccountToolParams = {}) {
  return binanceGet(options, "/fapi/v3/balance", withTimestamp({}, params.extra));
}

export async function getPositions(options: BinanceProviderOptions, params: AccountToolParams = {}) {
  const query: Record<string, string | number | undefined> = {};
  if (params.symbol) {
    query.symbol = params.symbol.replace("/", "");
  }
  return binanceGet(options, "/fapi/v2/positionRisk", withTimestamp(query, params.extra));
}

export async function getPendingOrders(options: BinanceProviderOptions, params: AccountToolParams = {}) {
  const query: Record<string, string | number | undefined> = {};
  if (params.symbol) {
    query.symbol = params.symbol.replace("/", "");
  }
  return binanceGet(options, "/fapi/v1/openOrders", withTimestamp(query, params.extra));
}

export async function getHistoryOrders(options: BinanceProviderOptions, params: AccountToolParams = {}) {
  if (!params.symbol) {
    throw new Error("Binance get_history_orders requires symbol");
  }
  const query: Record<string, string | number | undefined> = {
    symbol: params.symbol.replace("/", "")
  };
  if (params.since) {
    query.startTime = params.since;
  }
  if (params.end) {
    query.endTime = params.end;
  }
  if (params.limit) {
    query.limit = params.limit;
  }
  return binanceGet(options, "/fapi/v1/allOrders", withTimestamp(query, params.extra));
}
