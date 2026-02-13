import { describe, expect, it } from "vitest";
import { createFetchClient } from "@rubick-trading-mcp/core-utils";
import {
  getBalance,
  getPositions,
  getPendingOrders,
  getHistoryOrders,
  getTicker,
  getCandles,
  getOrderBook,
  getFundingRate,
  getOpenInterest
} from "../src/provider";

const hasOkxEnv = Boolean(
  process.env.OKX_API_KEY && process.env.OKX_API_SECRET && process.env.OKX_API_PASSPHRASE
);

const describeOkx = hasOkxEnv ? describe : describe.skip;

describeOkx("okx integration", () => {
  const instId = process.env.OKX_INST_ID ?? "BTC-USDT-SWAP";
  const instType = process.env.OKX_INST_TYPE ?? "SWAP";

  it(
    "fetches account endpoints",
    async () => {
      const client = createFetchClient({
        timeoutMs: 20000
      });

      const baseOptions = {
        client,
        credentials: {
          apiKey: process.env.OKX_API_KEY as string,
          apiSecret: process.env.OKX_API_SECRET as string,
          passphrase: process.env.OKX_API_PASSPHRASE as string
        }
      };

      const balance = await getBalance(baseOptions, {});
      const positions = await getPositions(baseOptions, { instId });
      const pending = await getPendingOrders(baseOptions, { instId, extra: { instType } });
      const history = await getHistoryOrders(baseOptions, { instId, limit: 10, extra: { instType } });

      expect(balance.code).toBe("0");
      expect(Array.isArray(balance.data)).toBe(true);
      expect(positions.code).toBe("0");
      expect(pending.code).toBe("0");
      expect(history.code).toBe("0");
    },
    30000
  );

  it(
    "fetches market endpoints",
    async () => {
      const client = createFetchClient({
        timeoutMs: 20000
      });

      const ticker = await getTicker({ client, credentials: { apiKey: "", apiSecret: "", passphrase: "" } }, { instId });
      const candles = await getCandles({ client, credentials: { apiKey: "", apiSecret: "", passphrase: "" } }, { instId, bar: "1m", limit: 5 });
      const orderBook = await getOrderBook({ client, credentials: { apiKey: "", apiSecret: "", passphrase: "" } }, { instId, depth: 5 });
      const funding = await getFundingRate({ client, credentials: { apiKey: "", apiSecret: "", passphrase: "" } }, { instId });
      const openInterest = await getOpenInterest({ client, credentials: { apiKey: "", apiSecret: "", passphrase: "" } }, { instId });

      expect(ticker.code).toBe("0");
      expect(Array.isArray(ticker.data)).toBe(true);
      expect(candles.code).toBe("0");
      expect(orderBook.code).toBe("0");
      expect(funding.code).toBe("0");
      expect(openInterest.code).toBe("0");
    },
    30000
  );
});
