import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHttpServer } from "../src/http/server";
import { createToolDispatcher } from "../src/server";
import { createFetchClient } from "@rubick-trading-mcp/core-utils";
import type http from "node:http";

const PROTOCOL_VERSION = "2025-11-25";
const ACCEPT_HEADER = "application/json, text/event-stream";

const hasOkxEnv = Boolean(
  process.env.OKX_API_KEY && process.env.OKX_API_SECRET && process.env.OKX_API_PASSPHRASE
);
const hasBinanceEnv = Boolean(process.env.BINANCE_API_KEY && process.env.BINANCE_API_SECRET);
const hasHyperliquidEnv = Boolean(process.env.HYPERLIQUID_USER);
const hasAnyEnv = hasOkxEnv || hasBinanceEnv || hasHyperliquidEnv;

const describeMcp = hasAnyEnv ? describe : describe.skip;
const describeOkx = hasOkxEnv ? describe : describe.skip;
const describeBinance = hasBinanceEnv ? describe : describe.skip;
const describeHyperliquid = hasHyperliquidEnv ? describe : describe.skip;

async function readJson(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

function expectAccountNormalized(tool: string, result: Record<string, any>, exchange: string) {
  const normalized = result?.structuredContent;
  expect(normalized).toBeTruthy();
  expect(normalized.exchange).toBe(exchange);
  expect(typeof normalized.timestamp).toBe("string");
  if (tool === "get_balance") {
    expect(Array.isArray(normalized.assets)).toBe(true);
  } else if (tool === "get_positions") {
    expect(Array.isArray(normalized.positions)).toBe(true);
  } else {
    expect(Array.isArray(normalized.orders)).toBe(true);
  }
}

function expectMarketNormalized(tool: string, result: Record<string, any>) {
  const normalized = result?.structuredContent;
  expect(normalized).toBeTruthy();
  expect(normalized.exchange).toBe("okx");
  expect(typeof normalized.instId).toBe("string");
  expect(typeof normalized.symbol).toBe("string");
  expect(typeof normalized.timestamp).toBe("string");
  if (tool === "get_ticker") {
    expect(typeof normalized.last).toBe("number");
  } else if (tool === "get_candles") {
    expect(Array.isArray(normalized.candles)).toBe(true);
  } else if (tool === "get_order_book") {
    expect(Array.isArray(normalized.bids)).toBe(true);
    expect(Array.isArray(normalized.asks)).toBe(true);
  } else if (tool === "get_funding_rate") {
    expect(typeof normalized.fundingRate).toBe("number");
  } else if (tool === "get_open_interest") {
    expect(typeof normalized.openInterest).toBe("number");
  }
}

async function callTool(baseUrl: string, name: string, args: Record<string, unknown>) {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Accept: ACCEPT_HEADER,
      "Content-Type": "application/json",
      "MCP-Protocol-Version": PROTOCOL_VERSION
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `call_${name}_${Math.random().toString(36).slice(2, 6)}`,
      method: "tools/call",
      params: {
        name,
        arguments: args
      }
    })
  });
  const payload = await readJson(response);
  return { response, payload };
}

describeMcp("mcp http integration", () => {
  let server: http.Server;
  let baseUrl = "";

  beforeAll(async () => {
    const okxClient = createFetchClient({ timeoutMs: 30000 });
    const binanceClient = createFetchClient({ timeoutMs: 30000 });
    const hyperliquidClient = createFetchClient({ timeoutMs: 30000 });

    const dispatch = createToolDispatcher({
      okx: {
        client: okxClient,
        credentials: {
          apiKey: process.env.OKX_API_KEY ?? "",
          apiSecret: process.env.OKX_API_SECRET ?? "",
          passphrase: process.env.OKX_API_PASSPHRASE ?? ""
        }
      },
      binance: {
        client: binanceClient,
        credentials: {
          apiKey: process.env.BINANCE_API_KEY ?? "",
          apiSecret: process.env.BINANCE_API_SECRET ?? ""
        }
      },
      hyperliquid: {
        client: hyperliquidClient
      }
    });

    server = createHttpServer({ dispatch });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("failed to bind http server");
    }
    baseUrl = `http://127.0.0.1:${address.port}/mcp`;
  }, 20000);

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("supports SSE handshake", async () => {
    const response = await fetch(baseUrl, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        "MCP-Protocol-Version": PROTOCOL_VERSION
      }
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
  });

  it("initialize + tools/list", async () => {
    const init = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Accept: ACCEPT_HEADER,
        "Content-Type": "application/json",
        "MCP-Protocol-Version": PROTOCOL_VERSION
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: PROTOCOL_VERSION
        }
      })
    });
    const initPayload = await readJson(init);
    expect(init.status).toBe(200);
    expect(initPayload.result?.protocolVersion).toBe(PROTOCOL_VERSION);

    const list = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Accept: ACCEPT_HEADER,
        "Content-Type": "application/json",
        "MCP-Protocol-Version": PROTOCOL_VERSION
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list"
      })
    });
    const listPayload = await readJson(list);
    expect(list.status).toBe(200);
    expect(Array.isArray(listPayload.result?.tools)).toBe(true);
  });

  describeOkx("okx tools/call", () => {
    const instId = process.env.OKX_INST_ID ?? "BTC-USDT-SWAP";
    const instType = process.env.OKX_INST_TYPE ?? "SWAP";

    it(
      "fetches account tools",
      async () => {
        const tools = ["get_balance", "get_positions", "get_pending_orders", "get_history_orders"] as const;
        for (const tool of tools) {
          const { response, payload } = await callTool(baseUrl, tool, {
            exchange: "okx",
            instId,
            extra: tool.includes("orders") ? { instType } : undefined
          });
          expect(response.status).toBe(200);
          expect(payload.result?.isError).toBe(false);
          expectAccountNormalized(tool, payload.result, "okx");
        }
      },
    45000
  );

    it(
      "fetches market tools",
      async () => {
        const calls = [
          { name: "get_ticker", arguments: { exchange: "okx", instId } },
          { name: "get_candles", arguments: { exchange: "okx", instId, bar: "1m", limit: 5 } },
          { name: "get_order_book", arguments: { exchange: "okx", instId, depth: 5 } },
          { name: "get_funding_rate", arguments: { exchange: "okx", instId } },
          { name: "get_open_interest", arguments: { exchange: "okx", instId } }
        ];

        for (const call of calls) {
          const { response, payload } = await callTool(baseUrl, call.name, call.arguments);
          expect(response.status).toBe(200);
          expect(payload.result?.isError).toBe(false);
          expectMarketNormalized(call.name, payload.result);
        }
      },
    45000
  );
  });

  describeBinance("binance tools/call", () => {
    const symbol = process.env.BINANCE_SYMBOL ?? "BTC/USDT";

    it(
      "fetches account tools",
      async () => {
        const tools = ["get_balance", "get_positions", "get_pending_orders", "get_history_orders"] as const;
        for (const tool of tools) {
          const { response, payload } = await callTool(baseUrl, tool, { exchange: "binance", symbol });
          expect(response.status).toBe(200);
          expect(payload.result?.isError).toBe(false);
          expectAccountNormalized(tool, payload.result, "binance");
        }
      },
      30000
    );
  });

  describeHyperliquid("hyperliquid tools/call", () => {
    it(
      "fetches account tools",
      async () => {
        const tools = ["get_balance", "get_positions", "get_pending_orders", "get_history_orders"] as const;
        for (const tool of tools) {
          const { response, payload } = await callTool(baseUrl, tool, {
            exchange: "hyperliquid",
            extra: {
              user: process.env.HYPERLIQUID_USER
            }
          });
          expect(response.status).toBe(200);
          expect(payload.result?.isError).toBe(false);
          expectAccountNormalized(tool, payload.result, "hyperliquid");
        }
      },
    45000
  );
  });

  it("rejects invalid account inputs", async () => {
    const cases = [
      {
        name: "get_history_orders",
        arguments: { exchange: "binance" },
        message: "binance get_history_orders requires symbol"
      },
      {
        name: "get_balance",
        arguments: { exchange: "hyperliquid" },
        message: "hyperliquid requires extra.user"
      },
      {
        name: "get_positions",
        arguments: { exchange: "okx", since: 2, end: 1 },
        message: "since must be <= end"
      },
      {
        name: "get_pending_orders",
        arguments: { exchange: "okx", limit: 0 },
        message: "limit must be > 0"
      },
      {
        name: "get_balance",
        arguments: { exchange: "okx", marginCcy: "USD" },
        message: "input schema validation failed"
      }
    ];

    for (const testCase of cases) {
      const { response, payload } = await callTool(baseUrl, testCase.name, testCase.arguments);
      expect(response.status).toBe(200);
      expect(payload.result?.isError).toBe(true);
      expect(payload.result?.content?.[0]?.text).toContain(testCase.message);
    }
  });

  it("rejects invalid market inputs", async () => {
    const cases = [
      {
        name: "get_ticker",
        arguments: { exchange: "binance", symbol: "BTC/USDT" },
        message: "input schema validation failed"
      },
      {
        name: "get_ticker",
        arguments: { exchange: "okx" },
        message: "input schema validation failed"
      },
      {
        name: "get_candles",
        arguments: { exchange: "okx", instId: "BTC-USDT-SWAP", limit: 0 },
        message: "limit must be > 0"
      },
      {
        name: "get_order_book",
        arguments: { exchange: "okx", instId: "BTC-USDT-SWAP", depth: 0 },
        message: "depth must be > 0"
      }
    ];

    for (const testCase of cases) {
      const { response, payload } = await callTool(baseUrl, testCase.name, testCase.arguments);
      expect(response.status).toBe(200);
      expect(payload.result?.isError).toBe(true);
      expect(payload.result?.content?.[0]?.text).toContain(testCase.message);
    }
  });
});
