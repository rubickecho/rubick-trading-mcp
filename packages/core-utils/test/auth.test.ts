import crypto from "crypto";
import { describe, expect, it } from "vitest";
import { buildBinanceHeaders, buildOkxHeaders, signBinance, signOkx } from "../src/auth";

describe("auth signing", () => {
  it("signOkx matches expected base64", () => {
    const timestamp = "2020-12-08T09:08:57.715Z";
    const method = "GET";
    const requestPath = "/api/v5/account/balance";
    const body = "";
    const apiSecret = "secret";
    const prehash = `${timestamp}${method}${requestPath}${body}`;
    const expected = crypto.createHmac("sha256", apiSecret).update(prehash).digest("base64");
    const actual = signOkx({ timestamp, method, requestPath, body, apiSecret });
    expect(actual).toBe(expected);
  });

  it("buildOkxHeaders includes required headers", () => {
    const headers = buildOkxHeaders({
      credentials: { apiKey: "key", apiSecret: "secret", passphrase: "pass" },
      timestamp: "2020-12-08T09:08:57.715Z",
      method: "GET",
      requestPath: "/api/v5/account/balance"
    });
    expect(headers["OK-ACCESS-KEY"]).toBe("key");
    expect(headers["OK-ACCESS-PASSPHRASE"]).toBe("pass");
    expect(headers["OK-ACCESS-SIGN"]).toBeTypeOf("string");
    expect(headers["OK-ACCESS-TIMESTAMP"]).toBe("2020-12-08T09:08:57.715Z");
  });

  it("signBinance matches expected hex", () => {
    const queryString = "symbol=BTCUSDT&timestamp=1700000000000";
    const apiSecret = "secret";
    const expected = crypto.createHmac("sha256", apiSecret).update(queryString).digest("hex");
    expect(signBinance(queryString, apiSecret)).toBe(expected);
  });

  it("buildBinanceHeaders includes API key", () => {
    const headers = buildBinanceHeaders({ apiKey: "key", apiSecret: "secret" });
    expect(headers["X-MBX-APIKEY"]).toBe("key");
  });
});
