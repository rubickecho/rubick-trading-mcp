# 实施计划方案（交付给 Coding Agent）

## 0. 首要任务：先阅读方案设计文档
请先阅读 `new_design_docs/index.md`，按索引依次了解方案设计与约束。
重点阅读：
- account_tool_input_matrix.md（参数矩阵）
- raw_to_normalized_mapping.md（字段映射）
- normalized_schema_account.md（统一账户 Schema）
- normalized_schema_market_okx.md（OKX 行情 Schema）
- mcp_server_tools_registry.md（工具注册清单）
- okx_auth.md / binance_usdm_auth.md / hyperliquid_auth.md（鉴权与签名）

> 重要：所有端点/字段/签名必须严格对照官方文档，不允许假设。

---

## 一、目标与范围
- 目标：构建统一的 MCP 数据层服务，提供账户数据与少量行情数据。
- 行情：仅 OKX（当前阶段低优先级）
- 账户：OKX + Binance USD‑M + Hyperliquid
- 本期不做持久化、不做分析（分析交由 agent skill）
- “U 本位”指稳定币本位（USDT/USDC）
  - OKX：优先 USDT 永续
  - Binance：USD‑M（USDT 本位）
  - Hyperliquid：USDC 本位

---

## 二、关键约束（必须遵守）
1. 严格按官方文档实现，不允许猜字段/猜参数
2. 工具输出必须符合 MCP 规范（content + structuredContent + outputSchema + isError）
3. Provider 只返回 raw，不做分析
4. 归一化在 core/normalizer 层
5. Monorepo 使用 pnpm
6. 只用官方 REST 接口（Node + TS），不引入 SDK

---

## 三、项目结构（monorepo）
```
packages/
  mcp-server/            # MCP入口（HTTP/STDIO）+ 工具注册
  core-schema/           # 统一 schema + zod/json schema
  core-utils/            # 签名、HTTP、限频、错误映射
  provider-okx/          # OKX REST 适配
  provider-binance/      # Binance USD‑M REST 适配
  provider-hyperliquid/  # Hyperliquid info 适配
```

---

## 四、工具清单
账户类（多交易所）
- get_balance
- get_positions
- get_pending_orders
- get_history_orders

行情类（OKX only）
- get_ticker
- get_candles
- get_order_book
- get_funding_rate
- get_open_interest（可选）

---

## 五、输出格式（MCP 标准）
```json
{
  "content": [{ "type": "text", "text": "..." }],
  "structuredContent": {
    "raw": { ... },
    "normalized": { ... }
  },
  "outputSchema": { ... },
  "isError": false
}
```
- 错误：`isError = true`，`content.text` 写明错误原因

---

## 六、输入参数规范（关键差异）
详见 `account_tool_input_matrix.md`
- Binance `get_history_orders` 必须 `symbol`
- Hyperliquid 所有账户工具必须 `extra.user`
- OKX 支持 `instId` 过滤

---

## 七、Raw -> Normalized 映射
详见 `raw_to_normalized_mapping.md`
- 必须逐字段核对官方文档
- 不允许假设字段名

---

## 八、鉴权/签名
详见：
- okx_auth.md
- binance_usdm_auth.md
- hyperliquid_auth.md

---

## 九、执行步骤（建议顺序）
1. 搭建 monorepo / pnpm workspace（已完成）
2. core-utils（已完成）
   - HTTP 请求封装（统一超时/重试/限频）
   - OKX / Binance 签名工具
3. provider 层（已完成）
   - OKX / Binance USD‑M / Hyperliquid
   - 只返回 raw
4. core-schema / normalizer（已完成）
   - 账户 + OKX 行情 normalized schema + mapping
   - 兼容 Hyperliquid clearinghouseState 实际返回
5. mcp-server（已完成）
   - 工具注册
   - 路由到 provider
   - 归一化输出
   - HTTP/STDIO 入口
   - 输入校验
6. 联调（已完成）
   - OKX / Binance / Hyperliquid 集成测试已跑通
   - 新增 `pnpm test:integration` 脚本

---

## 十、重要文档位置
`new_design_docs/` 下：
- index.md（总览）
- account_tool_input_matrix.md（参数矩阵）
- raw_to_normalized_mapping.md（字段映射）
- normalized_schema_account.md（账户 schema）
- normalized_schema_market_okx.md（行情 schema）
- mcp_server_tools_registry.md（工具注册清单）
- okx_auth.md / binance_usdm_auth.md / hyperliquid_auth.md（鉴权与签名）
