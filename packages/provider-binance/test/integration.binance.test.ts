import { describe, expect, it } from "vitest";
import { createFetchClient } from "@rubick-trading-mcp/core-utils";
import {
  BalanceSchema,
  PositionsSchema,
  PendingOrdersSchema,
  HistoryOrdersSchema,
  normalizeBinanceBalance,
  normalizeBinancePositions,
  normalizeBinancePendingOrders,
  normalizeBinanceHistoryOrders
} from "@rubick-trading-mcp/core-schema";
import { getBalance, getPositions, getPendingOrders, getHistoryOrders } from "../src/provider";

const hasEnv = Boolean(process.env.BINANCE_API_KEY && process.env.BINANCE_API_SECRET);
const describeBinance = hasEnv ? describe : describe.skip;

describeBinance("binance integration", () => {
  it(
    "fetches account endpoints",
    async () => {
      const client = createFetchClient({
        timeoutMs: 20000
      });

      const options = {
        client,
        credentials: {
          apiKey: process.env.BINANCE_API_KEY as string,
          apiSecret: process.env.BINANCE_API_SECRET as string
        }
      };

      const symbol = process.env.BINANCE_SYMBOL ?? "BTC/USDT";
      const now = Date.now();
      const since = now - 24 * 60 * 60 * 1000;

      const balance = await getBalance(options, { extra: { recvWindow: 5000 } });
      const positions = await getPositions(options, { symbol, extra: { recvWindow: 5000 } });
      const pending = await getPendingOrders(options, { symbol, extra: { recvWindow: 5000 } });
      const history = await getHistoryOrders(options, {
        symbol,
        limit: 10,
        since,
        end: now,
        extra: { recvWindow: 5000 }
      });

      expect(Array.isArray(balance)).toBe(true);
      expect(Array.isArray(positions)).toBe(true);
      expect(Array.isArray(pending)).toBe(true);
      expect(Array.isArray(history)).toBe(true);

      const normalizedBalance = normalizeBinanceBalance(balance as never);
      const normalizedPositions = normalizeBinancePositions(positions as never);
      const normalizedPending = normalizeBinancePendingOrders(pending as never);
      const normalizedHistory = normalizeBinanceHistoryOrders(history as never);

      expect(() => BalanceSchema.parse(normalizedBalance)).not.toThrow();
      expect(() => PositionsSchema.parse(normalizedPositions)).not.toThrow();
      expect(() => PendingOrdersSchema.parse(normalizedPending)).not.toThrow();
      expect(() => HistoryOrdersSchema.parse(normalizedHistory)).not.toThrow();
    },
    30000
  );
});
