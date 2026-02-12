import readline from "node:readline";
import type { McpResponse, McpError, McpEnvelope } from "./types";

export type StdioDispatcher = (toolName: string, input: unknown) => Promise<McpResponse<unknown>>;

type StdioRequest = {
  id?: string;
  tool?: string;
  input?: unknown;
};

type StdioEnvelope = McpEnvelope;

export function createStdioResponder(dispatch: StdioDispatcher) {
  return async (line: string): Promise<string | null> => {
    const trimmed = line.trim();
    if (!trimmed) {
      return null;
    }
    let payload: StdioRequest;
    try {
      payload = JSON.parse(trimmed);
    } catch {
      const envelope: StdioEnvelope = {
        error: { code: "INVALID_INPUT", message: "invalid json" }
      };
      return JSON.stringify(envelope);
    }
    if (!payload.tool) {
      const envelope: StdioEnvelope = {
        id: payload.id,
        error: { code: "INVALID_INPUT", message: "tool is required" }
      };
      return JSON.stringify(envelope);
    }
    const result = await dispatch(payload.tool, payload.input ?? {});
    const envelope: StdioEnvelope = { id: payload.id, result };
    return JSON.stringify(envelope);
  };
}

export function startStdioServer(dispatch: StdioDispatcher) {
  const respond = createStdioResponder(dispatch);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  rl.on("line", async (line) => {
    const response = await respond(line);
    if (response) {
      process.stdout.write(response + "\n");
    }
  });
}
