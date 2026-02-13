import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http/handler";
import { EventEmitter } from "node:events";

const okResponse = {
  content: [{ type: "text", text: "ok" }],
  structuredContent: { raw: {}, normalized: {} },
  outputSchema: {},
  isError: false
};

const ACCEPT_HEADER = "application/json, text/event-stream";
const PROTOCOL_VERSION = "2025-11-25";

function createMockReq(options: { method: string; url: string; body?: string; headers?: Record<string, string> }) {
  const req = new EventEmitter() as EventEmitter & { method: string; url: string; headers: Record<string, string> };
  req.method = options.method;
  req.url = options.url;
  req.headers = { ...options.headers };
  process.nextTick(() => {
    if (options.body !== undefined) {
      req.emit("data", Buffer.from(options.body));
    }
    req.emit("end");
  });
  return req;
}

function createMockRes() {
  let body = "";
  let statusCode = 0;
  let resolve: (value: { statusCode: number; body: string }) => void;
  const done = new Promise<{ statusCode: number; body: string }>((res) => {
    resolve = res;
  });

  const res = {
    setHeader() {},
    end(chunk?: string) {
      if (chunk) {
        body += chunk;
      }
      resolve({ statusCode, body });
    },
    get statusCode() {
      return statusCode;
    },
    set statusCode(code: number) {
      statusCode = code;
    }
  };

  return { res, done };
}

describe("http envelope", () => {
  it("wraps tools/call response with id", async () => {
    const handler = createHttpHandler({
      dispatch: async () => okResponse
    });

    const req = createMockReq({
      method: "POST",
      url: "/mcp",
      headers: {
        accept: ACCEPT_HEADER,
        "mcp-protocol-version": PROTOCOL_VERSION
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "tools/call",
        params: {
          name: "get_balance",
          arguments: {}
        }
      })
    });
    const res = createMockRes();
    handler(req as never, res.res as never);
    const result = await res.done;

    const payload = JSON.parse(result.body);
    expect(payload.id).toBe("1");
    expect(payload.result?.isError).toBe(false);
  });

  it("returns invalid params on unknown tool", async () => {
    const handler = createHttpHandler({
      dispatch: async () => okResponse
    });

    const req = createMockReq({
      method: "POST",
      url: "/mcp",
      headers: {
        accept: ACCEPT_HEADER,
        "mcp-protocol-version": PROTOCOL_VERSION
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "unknown_tool",
          arguments: {}
        }
      })
    });
    const res = createMockRes();
    handler(req as never, res.res as never);
    const result = await res.done;

    const payload = JSON.parse(result.body);
    expect(payload.error?.code).toBe(-32602);
  });
});
