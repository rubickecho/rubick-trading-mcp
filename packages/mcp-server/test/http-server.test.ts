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
  const headers: Record<string, string> = {};
  let statusCode = 0;
  let resolve: (value: { statusCode: number; body: string; headers: Record<string, string> }) => void;
  const done = new Promise<{ statusCode: number; body: string; headers: Record<string, string> }>((res) => {
    resolve = res;
  });

  const res = {
    setHeader(key: string, value: string) {
      headers[key] = value;
    },
    write(chunk?: string) {
      if (chunk) {
        body += chunk;
      }
    },
    end(chunk?: string) {
      if (chunk) {
        body += chunk;
      }
      resolve({ statusCode, body, headers });
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

describe("http handler", () => {
  it("serves GET /mcp as SSE", async () => {
    const handler = createHttpHandler({
      dispatch: async () => okResponse
    });

    const req = createMockReq({
      method: "GET",
      url: "/mcp",
      headers: {
        accept: "text/event-stream",
        "mcp-protocol-version": PROTOCOL_VERSION
      }
    });
    const res = createMockRes();
    handler(req as never, res.res as never);
    const result = await res.done;
    expect(result.statusCode).toBe(200);
    expect(result.headers["Content-Type"]).toBe("text/event-stream");
  });

  it("handles initialize and tools/list", async () => {
    const handler = createHttpHandler({
      dispatch: async () => okResponse
    });

    const initReq = createMockReq({
      method: "POST",
      url: "/mcp",
      headers: {
        accept: ACCEPT_HEADER
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
    const initRes = createMockRes();
    handler(initReq as never, initRes.res as never);
    const initResult = await initRes.done;
    expect(initResult.statusCode).toBe(200);
    const initJson = JSON.parse(initResult.body);
    expect(initJson.result?.protocolVersion).toBe(PROTOCOL_VERSION);

    const listReq = createMockReq({
      method: "POST",
      url: "/mcp",
      headers: {
        accept: ACCEPT_HEADER,
        "mcp-protocol-version": PROTOCOL_VERSION
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list"
      })
    });
    const listRes = createMockRes();
    handler(listReq as never, listRes.res as never);
    const listResult = await listRes.done;
    expect(listResult.statusCode).toBe(200);
    const listJson = JSON.parse(listResult.body);
    expect(Array.isArray(listJson.result?.tools)).toBe(true);
  });

  it("returns 400 on invalid json", async () => {
    const handler = createHttpHandler({
      dispatch: async () => okResponse
    });

    const req = createMockReq({
      method: "POST",
      url: "/mcp",
      headers: {
        accept: ACCEPT_HEADER
      },
      body: "{"
    });
    const res = createMockRes();
    handler(req as never, res.res as never);
    const result = await res.done;
    expect(result.statusCode).toBe(400);
  });
});
