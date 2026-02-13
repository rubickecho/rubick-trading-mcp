import { TOOL_REGISTRY } from "./tools/registry";
import type { McpResponse } from "./types";
import {
  isJsonRpcRequest,
  isJsonRpcResponse,
  makeJsonRpcError,
  makeJsonRpcResult,
  type JsonRpcId,
  type JsonRpcRequest,
  type JsonRpcResponse
} from "./jsonrpc";

export const SUPPORTED_PROTOCOL_VERSION = "2025-11-25";

export type ServerInfo = {
  name: string;
  version: string;
};

export type JsonRpcDispatcher = (toolName: string, input: unknown) => Promise<McpResponse<unknown>>;

export type JsonRpcHandlerResult =
  | { type: "response"; response: JsonRpcResponse }
  | { type: "accepted" };

export type JsonRpcHandlerOptions = {
  dispatch: JsonRpcDispatcher;
  serverInfo: ServerInfo;
  protocolVersion?: string;
};

const JSONRPC_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603
};

const TOOL_NAME_SET = new Set(TOOL_REGISTRY.map((tool) => tool.name));

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function toToolResult(result: McpResponse<unknown>) {
  const normalized = result.structuredContent?.normalized;
  const base: Record<string, unknown> = {
    content: result.content,
    isError: result.isError
  };
  if (normalized !== undefined && normalized !== null) {
    base.structuredContent = normalized;
  }
  if (result.meta?.requestId) {
    base._meta = { requestId: result.meta.requestId };
  }
  return base;
}

function parseJsonRpcId(request: JsonRpcRequest): JsonRpcId | null {
  return request.id === undefined ? null : request.id;
}

async function handleRequest(
  request: JsonRpcRequest,
  options: JsonRpcHandlerOptions
): Promise<JsonRpcHandlerResult> {
  const id = parseJsonRpcId(request);
  const protocolVersion = options.protocolVersion ?? SUPPORTED_PROTOCOL_VERSION;

  switch (request.method) {
    case "initialize": {
      if (id === null) {
        return { type: "accepted" };
      }
      const requestId: JsonRpcId = id;
      if (!isObject(request.params)) {
        return {
          type: "response",
          response: makeJsonRpcError(requestId, JSONRPC_ERRORS.INVALID_PARAMS, "Invalid params")
        };
      }
      const requestedVersion = request.params.protocolVersion;
      if (typeof requestedVersion !== "string") {
        return {
          type: "response",
          response: makeJsonRpcError(requestId, JSONRPC_ERRORS.INVALID_PARAMS, "Invalid params")
        };
      }
      return {
        type: "response",
        response: makeJsonRpcResult(requestId, {
          protocolVersion,
          capabilities: {
            tools: {
              listChanged: false
            }
          },
          serverInfo: options.serverInfo
        })
      };
    }
    case "notifications/initialized":
      return { type: "accepted" };
    case "ping": {
      if (id === null) {
        return { type: "accepted" };
      }
      const requestId: JsonRpcId = id;
      return {
        type: "response",
        response: makeJsonRpcResult(requestId, {})
      };
    }
    case "tools/list": {
      if (id === null) {
        return { type: "accepted" };
      }
      const requestId: JsonRpcId = id;
      if (request.params !== undefined && !isObject(request.params)) {
        return {
          type: "response",
          response: makeJsonRpcError(requestId, JSONRPC_ERRORS.INVALID_PARAMS, "Invalid params")
        };
      }
      return {
        type: "response",
        response: makeJsonRpcResult(requestId, {
          tools: TOOL_REGISTRY.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            outputSchema: tool.outputSchema
          }))
        })
      };
    }
    case "tools/call": {
      if (id === null) {
        return { type: "accepted" };
      }
      const requestId: JsonRpcId = id;
      if (!isObject(request.params)) {
        return {
          type: "response",
          response: makeJsonRpcError(requestId, JSONRPC_ERRORS.INVALID_PARAMS, "Invalid params")
        };
      }
      if (request.params.task !== undefined) {
        return {
          type: "response",
          response: makeJsonRpcError(requestId, JSONRPC_ERRORS.METHOD_NOT_FOUND, "Tasks not supported")
        };
      }
      const name = request.params.name;
      if (typeof name !== "string") {
        return {
          type: "response",
          response: makeJsonRpcError(requestId, JSONRPC_ERRORS.INVALID_PARAMS, "Invalid params")
        };
      }
      if (!TOOL_NAME_SET.has(name)) {
        return {
          type: "response",
          response: makeJsonRpcError(requestId, JSONRPC_ERRORS.INVALID_PARAMS, `Unknown tool: ${name}`)
        };
      }
      const args = request.params.arguments;
      if (args !== undefined && !isObject(args)) {
        return {
          type: "response",
          response: makeJsonRpcError(requestId, JSONRPC_ERRORS.INVALID_PARAMS, "Invalid params")
        };
      }
      try {
        const result = await options.dispatch(name, args ?? {});
        return {
          type: "response",
          response: makeJsonRpcResult(requestId, toToolResult(result))
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Internal error";
        return {
          type: "response",
          response: makeJsonRpcError(requestId, JSONRPC_ERRORS.INTERNAL_ERROR, message)
        };
      }
    }
    default: {
      if (id === null) {
        return { type: "accepted" };
      }
      const requestId: JsonRpcId = id;
      return {
        type: "response",
        response: makeJsonRpcError(requestId, JSONRPC_ERRORS.METHOD_NOT_FOUND, "Method not found")
      };
    }
  }
}

export async function handleJsonRpcMessage(
  payload: unknown,
  options: JsonRpcHandlerOptions
): Promise<JsonRpcHandlerResult> {
  if (Array.isArray(payload)) {
    return {
      type: "response",
      response: makeJsonRpcError(null, JSONRPC_ERRORS.INVALID_REQUEST, "Invalid Request")
    };
  }
  if (isJsonRpcResponse(payload)) {
    return { type: "accepted" };
  }
  if (!isJsonRpcRequest(payload)) {
    return {
      type: "response",
      response: makeJsonRpcError(null, JSONRPC_ERRORS.INVALID_REQUEST, "Invalid Request")
    };
  }
  return handleRequest(payload, options);
}
