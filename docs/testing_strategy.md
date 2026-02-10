# 测试策略方案

目标
- 在不依赖真实资金的前提下，保证每个功能/模块可测试、可回归。
- 单元/契约/集成分层，默认跑快、稳定；需要密钥的测试单独触发。

------------------------------------------------------------
分层测试
------------------------------------------------------------

1. 单元测试（Unit）
- 覆盖纯函数与转换逻辑：
  - core-utils/auth/*（签名）
  - core-schema/normalizer/*（raw -> normalized）
  - 参数校验与输入处理
- 不触网、无外部依赖，速度快。

2. 契约测试（Contract）
- 基于官方文档字段的 fixture（静态 JSON）
- 断言 raw -> normalized 是否符合 outputSchema
- 覆盖缺失字段、边界数值、类型转换

3. 集成测试（Integration）
- 走真实 HTTP 请求，但使用测试/模拟环境
- 每个 provider 覆盖最小 happy-path：
  - get_balance / get_positions / get_pending_orders / get_history_orders
- 仅在 CI 手动触发或本地显式触发（需要 API key）

------------------------------------------------------------
模块级测试建议
------------------------------------------------------------

A. core-utils/auth
- OKX：固定 timestamp + method + path + body -> 断言签名
- Binance：固定 query/body -> 断言签名
- Hyperliquid：当前只读 info 无签名；未来写操作可补签名测试

B. core-schema/normalizer
- 每交易所/每工具用 fixture 测试
- 强制校验 normalized 是否符合 schema

C. provider 层
- 使用 HTTP mock（nock / msw）
- 断言请求拼接：URL/method/headers/query/body
- 断言 raw 响应原样透传

D. mcp-server
- 工具注册完整性测试
- 路由测试（exchange -> provider）
- 输出结构测试（content + structuredContent + outputSchema + isError）

------------------------------------------------------------
Fixture 规范建议
------------------------------------------------------------

目录结构建议：
```
tests/fixtures/
  okx/
    balance.json
    positions.json
  binance_usdm/
    balance.json
    positions.json
  hyperliquid/
    clearinghouse_state.json
```

要求：
- fixture 必须与官方文档字段一致
- 禁止人工随意扩展字段

------------------------------------------------------------
CI 建议
------------------------------------------------------------

- 默认运行：Unit + Contract
- 手动触发：Integration（需要 API key）
- 测试 key 存放在 CI Secret，禁止提交到仓库

------------------------------------------------------------
设计约束（必须遵守）
------------------------------------------------------------
- provider 方法必须可注入 HTTP client（便于 mock）
- normalizer 必须是纯函数
- MCP 层必须可分层测试（注册/路由/输出）

