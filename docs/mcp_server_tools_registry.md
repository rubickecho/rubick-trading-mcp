# MCP Server 工具注册清单（账户 + OKX 行情）

范围
- 账户数据：OKX + Binance USD-M + Hyperliquid
- 行情数据：仅 OKX
- 本期无持久化、无分析

统一输出格式（MCP）
- content: [{ type: 'text', text: '...' }]
- structuredContent: { raw: ..., normalized: ... }
- outputSchema: ...
- isError: boolean

================================================================================
账户工具（多交易所）
================================================================================

1) get_balance
- 输入：account_tool_input_params.md
- Providers：okx, binance, hyperliquid
- 输出：normalized_schema_account.md#get_balance
- 备注：
  - hyperliquid 必须 extra.user
  - binance 需要 timestamp + signature

2) get_positions
- 输入：account_tool_input_params.md
- Providers：okx, binance, hyperliquid
- 输出：normalized_schema_account.md#get_positions
- 备注：
  - okx 支持 instId 过滤
  - binance 支持 symbol 过滤
  - hyperliquid 需客户端过滤

3) get_pending_orders
- 输入：account_tool_input_params.md
- Providers：okx, binance, hyperliquid
- 输出：normalized_schema_account.md#get_pending_orders
- 备注：
  - okx 使用 orders-pending
  - binance 使用 openOrders
  - hyperliquid 使用 openOrders（info）

4) get_history_orders
- 输入：account_tool_input_params.md
- Providers：okx, binance, hyperliquid
- 输出：normalized_schema_account.md#get_history_orders
- 备注：
  - binance 必须 symbol
  - hyperliquid 使用 userFills / userFillsByTime

================================================================================
行情工具（OKX only）
================================================================================

5) get_ticker
- 输入：instId 或 symbol
- Provider：okx
- 输出：OKX 行情 normalized schema（待定义）

6) get_candles
- 输入：instId 或 symbol + bar + limit
- Provider：okx
- 输出：OKX 行情 normalized schema（待定义）

7) get_order_book
- 输入：instId 或 symbol + depth
- Provider：okx
- 输出：OKX 行情 normalized schema（待定义）

8) get_funding_rate
- 输入：instId 或 symbol
- Provider：okx
- 输出：OKX 行情 normalized schema（待定义）

9) get_open_interest（可选）
- 输入：instId 或 symbol
- Provider：okx
- 输出：OKX 行情 normalized schema（待定义）

================================================================================
服务端路由（职责）
================================================================================
- 根据 input.exchange 选择 provider
- 行情工具必须强制 exchange == 'okx'
- 校验必填参数
- 调用 provider 获取 raw
- 归一化为 structuredContent.normalized
- 返回 MCP 响应
