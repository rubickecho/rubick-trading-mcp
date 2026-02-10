# Hyperliquid 账户数据端点（官方）

基础
- Info 入口：`POST https://api.hyperliquid.xyz/info`
  - 官方：https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint

账户 / 持仓
- `type: "clearinghouseState"`
  - 返回账户摘要及持仓（`assetPositions`）
  - 官方：https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals

订单
- `type: "openOrders"`
  - 返回当前委托
  - 官方：https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint

成交 / 历史
- `type: "userFills"` 或 `type: "userFillsByTime"`
  - 返回成交历史（带数量/时间范围语义）
  - 官方：https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint

备注
- info 入口支持多种 `type`，以官方文档为准确认 payload 结构与限制。
- 时间范围查询存在上限（见官方说明）。
