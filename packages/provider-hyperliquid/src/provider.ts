import { HttpClient, HttpError } from "@rubick-trading-mcp/core-utils";
import type { AccountToolParams } from "./types";

const DEFAULT_BASE_URL = "https://api.hyperliquid.xyz";

export type HyperliquidProviderOptions = {
  client: HttpClient;
  baseUrl?: string;
};

function getUser(params: AccountToolParams): string {
  const user = params.extra?.user;
  if (typeof user !== "string" || user.length === 0) {
    throw new Error("Hyperliquid requires extra.user address");
  }
  return user;
}

async function hyperliquidPost<T>(options: HyperliquidProviderOptions, body: Record<string, unknown>) {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const url = `${baseUrl}/info`;
  const payload = JSON.stringify(body);

  const response = await options.client.request<T>({
    method: "POST",
    url,
    headers: {
      "Content-Type": "application/json"
    },
    body: payload
  });

  if (response.status >= 400) {
    throw new HttpError(`Hyperliquid request failed with status ${response.status}`, {
      status: response.status,
      body: response.rawBody,
      headers: response.headers
    });
  }

  return response.data;
}

export async function getBalance(options: HyperliquidProviderOptions, params: AccountToolParams = {}) {
  const user = getUser(params);
  return hyperliquidPost(options, { type: "clearinghouseState", user });
}

export async function getPositions(options: HyperliquidProviderOptions, params: AccountToolParams = {}) {
  const user = getUser(params);
  return hyperliquidPost(options, { type: "clearinghouseState", user });
}

export async function getPendingOrders(options: HyperliquidProviderOptions, params: AccountToolParams = {}) {
  const user = getUser(params);
  return hyperliquidPost(options, { type: "openOrders", user });
}

export async function getHistoryOrders(options: HyperliquidProviderOptions, params: AccountToolParams = {}) {
  const user = getUser(params);
  if (params.since || params.end) {
    return hyperliquidPost(options, {
      type: "userFillsByTime",
      user,
      startTime: params.since,
      endTime: params.end,
      limit: params.limit
    });
  }
  return hyperliquidPost(options, { type: "userFills", user });
}
