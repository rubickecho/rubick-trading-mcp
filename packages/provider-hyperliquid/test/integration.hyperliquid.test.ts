import { describe, expect, it } from "vitest";
import { createFetchClient } from "@rubick-trading-mcp/core-utils";
import { BalanceSchema, PositionsSchema, normalizeHyperliquidBalance, normalizeHyperliquidPositions } from "@rubick-trading-mcp/core-schema";
import { getBalance, getPositions } from "../src/provider";

const hasEnv = Boolean(process.env.HYPERLIQUID_USER);
const describeHl = hasEnv ? describe : describe.skip;

describeHl("hyperliquid integration", () => {
  it(
    "fetches clearinghouse state",
    async () => {
      const client = createFetchClient({
        timeoutMs: 10000,
        proxyUrl: process.env.HYPERLIQUID_PROXY_URL ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY
      });

      const rawBalance = await getBalance(
        { client },
        { extra: { user: process.env.HYPERLIQUID_USER as string } }
      );
      const rawPositions = await getPositions(
        { client },
        { extra: { user: process.env.HYPERLIQUID_USER as string } }
      );

      const normalizedBalance = normalizeHyperliquidBalance(rawBalance as never);
      const normalizedPositions = normalizeHyperliquidPositions(rawPositions as never);

      expect(() => BalanceSchema.parse(normalizedBalance)).not.toThrow();
      expect(() => PositionsSchema.parse(normalizedPositions)).not.toThrow();
    },
    20000
  );
});
