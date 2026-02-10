# Provider 契约（账户数据）

范围
- OKX / Binance USD-M / Hyperliquid
- 仅稳定币本位
- Provider 返回 raw 数据（不做分析）

通用契约签名（TypeScript-ish）

provider.getBalance(params) -> RawBalanceResponse
provider.getPositions(params) -> RawPositionsResponse
provider.getPendingOrders(params) -> RawOpenOrdersResponse
provider.getHistoryOrders(params) -> RawOrderHistoryResponse

通用输入参数
- symbol?: string       // 统一 symbol，例如 BTC/USDT
- instId?: string       // 交易所 instId，例如 BTC-USDT-SWAP
- marginCcy?: 'USDT' | 'USDC'
- since?: number        // ms 时间戳
- end?: number          // ms 时间戳（如支持）
- limit?: number
- cursor?: string
- extra?: Record<string, any> // 交易所专用参数

Provider 责任
- 按官方文档完成鉴权/签名
- 组装请求参数（query/body）
- 原始响应透传
- 标准错误映射（鉴权/参数/限频/服务端）

Provider 非责任
- 不做归一化
- 不做分析/策略
- 不做聚合

备注
- Hyperliquid info 端点使用 `type` + `user` 地址；Provider 需从 params 读取 `user`
- Binance USD-M 使用 fapi base URL，必须带 timestamp/signature
- OKX 使用 access headers 与 prehash 签名
