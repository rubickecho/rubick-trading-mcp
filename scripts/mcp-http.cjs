const { createHttpServer } = require("../packages/mcp-server/dist/http/server");
const { createToolDispatcher } = require("../packages/mcp-server/dist/server");

const dispatch = createToolDispatcher({
  okx: {
    credentials: {
      apiKey: process.env.OKX_API_KEY ?? "",
      apiSecret: process.env.OKX_API_SECRET ?? "",
      passphrase: process.env.OKX_API_PASSPHRASE ?? ""
    }
  },
  binance: {
    credentials: {
      apiKey: process.env.BINANCE_API_KEY ?? "",
      apiSecret: process.env.BINANCE_API_SECRET ?? ""
    }
  },
  hyperliquid: {}
});

const server = createHttpServer({ dispatch });
const port = process.env.MCP_PORT ? Number(process.env.MCP_PORT) : 8787;
server.listen(port, "127.0.0.1", () => {
  console.log(`MCP HTTP server listening at http://127.0.0.1:${port}/mcp`);
});
