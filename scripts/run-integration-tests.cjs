const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const idx = trimmed.indexOf("=");
    if (idx === -1) {
      continue;
    }
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const files = [
  "packages/provider-okx/test/integration.okx.test.ts",
  "packages/provider-binance/test/integration.binance.test.ts",
  "packages/provider-hyperliquid/test/integration.hyperliquid.test.ts"
];

const result = spawnSync("pnpm", ["exec", "vitest", "run", ...files], {
  stdio: "inherit",
  env: process.env
});

process.exit(result.status ?? 1);
