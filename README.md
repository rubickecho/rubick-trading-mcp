# RUBICK TRADING MCP SERVER

## Inspector (HTTP)

This project uses the MCP HTTP server for Inspector debugging.

### 1) Build

```bash
pnpm -r run build
```

### 2) Start the HTTP server

```bash
set -a; . ./.env; set +a
node scripts/mcp-http.cjs

# or
sh ./scripts/mcp-inspector-http-start.sh
```

By default it listens on `http://127.0.0.1:8787/mcp`. You can override the port with `MCP_PORT`.

### 3) Launch Inspector

```bash
pnpm mcp:inspector
```

### 4) Configure Inspector

- Transport Type: `Streamable HTTP`
- URL: `http://127.0.0.1:8787/mcp`

After connecting, open the Tools panel and call `get_balance`, `get_positions`, etc.
