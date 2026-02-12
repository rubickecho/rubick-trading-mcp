import { describe, expect, it } from "vitest";
import { createFetchClient } from "@rubick-trading-mcp/core-utils";
import { getBalance } from "../src/provider";

const hasOkxEnv = Boolean(
  process.env.OKX_API_KEY && process.env.OKX_API_SECRET && process.env.OKX_API_PASSPHRASE
);

const describeOkx = hasOkxEnv ? describe : describe.skip;

describeOkx("okx integration", () => {
  it(
    "fetches balance",
    async () => {
      const client = createFetchClient({
        timeoutMs: 10000,
        proxyUrl: process.env.OKX_PROXY_URL ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY
      });

      const res = await getBalance(
        {
          client,
          credentials: {
            apiKey: process.env.OKX_API_KEY as string,
            apiSecret: process.env.OKX_API_SECRET as string,
            passphrase: process.env.OKX_API_PASSPHRASE as string
          }
        },
        {}
      );

      expect(res).toBeTruthy();
      expect(res.code).toBe("0");
      expect(Array.isArray(res.data)).toBe(true);
    },
    20000
  );
});
