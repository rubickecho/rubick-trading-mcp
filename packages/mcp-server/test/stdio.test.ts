import { describe, expect, it } from "vitest";
import { createStdioResponder } from "../src/stdio";

const dispatch = async () => ({
  content: [{ type: "text", text: "ok" }],
  structuredContent: { raw: {}, normalized: {} },
  outputSchema: {},
  isError: false
});

describe("stdio responder", () => {
  it("returns error on invalid json", async () => {
    const responder = createStdioResponder(dispatch);
    const response = await responder("{");
    const parsed = JSON.parse(response ?? "{}");
    expect(parsed.error?.code).toBe(-32700);
  });

  it("returns result with id", async () => {
    const responder = createStdioResponder(dispatch);
    const response = await responder(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "tools/call",
        params: {
          name: "get_balance",
          arguments: {}
        }
      })
    );
    const parsed = JSON.parse(response ?? "{}");
    expect(parsed.id).toBe("1");
    expect(parsed.result?.isError).toBe(false);
  });
});
