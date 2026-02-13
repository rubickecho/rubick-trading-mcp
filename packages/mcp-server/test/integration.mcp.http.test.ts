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
          const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
              Accept: ACCEPT_HEADER,
              "Content-Type": "application/json",
              "MCP-Protocol-Version": PROTOCOL_VERSION
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: tool,
              method: "tools/call",
              params: {
                name: tool,
                arguments: {
                  exchange: "okx",
                  instId,
                  extra: tool.includes("orders") ? { instType } : undefined
                }
              }
            })
          });
          const payload = await readJson(response);
          expect(response.status).toBe(200);
          expect(payload.result?.isError).toBe(false);
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
          const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
              Accept: ACCEPT_HEADER,
              "Content-Type": "application/json",
              "MCP-Protocol-Version": PROTOCOL_VERSION
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: call.name,
              method: "tools/call",
              params: {
                name: call.name,
                arguments: call.arguments
              }
            })
          });
          const payload = await readJson(response);
          expect(response.status).toBe(200);
          expect(payload.result?.isError).toBe(false);
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
          const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
              Accept: ACCEPT_HEADER,
              "Content-Type": "application/json",
              "MCP-Protocol-Version": PROTOCOL_VERSION
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: `binance_${tool}`,
              method: "tools/call",
              params: {
                name: tool,
                arguments: {
                  exchange: "binance",
                  symbol
                }
              }
            })
          });
          const payload = await readJson(response);
          expect(response.status).toBe(200);
          expect(payload.result?.isError).toBe(false);
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
          const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
              Accept: ACCEPT_HEADER,
              "Content-Type": "application/json",
              "MCP-Protocol-Version": PROTOCOL_VERSION
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: `hl_${tool}`,
              method: "tools/call",
              params: {
                name: tool,
                arguments: {
                  exchange: "hyperliquid",
                  extra: {
                    user: process.env.HYPERLIQUID_USER
                  }
                }
              }
            })
          });
          const payload = await readJson(response);
          expect(response.status).toBe(200);
          expect(payload.result?.isError).toBe(false);
        }
      },
    45000
  );
  });
});
