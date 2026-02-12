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
    expect(parsed.error?.code).toBe("INVALID_INPUT");
  });

  it("returns result with id", async () => {
    const responder = createStdioResponder(dispatch);
    const response = await responder(JSON.stringify({ id: "1", tool: "get_balance" }));
    const parsed = JSON.parse(response ?? "{}");
    expect(parsed.id).toBe("1");
    expect(parsed.result?.isError).toBe(false);
  });
});
