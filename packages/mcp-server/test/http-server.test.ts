import { describe, expect, it } from "vitest";
import { createHttpHandler } from "../src/http/handler";
import { EventEmitter } from "node:events";

const okResponse = {
  content: [{ type: "text", text: "ok" }],
  structuredContent: { raw: {}, normalized: {} },
  outputSchema: {},
  isError: false
};

function createMockReq(options: { method: string; url: string; body?: string }) {
  const req = new EventEmitter() as EventEmitter & { method: string; url: string; headers: Record<string, string> };
  req.method = options.method;
  req.url = options.url;
  req.headers = { "content-type": "application/json" };
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
  it("serves tools and call", async () => {
    const handler = createHttpHandler({
      dispatch: async () => okResponse
    });

    const toolsReq = createMockReq({ method: "GET", url: "/tools" });
    const tools = createMockRes();
    handler(toolsReq as never, tools.res as never);
    const toolsResult = await tools.done;
    expect(toolsResult.statusCode).toBe(200);
    const toolsJson = JSON.parse(toolsResult.body);
    expect(Array.isArray(toolsJson.tools)).toBe(true);

    const callReq = createMockReq({ method: "POST", url: "/call", body: JSON.stringify({ tool: "get_balance" }) });
    const call = createMockRes();
    handler(callReq as never, call.res as never);
    const callResult = await call.done;
    expect(callResult.statusCode).toBe(200);
    const callJson = JSON.parse(callResult.body);
    expect(callJson.result?.isError).toBe(false);
  });

  it("returns 400 on invalid json", async () => {
    const handler = createHttpHandler({
      dispatch: async () => okResponse
    });

    const callReq = createMockReq({ method: "POST", url: "/call", body: "{" });
    const call = createMockRes();
    handler(callReq as never, call.res as never);
    const callResult = await call.done;
    expect(callResult.statusCode).toBe(400);
  });
});
