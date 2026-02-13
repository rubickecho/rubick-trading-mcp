import type http from "node:http";
import { handleJsonRpcMessage, SUPPORTED_PROTOCOL_VERSION, type JsonRpcDispatcher, type ServerInfo } from "../protocol";
import { isJsonRpcRequest, makeJsonRpcError } from "../jsonrpc";

export type Dispatcher = JsonRpcDispatcher;

export type HttpServerOptions = {
  dispatch: Dispatcher;
  serverInfo?: ServerInfo;
  protocolVersion?: string;
  allowedOrigins?: string[];
  endpoint?: string;
};

const DEFAULT_ALLOWED_ORIGINS = new Set([
  "http://localhost",
  "http://127.0.0.1",
  "http://[::1]",
  "https://localhost",
  "https://127.0.0.1",
  "https://[::1]"
]);

function readHeader(value: string | string[] | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  return Array.isArray(value) ? value[0] : value;
}

function parseAccept(header: string | undefined): Set<string> {
  if (!header) {
    return new Set();
  }
  return new Set(
    header
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .map((part) => part.split(";")[0])
      .filter(Boolean)
  );
}

function jsonResponse(res: http.ServerResponse, statusCode: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Length", Buffer.byteLength(payload));
  res.end(payload);
}

function noContent(res: http.ServerResponse, statusCode: number) {
  res.statusCode = statusCode;
  res.end();
}

function parseAllowedOrigins(allowedOrigins?: string[]): Set<string> {
  if (allowedOrigins) {
    return new Set(allowedOrigins.map((origin) => origin.trim()).filter(Boolean));
  }
  const envOrigins = process.env.MCP_ALLOWED_ORIGINS;
  if (envOrigins) {
    return new Set(envOrigins.split(",").map((origin) => origin.trim()).filter(Boolean));
  }
  return new Set(DEFAULT_ALLOWED_ORIGINS);
}

function isOriginAllowed(origin: string | undefined, allowedOrigins: Set<string>): boolean {
  if (!origin) {
    return true;
  }
  if (allowedOrigins.size === 0) {
    return false;
  }
  return allowedOrigins.has(origin);
}

function isSupportedProtocol(headerVersion: string | undefined, protocolVersion: string): boolean {
  if (!headerVersion) {
    return false;
  }
  return headerVersion.trim() === protocolVersion;
}

async function readRequestBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", (error) => reject(error));
  });
}

export function createHttpHandler(options: HttpServerOptions): http.RequestListener {
  const endpoint = options.endpoint ?? "/mcp";
  const serverInfo: ServerInfo = options.serverInfo ?? { name: "rubick-trading-mcp", version: "0.1.0" };
  const protocolVersion = options.protocolVersion ?? SUPPORTED_PROTOCOL_VERSION;
  const allowedOrigins = parseAllowedOrigins(options.allowedOrigins);

  return async (req, res) => {
    if (!req.url || !req.method) {
      jsonResponse(res, 404, { error: "not found" });
      return;
    }

    const url = req.url.split("?")[0];
    if (url !== endpoint) {
      jsonResponse(res, 404, { error: "not found" });
      return;
    }

    const origin = readHeader(req.headers.origin);
    if (!isOriginAllowed(origin, allowedOrigins)) {
      jsonResponse(res, 403, { error: "origin not allowed" });
      return;
    }

    if (req.method === "GET") {
      const accept = parseAccept(readHeader(req.headers.accept));
      if (!accept.has("text/event-stream")) {
        jsonResponse(res, 406, { error: "accept must include text/event-stream" });
        return;
      }
      const headerVersion = readHeader(req.headers["mcp-protocol-version"]);
      if (!isSupportedProtocol(headerVersion, protocolVersion)) {
        jsonResponse(res, 400, { error: "invalid or missing MCP-Protocol-Version" });
        return;
      }
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.write("retry: 10000\n\n");
      res.end();
      return;
    }

    if (req.method === "POST") {
      const accept = parseAccept(readHeader(req.headers.accept));
      if (!accept.has("application/json") || !accept.has("text/event-stream")) {
        jsonResponse(res, 406, { error: "accept must include application/json and text/event-stream" });
        return;
      }
      let payload: unknown;
      try {
        const body = await readRequestBody(req);
        payload = body ? JSON.parse(body) : {};
      } catch {
        jsonResponse(res, 400, makeJsonRpcError(null, -32700, "Parse error"));
        return;
      }

      const isInitializeRequest = isJsonRpcRequest(payload) && payload.method === "initialize";
      const headerVersion = readHeader(req.headers["mcp-protocol-version"]);
      if (headerVersion && !isSupportedProtocol(headerVersion, protocolVersion)) {
        jsonResponse(res, 400, { error: "invalid MCP-Protocol-Version" });
        return;
      }
      if (!isInitializeRequest && !isSupportedProtocol(headerVersion, protocolVersion)) {
        jsonResponse(res, 400, { error: "missing MCP-Protocol-Version" });
        return;
      }

      const result = await handleJsonRpcMessage(payload, {
        dispatch: options.dispatch,
        serverInfo,
        protocolVersion
      });

      if (result.type === "accepted") {
        noContent(res, 202);
        return;
      }
      jsonResponse(res, 200, result.response);
      return;
    }

    jsonResponse(res, 405, { error: "method not allowed" });
  };
}
