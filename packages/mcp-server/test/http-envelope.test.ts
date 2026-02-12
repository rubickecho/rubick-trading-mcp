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
  it("wraps response with id", async () => {
    const handler = createHttpHandler({
      dispatch: async () => okResponse
    });

    const req = createMockReq({ method: "POST", url: "/call", body: JSON.stringify({ id: "1", tool: "get_balance" }) });
    const res = createMockRes();
    handler(req as never, res.res as never);
    const result = await res.done;

    const payload = JSON.parse(result.body);
    expect(payload.id).toBe("1");
    expect(payload.result?.isError).toBe(false);
  });

  it("returns envelope error on invalid json", async () => {
    const handler = createHttpHandler({
      dispatch: async () => okResponse
    });

    const req = createMockReq({ method: "POST", url: "/call", body: "{" });
    const res = createMockRes();
    handler(req as never, res.res as never);
    const result = await res.done;

    const payload = JSON.parse(result.body);
    expect(payload.error?.code).toBe("INVALID_INPUT");
  });
});
