# Hyperliquid 鉴权与签名（官方）

只读 info 接口：
- POST https://api.hyperliquid.xyz/info
- 账户数据（持仓、挂单、成交）使用 `type` + `user` 地址查询
- 官方 info 文档未要求 API key 或签名

签名（未来写操作）
- 官方签名文档：
  https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/hyperliquid-signing

备注：
- 以官方文档为准确认 payload 结构与限制。
