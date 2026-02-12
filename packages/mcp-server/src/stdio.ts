import readline from "node:readline";
import type { McpResponse } from "./types";

export type StdioDispatcher = (toolName: string, input: unknown) => Promise<McpResponse<unknown>>;

type StdioRequest = {
  id?: string;
  tool?: string;
  input?: unknown;
};

type StdioEnvelope = {
  id?: string;
  result?: McpResponse<unknown>;
  error?: string;
};

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
      return JSON.stringify({ error: "invalid json" } satisfies StdioEnvelope);
    }
    if (!payload.tool) {
      return JSON.stringify({ id: payload.id, error: "tool is required" } satisfies StdioEnvelope);
    }
    const result = await dispatch(payload.tool, payload.input ?? {});
    return JSON.stringify({ id: payload.id, result } satisfies StdioEnvelope);
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
