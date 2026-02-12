import { describe, expect, it } from "vitest";
import { createFetchClient } from "@rubick-trading-mcp/core-utils";
import { getBalance, getPositions, getPendingOrders, getHistoryOrders } from "../src/provider";

const hasEnv = Boolean(process.env.BINANCE_API_KEY && process.env.BINANCE_API_SECRET);
const describeBinance = hasEnv ? describe : describe.skip;

describeBinance("binance integration", () => {
  it(
    "fetches account endpoints",
    async () => {
      const client = createFetchClient({
        timeoutMs: 10000,
        proxyUrl: process.env.BINANCE_PROXY_URL ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY
      });

      const options = {
        client,
        credentials: {
          apiKey: process.env.BINANCE_API_KEY as string,
          apiSecret: process.env.BINANCE_API_SECRET as string
        }
      };

      const symbol = process.env.BINANCE_SYMBOL ?? "BTC/USDT";

      const balance = await getBalance(options, {});
      const positions = await getPositions(options, {});
      const pending = await getPendingOrders(options, { symbol });
      const history = await getHistoryOrders(options, { symbol, limit: 10 });

      expect(Array.isArray(balance)).toBe(true);
      expect(Array.isArray(positions)).toBe(true);
      expect(Array.isArray(pending)).toBe(true);
      expect(Array.isArray(history)).toBe(true);
    },
    20000
  );
});
