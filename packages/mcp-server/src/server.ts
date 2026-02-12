import {
  createFetchClient,
  HttpClient,
  OkxCredentials,
  BinanceCredentials
} from "@rubick-trading-mcp/core-utils";
import * as okxProvider from "@rubick-trading-mcp/provider-okx";
import * as binanceProvider from "@rubick-trading-mcp/provider-binance";
import * as hyperliquidProvider from "@rubick-trading-mcp/provider-hyperliquid";
import type { AccountToolInput, AccountToolName, MarketToolInput, MarketToolName, McpResponse } from "./types";
import { handleAccountTool, handleMarketTool } from "./router";

export type OkxConfig = {
  credentials: OkxCredentials;
  client?: HttpClient;
  baseUrl?: string;
};

export type BinanceConfig = {
  credentials: BinanceCredentials;
  client?: HttpClient;
  baseUrl?: string;
};

export type HyperliquidConfig = {
  client?: HttpClient;
  baseUrl?: string;
};

export type ServerConfig = {
  okx: OkxConfig;
  binance: BinanceConfig;
  hyperliquid: HyperliquidConfig;
};

const accountTools: AccountToolName[] = [
  "get_balance",
  "get_positions",
  "get_pending_orders",
  "get_history_orders"
];

const marketTools: MarketToolName[] = [
  "get_ticker",
  "get_candles",
  "get_order_book",
  "get_funding_rate",
  "get_open_interest"
];

function isAccountTool(name: string): name is AccountToolName {
  return (accountTools as string[]).includes(name);
}

function isMarketTool(name: string): name is MarketToolName {
  return (marketTools as string[]).includes(name);
}

function errorResponse(message: string): McpResponse<null> {
  return {
    content: [{ type: "text", text: message }],
    structuredContent: null,
    outputSchema: null,
    isError: true
  };
}

export function createToolDispatcher(config: ServerConfig) {
  const okxClient = config.okx.client ?? createFetchClient();
  const binanceClient = config.binance.client ?? createFetchClient();
  const hyperliquidClient = config.hyperliquid.client ?? createFetchClient();

  const okxOptions: okxProvider.OkxProviderOptions = {
    client: okxClient,
    credentials: config.okx.credentials,
    baseUrl: config.okx.baseUrl
  };

  const binanceOptions: binanceProvider.BinanceProviderOptions = {
    client: binanceClient,
    credentials: config.binance.credentials,
    baseUrl: config.binance.baseUrl
  };

  const hyperliquidOptions: hyperliquidProvider.HyperliquidProviderOptions = {
    client: hyperliquidClient,
    baseUrl: config.hyperliquid.baseUrl
  };

  const accountProviders = {
    okx: {
      getBalance: (input: AccountToolInput) => okxProvider.getBalance(okxOptions, input),
      getPositions: (input: AccountToolInput) => okxProvider.getPositions(okxOptions, input),
      getPendingOrders: (input: AccountToolInput) => okxProvider.getPendingOrders(okxOptions, input),
      getHistoryOrders: (input: AccountToolInput) => okxProvider.getHistoryOrders(okxOptions, input)
    },
    binance: {
      getBalance: (input: AccountToolInput) => binanceProvider.getBalance(binanceOptions, input),
      getPositions: (input: AccountToolInput) => binanceProvider.getPositions(binanceOptions, input),
      getPendingOrders: (input: AccountToolInput) => binanceProvider.getPendingOrders(binanceOptions, input),
      getHistoryOrders: (input: AccountToolInput) => binanceProvider.getHistoryOrders(binanceOptions, input)
    },
    hyperliquid: {
      getBalance: (input: AccountToolInput) => hyperliquidProvider.getBalance(hyperliquidOptions, input),
      getPositions: (input: AccountToolInput) => hyperliquidProvider.getPositions(hyperliquidOptions, input),
      getPendingOrders: (input: AccountToolInput) => hyperliquidProvider.getPendingOrders(hyperliquidOptions, input),
      getHistoryOrders: (input: AccountToolInput) => hyperliquidProvider.getHistoryOrders(hyperliquidOptions, input)
    }
  };

  const marketProvider = {
    getTicker: (input: MarketToolInput) => okxProvider.getTicker(okxOptions, input),
    getCandles: (input: MarketToolInput) => okxProvider.getCandles(okxOptions, input),
    getOrderBook: (input: MarketToolInput) => okxProvider.getOrderBook(okxOptions, input),
    getFundingRate: (input: MarketToolInput) => okxProvider.getFundingRate(okxOptions, input),
    getOpenInterest: (input: MarketToolInput) => okxProvider.getOpenInterest(okxOptions, input)
  };

  return async function dispatch(toolName: string, input: AccountToolInput | MarketToolInput): Promise<McpResponse<unknown>> {
    if (isAccountTool(toolName)) {
      return handleAccountTool(toolName, input as AccountToolInput, accountProviders);
    }
    if (isMarketTool(toolName)) {
      return handleMarketTool(toolName, input as MarketToolInput, marketProvider);
    }
    return errorResponse(`unknown tool: ${toolName}`);
  };
}
