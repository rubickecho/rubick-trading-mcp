import { describe, expect, it } from "vitest";
import { createFetchClient } from "@rubick-trading-mcp/core-utils";
import {
  BalanceSchema,
  PositionsSchema,
  normalizeHyperliquidBalance,
  normalizeHyperliquidPositions
} from "@rubick-trading-mcp/core-schema";
import { getBalance, getPositions, getPendingOrders, getHistoryOrders } from "../src/provider";

const hasEnv = Boolean(process.env.HYPERLIQUID_USER);
const describeHl = hasEnv ? describe : describe.skip;

describeHl("hyperliquid integration", () => {
  it(
    "fetches account endpoints",
    async () => {
      const client = createFetchClient({
        timeoutMs: 10000,
        proxyUrl: process.env.HYPERLIQUID_PROXY_URL ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY
      });

      const params = { extra: { user: process.env.HYPERLIQUID_USER as string } };

      const rawBalance = await getBalance({ client }, params);
      const rawPositions = await getPositions({ client }, params);
      const pending = await getPendingOrders({ client }, params);
      const history = await getHistoryOrders({ client }, params);

      const normalizedBalance = normalizeHyperliquidBalance(rawBalance as never);
      const normalizedPositions = normalizeHyperliquidPositions(rawPositions as never);

      expect(() => BalanceSchema.parse(normalizedBalance)).not.toThrow();
      expect(() => PositionsSchema.parse(normalizedPositions)).not.toThrow();
      expect(Array.isArray(pending)).toBe(true);
      expect(Array.isArray(history)).toBe(true);
    },
    20000
  );
});
