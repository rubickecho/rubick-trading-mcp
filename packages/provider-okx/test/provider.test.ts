import { describe, expect, it } from "vitest";
import type { HttpClient, HttpRequest, HttpResponse } from "@rubick-trading-mcp/core-utils";
import { getBalance } from "../src/provider";

function createMockClient(onRequest: (req: HttpRequest) => void): HttpClient {
  return {
    async request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>> {
      onRequest(req);
      return {
        status: 200,
        headers: {},
        data: {} as T,
        rawBody: "{}"
      };
    }
  };
}

describe("okx provider", () => {
  it("builds signed balance request", async () => {
    let captured: HttpRequest | undefined;
    const client = createMockClient((req) => {
      captured = req;
    });

    await getBalance(
      { client, credentials: { apiKey: "key", apiSecret: "secret", passphrase: "pass" }, baseUrl: "https://www.okx.com" },
      { symbol: "USDT" }
    );

    expect(captured?.method).toBe("GET");
    expect(captured?.url).toContain("/api/v5/account/balance");
    expect(captured?.headers?.["OK-ACCESS-KEY"]).toBe("key");
    expect(captured?.headers?.["OK-ACCESS-PASSPHRASE"]).toBe("pass");
  });
});
