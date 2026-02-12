import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@rubick-trading-mcp/core-utils": resolve(__dirname, "packages/core-utils/src/index.ts"),
      "@rubick-trading-mcp/core-schema": resolve(__dirname, "packages/core-schema/src/index.ts"),
      "@rubick-trading-mcp/provider-okx": resolve(__dirname, "packages/provider-okx/src/index.ts"),
      "@rubick-trading-mcp/provider-binance": resolve(__dirname, "packages/provider-binance/src/index.ts"),
      "@rubick-trading-mcp/provider-hyperliquid": resolve(__dirname, "packages/provider-hyperliquid/src/index.ts"),
      "@rubick-trading-mcp/mcp-server": resolve(__dirname, "packages/mcp-server/src/index.ts")
    }
  },
  test: {
    environment: "node",
    include: ["packages/*/test/**/*.test.ts"],
    coverage: {
      enabled: false
    }
  }
});
