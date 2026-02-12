import { describe, expect, it } from "vitest";
import { buildUrl } from "../src/http/utils";

describe("http utils", () => {
  it("buildUrl appends query params", () => {
    const url = buildUrl("https://example.com", "/api", { a: 1, b: "test" });
    expect(url).toBe("https://example.com/api?a=1&b=test");
  });

  it("buildUrl skips undefined params", () => {
    const url = buildUrl("https://example.com", "/api", { a: 1, b: undefined, c: null });
    expect(url).toBe("https://example.com/api?a=1");
  });

  it("buildUrl handles absolute url", () => {
    const url = buildUrl("https://example.com", "https://alt.com/endpoint", { q: "x" });
    expect(url).toBe("https://alt.com/endpoint?q=x");
  });
});
