import type http from "node:http";
import { TOOL_REGISTRY } from "../tools/registry";
import type { McpResponse } from "../types";

export type Dispatcher = (toolName: string, input: unknown) => Promise<McpResponse<unknown>>;

export type HttpServerOptions = {
  dispatch: Dispatcher;
};

function jsonResponse(res: http.ServerResponse, statusCode: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Length", Buffer.byteLength(payload));
  res.end(payload);
}

async function handleCall(req: http.IncomingMessage, res: http.ServerResponse, dispatch: Dispatcher) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", async () => {
    let payload: { tool?: string; input?: unknown };
    try {
      payload = JSON.parse(body || "{}");
    } catch {
      jsonResponse(res, 400, { error: "invalid json" });
      return;
    }

    if (!payload.tool) {
      jsonResponse(res, 400, { error: "tool is required" });
      return;
    }

    const result = await dispatch(payload.tool, payload.input ?? {});
    jsonResponse(res, 200, result);
  });
}

export function createHttpHandler(options: HttpServerOptions): http.RequestListener {
  return async (req, res) => {
    if (!req.url || !req.method) {
      jsonResponse(res, 404, { error: "not found" });
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      jsonResponse(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && req.url === "/tools") {
      jsonResponse(res, 200, { tools: TOOL_REGISTRY });
      return;
    }

    if (req.method === "POST" && req.url === "/call") {
      await handleCall(req, res, options.dispatch);
      return;
    }

    jsonResponse(res, 404, { error: "not found" });
  };
}
