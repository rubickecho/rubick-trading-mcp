import { describe, expect, it } from "vitest";
import { TOOL_REGISTRY } from "../src/tools/registry";

const toolNames = new Set([
  "get_balance",
  "get_positions",
  "get_pending_orders",
  "get_history_orders",
  "get_ticker",
  "get_candles",
  "get_order_book",
  "get_funding_rate",
  "get_open_interest"
]);

describe("tool registry", () => {
  it("contains all tools with schemas", () => {
    for (const tool of TOOL_REGISTRY) {
      expect(toolNames.has(tool.name)).toBe(true);
      expect(tool.inputSchema).toBeDefined();
      expect(tool.outputSchema).toBeDefined();
    }
  });
});
