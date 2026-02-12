import { describe, expect, it } from "vitest";
import { createFetchClient } from "@rubick-trading-mcp/core-utils";
import { getBalance, getPositions } from "../src/provider";

const hasEnv = Boolean(process.env.BINANCE_API_KEY && process.env.BINANCE_API_SECRET);
const describeBinance = hasEnv ? describe : describe.skip;

describeBinance("binance integration", () => {
  it(
    "fetches balance and positions",
    async () => {
      const client = createFetchClient({
        timeoutMs: 10000,
        proxyUrl: process.env.BINANCE_PROXY_URL ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY
      });

      const balance = await getBalance(
        {
          client,
          credentials: {
            apiKey: process.env.BINANCE_API_KEY as string,
            apiSecret: process.env.BINANCE_API_SECRET as string
          }
        },
        {}
      );

      const positions = await getPositions(
        {
          client,
          credentials: {
            apiKey: process.env.BINANCE_API_KEY as string,
            apiSecret: process.env.BINANCE_API_SECRET as string
          }
        },
        {}
      );

      expect(Array.isArray(balance)).toBe(true);
      expect(Array.isArray(positions)).toBe(true);
    },
    20000
  );
});
