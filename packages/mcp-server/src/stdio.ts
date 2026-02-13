import readline from "node:readline";
import type { McpResponse } from "./types";
import { handleJsonRpcMessage, SUPPORTED_PROTOCOL_VERSION, type JsonRpcDispatcher, type ServerInfo } from "./protocol";
import { makeJsonRpcError } from "./jsonrpc";

export type StdioDispatcher = (toolName: string, input: unknown) => Promise<McpResponse<unknown>>;

export function createStdioResponder(
  dispatch: StdioDispatcher,
  options?: { serverInfo?: ServerInfo; protocolVersion?: string }
) {
  const serverInfo: ServerInfo = options?.serverInfo ?? { name: "rubick-trading-mcp", version: "0.1.0" };
  const protocolVersion = options?.protocolVersion ?? SUPPORTED_PROTOCOL_VERSION;
  const handler: JsonRpcDispatcher = dispatch;

  return async (line: string): Promise<string | null> => {
    const trimmed = line.trim();
    if (!trimmed) {
      return null;
    }
    let payload: unknown;
    try {
      payload = JSON.parse(trimmed);
    } catch {
      return JSON.stringify(makeJsonRpcError(null, -32700, "Parse error"));
    }
    const result = await handleJsonRpcMessage(payload, {
      dispatch: handler,
      serverInfo,
      protocolVersion
    });
    if (result.type === "accepted") {
      return null;
    }
    return JSON.stringify(result.response);
  };
}

export function startStdioServer(dispatch: StdioDispatcher, options?: { serverInfo?: ServerInfo; protocolVersion?: string }) {
  const respond = createStdioResponder(dispatch, options);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  rl.on("line", async (line) => {
    const response = await respond(line);
    if (response) {
      process.stdout.write(response + "\n");
    }
  });
}
