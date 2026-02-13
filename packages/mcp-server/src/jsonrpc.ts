export type JsonRpcId = string | number;

export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: unknown;
};

export type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: JsonRpcId | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
};

type JsonRpcResponseLike = {
  jsonrpc?: string;
  id?: unknown;
  result?: unknown;
  error?: unknown;
  method?: unknown;
};

export function isJsonRpcRequest(value: unknown): value is JsonRpcRequest {
  if (!value || typeof value !== "object") {
    return false;
  }
  const obj = value as { jsonrpc?: string; method?: string; id?: unknown };
  if (obj.jsonrpc !== "2.0" || typeof obj.method !== "string") {
    return false;
  }
  if (obj.id === undefined) {
    return true;
  }
  return typeof obj.id === "string" || typeof obj.id === "number";
}

export function isJsonRpcResponse(value: unknown): value is JsonRpcResponse {
  if (!value || typeof value !== "object") {
    return false;
  }
  const obj = value as JsonRpcResponseLike;
  if (obj.jsonrpc !== "2.0") {
    return false;
  }
  if (obj.method !== undefined) {
    return false;
  }
  const hasResult = Object.prototype.hasOwnProperty.call(obj, "result");
  const hasError = Object.prototype.hasOwnProperty.call(obj, "error");
  if (!hasResult && !hasError) {
    return false;
  }
  if (obj.id === null) {
    return true;
  }
  return typeof obj.id === "string" || typeof obj.id === "number";
}

export function makeJsonRpcError(
  id: JsonRpcId | null,
  code: number,
  message: string,
  data?: unknown
): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      data
    }
  };
}

export function makeJsonRpcResult(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    result
  };
}
