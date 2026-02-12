# 集成测试指南

目标
- 验证 OKX / Binance USD-M / Hyperliquid 的真实请求可用性
- 只读模式，不涉及下单或资金操作

准备
- 在根目录创建 `.env`（已由 Codex 生成）
- 或复制 `.env.example` 并填入各交易所凭据

必需变量
- OKX
  - OKX_API_KEY
  - OKX_API_SECRET
  - OKX_API_PASSPHRASE
- Binance USD-M
  - BINANCE_API_KEY
  - BINANCE_API_SECRET
- Hyperliquid
  - HYPERLIQUID_USER

可选变量
- OKX_PROXY_URL
- BINANCE_PROXY_URL
- HYPERLIQUID_PROXY_URL

执行
- 运行全部集成测试
  - `pnpm test:integration`
- 单独执行某一交易所
  - OKX: `pnpm test -- --run packages/provider-okx/test/integration.okx.test.ts`
  - Binance: `pnpm test -- --run packages/provider-binance/test/integration.binance.test.ts`
  - Hyperliquid: `pnpm test -- --run packages/provider-hyperliquid/test/integration.hyperliquid.test.ts`

注意
- 集成测试默认只在对应环境变量存在时运行，否则自动跳过
- 真实环境下请确保 API key 为只读权限
